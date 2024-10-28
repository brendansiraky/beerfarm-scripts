import { getCustomerByCustomerId } from './getCustomerByCustomerId.js'

// Get the customer reference from command line arguments
const customerRef = process.argv[2]

if (!customerRef) {
    console.error('Please provide a customer reference as an argument')
    process.exit(1)
}

getCustomerByCustomerId(customerRef)
    .then((result) => {
        if (result) {
            console.log('Found customer:', result)
        } else {
            console.log('Customer not found')
        }
    })
    .catch((error) => console.error(error))
