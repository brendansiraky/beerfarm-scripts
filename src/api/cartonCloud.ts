import axios from 'axios'
import qs from 'qs'

import { Consignment, SalesOrder, PurchaseOrder } from '../validation'
import { WAREHOUSE_CONFIG } from './types'

export type CartonCloudOrderType = {
    consignments: { type: 'consignments'; response: Consignment }
    'outbound-orders': {
        type: 'outbound-orders'
        response: SalesOrder
    }
    'inbound-orders': {
        type: 'inbound-orders'
        response: PurchaseOrder
    }
}

type OrderType = keyof CartonCloudOrderType
type ResponseType<T extends OrderType> = CartonCloudOrderType[T]['response']

export async function searchCartonCloud<T extends OrderType>(
    orderType: T,
    warehouseConfig: WAREHOUSE_CONFIG,
    transactionIds: string[]
): Promise<ResponseType<T>[]> {
    console.log(`[CartonCloud] Starting search for ${orderType}`, {
        transactionIds,
    })
    const { tenantUUID, client_id, client_secret } = warehouseConfig
    const CARTON_CLOUD_AUTH_URL = 'https://api.cartoncloud.com/uaa/oauth/token'
    const CARTON_CLOUD_URL = `https://api.cartoncloud.com/tenants/${tenantUUID}/${orderType}/search`

    try {
        console.log('[CartonCloud] Requesting access token...')
        // Step 1: Get access token
        const tokenResponse = await axios.post(
            CARTON_CLOUD_AUTH_URL,
            qs.stringify({
                grant_type: 'client_credentials',
            }),
            {
                auth: {
                    username: client_id,
                    password: client_secret,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        const accessToken = tokenResponse.data.access_token
        console.log('[CartonCloud] Successfully obtained access token')

        const mappedCondition = transactionIds.map((id) => ({
            type: 'TextComparisonCondition',
            field: {
                type: 'ValueField',
                value: 'reference',
            },
            value: {
                type: 'ValueField',
                value: id,
            },
            method: 'EQUAL_TO',
        }))

        // Step 2: Search CartonCloud
        console.log(
            `[CartonCloud] Sending search request to ${CARTON_CLOUD_URL}`
        )
        const searchResponse = await axios.post(
            CARTON_CLOUD_URL,
            {
                condition: {
                    type: 'OrCondition',
                    conditions: mappedCondition,
                },
            },
            {
                headers: {
                    'Accept-Version': '1',
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        console.log(
            `[CartonCloud] Search complete. Found ${searchResponse.data.length} results`
        )

        return searchResponse.data
    } catch (error) {
        console.error('[CartonCloud] Error during search:', error)
        throw error
    }
}
