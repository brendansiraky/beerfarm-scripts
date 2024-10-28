import { getConsignmentOrders } from './getConsignmentOrders.js'

getConsignmentOrders()
    .then((logs) => console.log(logs))
    .catch((error) => console.error(error))
