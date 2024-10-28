import { getSalesOrders } from './getSalesOrders.js'

// Get the customer reference from command line arguments
const customerRef = process.argv[2]

if (!customerRef) {
    console.error('Please provide a customer reference as an argument')
    process.exit(1)
}

export async function logSalesOrderById(customerRef) {
    if (!customerRef) {
        throw new Error('Customer reference is required')
    }

    try {
        const logs = await getSalesOrders()
        return logs.find((log) => log.customerReference === customerRef) || null
    } catch (error) {
        throw new Error(`Failed to find customer: ${error.message}`)
    }
}

logSalesOrderById(customerRef)
    .then((customer) => console.log(customer))
    .catch((error) => console.error(error))
