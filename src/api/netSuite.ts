import axios, { AxiosResponse } from 'axios'

import { buildQueryString } from '../helpers/buildQueryString'
import { NETSUITE, WAREHOUSE_LOOKUP } from '../config'
import { getAuthHeader } from './oauth'
import {
    OrderResponse,
    SalesOrder,
    TransferOrder,
    WAREHOUSE_CONFIG,
} from './types'

export async function netSuiteRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PATCH' = 'GET',
    updateData?: any
) {
    const options: any = {
        headers: {
            Authorization: getAuthHeader(url, method),
            'Content-Type': 'application/json',
            prefer: 'transient',
        },
        method,
        url,
    }

    if (updateData) {
        options.data = updateData
    }

    try {
        const response: AxiosResponse<T> = await axios(options)
        return response.data
    } catch (error) {
        throw error
    }
}

// Generic function to get an order by transaction id
async function getOrderByTransactionId<T extends SalesOrder | TransferOrder>(
    baseUrl: string,
    queryParams: {
        q: string
        limit: number
    }
): Promise<T> {
    try {
        // Get the order response just the URL and query params
        const orderResponse = await netSuiteRequest<OrderResponse>(
            `${baseUrl}${buildQueryString(queryParams)}`
        )

        // Get the order by the id from the order response
        return await netSuiteRequest<T>(
            `${baseUrl}/${orderResponse.items[0].id}`
        )
    } catch (error) {
        throw error
    }
}

// Generic function to update an order
async function updateOrder<T>(url: string, updateData: Partial<T>) {
    try {
        return await netSuiteRequest<T>(url, 'PATCH', {
            ...updateData,
        })
    } catch (error) {
        throw error
    }
}

// Generic order update function
async function updateOrderByType<T extends SalesOrder | TransferOrder>(
    transactionId: string,
    updateData: Partial<T>,
    baseUrl: string
) {
    const order = await getOrderByTransactionId<T>(baseUrl, {
        q: `tranid IS "${transactionId}"`,
        limit: 1,
    })

    return await updateOrder<T>(`${baseUrl}/${order.id}`, { ...updateData })
}

export async function updateSalesOrder(
    transactionId: string,
    updateData: Partial<SalesOrder>
) {
    return updateOrderByType<SalesOrder>(
        transactionId,
        updateData,
        NETSUITE.SALES_ORDER_URL
    )
}

export async function updateTransferOrder(
    transactionId: string,
    updateData: Partial<TransferOrder>
) {
    return updateOrderByType<TransferOrder>(
        transactionId,
        updateData,
        NETSUITE.TRANSFER_ORDER_URL
    )
}

type QueryResponse = {
    items: {
        links: []
        name: string
        salesorderid: string
        trandate: string
        tranid: string
    }[]
}

export async function getPendingOrdersByWarehouse(
    type: 'consignment' | 'salesOrder'
) {
    const typeLookup = {
        consignment: {
            updateFieldName: 'custbody_ce_estdeliverydate',
        },
        salesOrder: {
            updateFieldName: 'custbody_status',
        },
    }

    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000 * 2
    const yesterday = new Date(Date.now() - ONE_DAY_IN_MS)
    const formattedDate = yesterday.toLocaleDateString('en-GB')

    try {
        // Query NetSuite for sales orders that:
        // - Have no estimated delivery date
        // - Were created after yesterday
        // Returns transaction ID, date, warehouse name, and sales order ID
        const response = await netSuiteRequest<QueryResponse>(
            `${NETSUITE.QUERY_URL}`,
            'POST',
            {
                q: `
                SELECT MIN(t.tranid) as tranid, 
                       MIN(t.trandate) as trandate, 
                       MIN(l.name) as name, 
                       MIN(s.id) as salesOrderId,
                       MIN(t.custbody_status) as salesstatus
                FROM transaction t
                    LEFT JOIN salesOrdered s
                    ON s.transaction = t.id
                    LEFT JOIN location l
                    ON l.id = s.location
                WHERE t.type = 'SalesOrd'
                AND t.trandate > '${formattedDate}'
                AND t.${typeLookup[type].updateFieldName} IS NULL
                GROUP BY t.tranid
                ORDER BY t.tranid
                `,
            }
        )
        // SO21169
        console.log(response)
        return

        // Group orders by warehouse and collect their transaction IDs
        // Creates an object like: { "Warehouse Name": { config: {...}, transactionIds: [...] } }
        const warehouseOrders = response.items.reduce((acc, item) => {
            const warehouse =
                WAREHOUSE_LOOKUP[item.name as keyof typeof WAREHOUSE_LOOKUP]
            if (warehouse) {
                if (!acc[item.name]) {
                    acc[item.name] = {
                        config: warehouse,
                        transactionIds: [],
                    }
                }
                acc[item.name].transactionIds.push(item.tranid)
            }
            return acc
        }, {} as Record<string, { config: WAREHOUSE_CONFIG; transactionIds: string[] }>)

        // Add logging for each warehouse's order count
        Object.entries(warehouseOrders).forEach(([warehouseName, data]) => {
            console.log(
                `${warehouseName}: ${data.transactionIds.length} orders found`
            )
        })

        return warehouseOrders
    } catch (error) {
        console.log({
            errorFromDoQuery: JSON.stringify(error, null, 2),
        })
    }
}
