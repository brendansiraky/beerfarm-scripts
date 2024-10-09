import { SalesOrderDetailResponse, SalesOrderResponse } from './types'
import { buildQueryString } from '../helpers/buildQueryString'
import { saveLog } from '../helpers/saveLog'
import { netSuiteRequest } from './netsuite'

const SALES_ORDER_URL = `https://${process.env.NS_ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/record/v1/salesOrder`

export async function getSalesOrderIdByTranId(tranId: string) {
    const queryParams = {
        q: `tranid IS "${tranId}"`,
        limit: 1,
    }

    const URL_WITH_QUERY_PARAMS = `${SALES_ORDER_URL}${buildQueryString(
        queryParams
    )}`

    try {
        const response = await netSuiteRequest<SalesOrderResponse>(
            URL_WITH_QUERY_PARAMS
        )

        const NSSalesOrder = await getSalesOrder(response)
        return NSSalesOrder
    } catch (error) {
        throw error
    }
}

async function getSalesOrder(salesOrder: SalesOrderResponse) {
    const URL = `${SALES_ORDER_URL}/${salesOrder.items[0].id}`
    return await netSuiteRequest<SalesOrderDetailResponse>(URL)
}

export async function updateSalesOrderByTranId(
    id: string,
    tranId: string,
    updateData: Partial<SalesOrderDetailResponse>
) {
    const URL = `${SALES_ORDER_URL}/${id}`
    try {
        const response = await netSuiteRequest<SalesOrderDetailResponse>(
            URL,
            'PATCH',
            { ...updateData }
        )

        console.log('Sales order updated successfully:', response)
        saveLog(
            {
                id,
                tranId,
                updateData,
            },
            'salesOrderUpdate'
        )
        return response
    } catch (error) {
        saveLog(
            {
                id,
                tranId,
                updateData,
            },
            'salesOrderUpdateError'
        )
        throw error
    }
}
