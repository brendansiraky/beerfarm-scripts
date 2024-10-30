import { updateSalesOrder } from '../api/netSuite'
import { SalesOrder } from '../api/types'

export async function updateMultipleSalesOrders(
    orders: {
        transactionId: string
        updateData: Partial<SalesOrder>
    }[]
) {
    console.log(`Starting batch update for ${orders.length} orders...`)
    const results: any[] = []

    for (let i = 0; i < orders.length; i++) {
        const { transactionId, updateData } = orders[i]
        console.log(
            `[${i + 1}/${orders.length}] Processing order ${transactionId}...`
        )
        try {
            const result = await updateSalesOrder(transactionId, updateData)
            console.log(
                `✅ [${i + 1}/${
                    orders.length
                }] Successfully updated order ${transactionId}`
            )
            results.push({
                transactionId,
                status: 'success',
                data: result,
            })
        } catch (error) {
            console.error(
                `❌ [${i + 1}/${
                    orders.length
                }] Failed to update order ${transactionId}:`,
                error.response.data
            )
            results.push({
                transactionId,
                status: 'error',
                error: error.message || 'Unknown error',
            })
            // Continue with next order instead of throwing
            continue
        }
    }

    console.log(
        `Batch update completed. Success: ${
            results.filter((r) => r.status === 'success').length
        }, Failed: ${results.filter((r) => r.status === 'error').length}`
    )
    return results
}

// const updates: {
//     transactionId: string
//     updateData: Partial<SalesOrder>
// }[] = [
//     {
//         transactionId: 'SO20849',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-31',
//             custbody_status: 'AWAITING_PICK_AND_PACK',
//         },
//     },
//     {
//         transactionId: 'SO20902',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-31',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20916',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-22',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20929',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-21',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20944',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-22',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20948',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-23',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20964',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-25',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20966',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-23',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO20967',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-23',
//             custbody_status: 'PACKED',
//         },
//     },
//     {
//         transactionId: 'SO20996',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-24',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21002',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-24',
//             custbody_status: 'PACKED',
//         },
//     },
//     {
//         transactionId: 'SO21041',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21042',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'AWAITING_PICK_AND_PACK',
//         },
//     },
//     {
//         transactionId: 'SO21043',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21044',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21045',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21046',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21048',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21049',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21050',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21052',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-31',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21055',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21085',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21086',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-30',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21111',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-31',
//             custbody_status: 'DISPATCHED',
//         },
//     },
//     {
//         transactionId: 'SO21158',
//         updateData: {
//             custbody_ce_estdeliverydate: '2024-10-31',
//             custbody_status: 'DISPATCHED',
//         },
//     },
// ]

// updateMultipleSalesOrders(updates).then((results) => console.log(results))
