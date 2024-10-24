import { OrderResponse, SalesOrder, TransferOrder } from './types'
import { buildQueryString } from '../helpers/buildQueryString'
import { netSuiteRequest } from './netsuite'

const BASE_URL = `https://${process.env.NS_ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/record/v1`
const SALES_ORDER_URL = `${BASE_URL}/salesOrder`
const TRANSFER_ORDER_URL = `${BASE_URL}/transferOrder`

// Generic function to get an order by transaction id
async function getOrderByTransactionId<T extends SalesOrder | TransferOrder>(
    baseUrl: string,
    tranId: string
): Promise<T> {
    const queryParams = {
        q: `tranid IS "${tranId}"`,
        limit: 1,
    }

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
    const URL = `${url}`
    try {
        return await netSuiteRequest<T>(URL, 'PATCH', {
            ...updateData,
        })
    } catch (error) {
        throw error
    }
}

// Specific to sales order
export async function updateSalesOrder(
    transactionId: string,
    updateData: Partial<SalesOrder>
) {
    const salesOrder = await getOrderByTransactionId<SalesOrder>(
        SALES_ORDER_URL,
        transactionId
    )

    return await updateOrder<SalesOrder>(
        `${SALES_ORDER_URL}/${salesOrder.id}`,
        { ...updateData }
    )
}

// Specific to transfer order
export async function updateTransferOrder(
    transactionId: string,
    updateData: Partial<TransferOrder>
) {
    const transferOrder = await getOrderByTransactionId<TransferOrder>(
        TRANSFER_ORDER_URL,
        transactionId
    )

    return await updateOrder<TransferOrder>(
        `${TRANSFER_ORDER_URL}/${transferOrder.id}`,
        { ...updateData }
    )
}
