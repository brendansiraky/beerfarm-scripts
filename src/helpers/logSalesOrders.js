import { getSalesOrders } from './getSalesOrders.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

getSalesOrders(join(__dirname, '../../logs/sales-incoming'))
    .then((logs) => console.log(logs))
    .catch((error) => console.error(error))
