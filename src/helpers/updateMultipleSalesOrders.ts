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
                (error as any).response.data
            )
            results.push({
                transactionId,
                status: 'error',
                error: (error as any)?.message || 'Unknown error',
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
//         transactionId: 'SO22664',
//         updateData: {
//             custbody_ce_estdeliverydate: '2025-01-09',
//             custbody_status: 'AWAITING_PICK_AND_PACK',
//         },
//     },
// ]

// updateMultipleSalesOrders(updates).then((results) => console.log(results))
