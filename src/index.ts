import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { Hono, HonoRequest } from 'hono'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import cron from 'node-cron'
import path from 'path'
import fs from 'fs'

import { updatePendingConsignments } from './helpers/updatePendingConsignments'
import { updatePendingSalesOrders } from './helpers/updatePendingSalesOrders'
import { updateSalesOrder, updateTransferOrder } from './api/netSuite'
import { saveLog } from './helpers/saveLog'
import {
    consignmentSchema,
    salesOrderSchema,
    purchaseOrderSchema,
} from './validation'

// Define environment type for type-safety
type Env = {
    Bindings: {
        CC_API_KEY: string
    }
}

const NO_ID = 'no-id-included'

// Middleware to authorize requests using a header token
const authorizeHeaderToken = createMiddleware(async (c, next) => {
    if (c.req.path === '/health') {
        return c.json({ message: 'OK-V3' }, 200)
    }

    const { CC_API_KEY } = env(c)
    const authHeader = c.req.header('Authorization')

    // Function to get valid JSON or return an empty object
    const getValidJSON = async (req: HonoRequest): Promise<object> => {
        try {
            return await req.json()
        } catch (error) {
            return {}
        }
    }

    const body = await getValidJSON(c.req)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        saveLog('auth-unauthorized', '000000', {
            request: c.req,
            authHeader,
            message: 'Invalid authorization header',
            body,
        })
        return c.json({ message: 'Invalid authorization header' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (token !== CC_API_KEY) {
        return c.json({ message: 'Not authorized' }, 401)
    }

    saveLog('auth-authorized', '000000', {
        request: c.req,
        authHeader,
        message: 'Authorized',
        body,
    })

    await next()
})

// Create a new Hono app instance
const app = new Hono<Env>()

// Apply middleware
app.use(logger())
app.use(authorizeHeaderToken)

// Webhook endpoint for consignments
app.post(
    '/webhooks/hook-consignment',
    zValidator('json', consignmentSchema.partial().passthrough()),
    async (c) => {
        const consignment = c.req.valid('json')

        saveLog(
            'consignment-incoming',
            consignment?.references?.customer || NO_ID,
            consignment
        )

        try {
            const tranId = consignment?.references?.customer
            const consignmentDate = consignment?.details?.runsheet?.date

            if (consignmentDate && tranId) {
                await updateSalesOrder(tranId, {
                    custbody_ce_estdeliverydate: consignmentDate,
                })
                saveLog(
                    'consignment-updated',
                    consignment?.references?.customer || NO_ID,
                    {
                        consignment,
                        updated: {
                            custbody_ce_estdeliverydate: consignmentDate,
                        },
                    }
                )
            }
            return c.json({ message: 'Received - Consignment' }, 202)
        } catch (error) {
            saveLog(
                'consignment-error',
                consignment?.references?.customer || NO_ID,
                {
                    consignment,
                    error,
                }
            )
            return c.json({ message: 'Error - Consignment' }, 500)
        }
    }
)

// Webhook endpoint for purchase orders
// TODO - We need to check if the status is REJECTED, then potentially fire off an email to beerfarm letting them know something was rejected.
app.post(
    '/webhooks/hook-purchaseorder',
    zValidator('json', purchaseOrderSchema.partial().passthrough()),
    async (c) => {
        const purchase = c.req.valid('json')

        saveLog(
            'purchase-incoming',
            purchase?.references?.customer?.split(' ')[0] || NO_ID,
            purchase
        )

        try {
            // For some reason, customer comes with "re-entry-2" attached to it: e.g "TO16750  re-entry-2"
            // We need to remove this before using it as the transaction ID
            const tranId = purchase?.references?.customer?.split(' ')[0]
            const status = purchase?.status
            const arrivalDate = purchase?.details?.arrivalDate

            // NOTE: Treating status and arrivalDate separately
            // we don't know if they are always both present.

            if (tranId && status) {
                await updateTransferOrder(tranId, {
                    custbody_3pl_status: status,
                })
                saveLog('purchase-updated', tranId || NO_ID, {
                    purchase,
                    updated: {
                        custbody_3pl_status: status,
                    },
                })
            }

            if (tranId && arrivalDate) {
                await updateTransferOrder(tranId, {
                    custbody_3pl_arrival: arrivalDate,
                })
                saveLog('purchase-updated', tranId || NO_ID, {
                    purchase,
                    updated: {
                        custbody_3pl_arrival: arrivalDate,
                    },
                })
            }

            return c.json({ message: 'Received - Purchase Order' }, 202)
        } catch (error) {
            saveLog(
                'purchase-error',
                purchase?.references?.customer?.split(' ')[0] || NO_ID,
                {
                    purchaseOrder: purchase,
                    error,
                }
            )

            return c.json({ message: 'Error - Purchase' }, 500)
        }
    }
)

// Webhook endpoint for sales orders
app.post(
    '/webhooks/hook-salesorder',
    zValidator('json', salesOrderSchema.partial().passthrough()),
    async (c) => {
        const salesOrder = c.req.valid('json')
        saveLog(
            'sales-incoming',
            salesOrder?.references?.customer || NO_ID,
            salesOrder
        )

        try {
            const tranId = salesOrder?.references?.customer
            const status = salesOrder?.status

            if (tranId && status) {
                await updateSalesOrder(tranId, {
                    custbody_status: status,
                })

                saveLog(
                    'sales-updated',
                    salesOrder?.references?.customer || NO_ID,
                    {
                        salesOrder,
                        updated: {
                            custbody_status: status,
                        },
                    }
                )
            }

            return c.json({ message: 'Received - Sales Order' }, 202)
        } catch (error) {
            saveLog('sales-error', salesOrder?.references?.customer || NO_ID, {
                salesOrder: salesOrder,
                error,
            })

            return c.json({ message: 'Error - Purchase' }, 500)
        }
    }
)

// Add endpoint to retrieve Carton Cloud API logs by transaction ID
app.get('/logs/carton-cloud-api-calls/:transactionId', async (c) => {
    const transactionId = c.req.param('transactionId')

    try {
        const projectRoot = process.cwd()
        const logDir = path.join(projectRoot, 'logs', 'carton-cloud-api-calls')

        if (!fs.existsSync(logDir)) {
            return c.json(
                {
                    message: 'No Carton Cloud API logs directory found',
                },
                404
            )
        }

        // Read all files in the directory
        const files = fs.readdirSync(logDir)
        const matchingLogs = []

        // Process each file to find those containing the transaction ID
        for (const file of files) {
            const filePath = path.join(logDir, file)
            const fileContent = fs.readFileSync(filePath, 'utf8')

            try {
                const logData = JSON.parse(fileContent)

                // Check if the transaction ID is in the transactionIds array
                if (
                    logData.data?.warehouse?.transactionIds?.includes(
                        transactionId
                    )
                ) {
                    matchingLogs.push({
                        filename: file,
                        data: logData,
                    })
                }
            } catch (error) {
                console.error(`Error parsing JSON from file ${file}:`, error)
                // Continue to next file if there's an error with this one
            }
        }

        if (matchingLogs.length === 0) {
            return c.json(
                {
                    message: `No Carton Cloud API logs found for transaction ID: ${transactionId}`,
                },
                404
            )
        }

        // Sort logs by timestamp (newest first)
        matchingLogs.sort((a, b) => {
            const timeA = new Date(a.data.savedAt).getTime()
            const timeB = new Date(b.data.savedAt).getTime()
            return timeB - timeA
        })

        return c.json(
            {
                transactionId,
                count: matchingLogs.length,
                logs: matchingLogs,
            },
            200
        )
    } catch (error) {
        console.error(`Error retrieving Carton Cloud API logs:`, error)
        return c.json(
            {
                message: `Error retrieving Carton Cloud API logs`,
                error: String(error),
            },
            500
        )
    }
})

// Add endpoint to retrieve all logs by order type and ID
app.get('/logs/:orderType/:id', async (c) => {
    const orderType = c.req.param('orderType')
    const id = c.req.param('id')

    // Validate the order type parameter
    const validOrderTypes = ['consignment', 'sales', 'purchase']

    if (!validOrderTypes.includes(orderType)) {
        return c.json(
            {
                message:
                    'Invalid order type. Must be one of: consignment, sales, purchase',
            },
            400
        )
    }

    try {
        const projectRoot = process.cwd()
        const logTypes = [
            `${orderType}-incoming`,
            `${orderType}-updated`,
            `${orderType}-error`,
        ]
        const allLogs = []

        for (const type of logTypes) {
            const logDir = path.join(projectRoot, 'logs', type)

            if (!fs.existsSync(logDir)) {
                continue // Skip if directory doesn't exist
            }

            // Read all files in the directory
            const files = fs.readdirSync(logDir)

            // Filter files that start with the provided ID
            const matchingFiles = files.filter((file) =>
                file.startsWith(`${id}-`)
            )

            // Process each matching file
            for (const file of matchingFiles) {
                const filePath = path.join(logDir, file)
                const fileContent = fs.readFileSync(filePath, 'utf8')
                const logData = JSON.parse(fileContent)

                allLogs.push({
                    id,
                    type,
                    filename: file,
                    data: logData,
                })
            }
        }

        if (allLogs.length === 0) {
            return c.json(
                {
                    message: `No ${orderType} logs found for the specified ID`,
                },
                404
            )
        }

        // Sort all logs by timestamp (newest first)
        allLogs.sort((a, b) => {
            const timeA = new Date(a.data.savedAt).getTime()
            const timeB = new Date(b.data.savedAt).getTime()
            return timeB - timeA
        })

        return c.json(
            {
                id,
                orderType,
                count: allLogs.length,
                logs: allLogs,
            },
            200
        )
    } catch (error) {
        console.error(`Error retrieving ${orderType} logs:`, error)
        return c.json(
            {
                message: `Error retrieving ${orderType} logs`,
                error: String(error),
            },
            500
        )
    }
})

// Schedule consignment updates every even hour between 8am and 6pm
cron.schedule('0 0 8,10,12,14,16,18 * * *', async () => {
    const now = new Date()
    console.log(
        `Running scheduled consignment updates... [${now.toLocaleString()}]`
    )
    try {
        await updatePendingConsignments()
    } catch (error) {
        console.error(
            'Error updating consignments, caught in the CRON job:',
            error
        )
    }
})

// Schedule sales order updates every odd hour between 7am and 5pm
cron.schedule('0 0 7,9,11,13,15,17 * * *', async () => {
    const now = new Date()
    console.log(
        `Running scheduled sales order updates... [${now.toLocaleString()}]`
    )
    try {
        await updatePendingSalesOrders()
    } catch (error) {
        console.error(
            'Error updating sales orders, caught in the CRON job:',
            error
        )
    }
})

// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
})
