import { getConsignmentOrders } from './getConsignmentOrders.js'

export async function getCustomerByCustomerId(customerRef) {
    if (!customerRef) {
        throw new Error('Customer reference is required')
    }

    try {
        const logs = await getConsignmentOrders()
        return logs.find((log) => log.customerReference === customerRef) || null
    } catch (error) {
        throw new Error(`Failed to find customer: ${error.message}`)
    }
}
