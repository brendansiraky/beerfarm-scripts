import { updateMultipleSalesOrders } from './updateMultipleSalesOrders'
import { getPendingOrdersByWarehouse } from 'src/api/netSuite'
import { searchCartonCloud } from '../api/cartonCloud'

export async function updatePendingSalesOrders() {
    // Query NetSuite for pending sales orders
    const warehouseOrders = await getPendingOrdersByWarehouse('salesOrder')

    if (!warehouseOrders) {
        console.log('No sales orders to process from NetSuite..')
        return
    }

    // Search CartonCloud for each warehouse's orders in parallel
    // Returns an array of arrays (one array per warehouse)
    const cartonCloudResults = await Promise.all(
        Object.values(warehouseOrders).map(({ config, transactionIds }) =>
            searchCartonCloud('outbound-orders', config, transactionIds)
        )
    )

    // Process CartonCloud results:
    // 1. Flatten array of arrays into single array
    // 2. Filter for orders that have a runsheet date
    // 3. Map to format needed for NetSuite update
    const ordersToUpdate = cartonCloudResults
        .flat()
        .filter((order) => order.status)
        .map((order) => ({
            transactionId: order.references.customer,
            updateData: {
                custbody_status: order.status,
            },
        }))

    // Update NetSuite if we found any orders with runsheet dates
    if (ordersToUpdate.length > 0) {
        return await updateMultipleSalesOrders(ordersToUpdate)
    } else {
        console.log('No orders found with runsheet dates to update')
        return []
    }
}
