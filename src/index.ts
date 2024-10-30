import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { Hono, HonoRequest } from 'hono'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import cron from 'node-cron'

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
        saveLog(
            {
                request: c.req,
                authHeader,
                message: 'Invalid authorization header',
                body,
            },
            'auth-unauthorized'
        )
        return c.json({ message: 'Invalid authorization header' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (token !== CC_API_KEY) {
        return c.json({ message: 'Not authorized' }, 401)
    }

    saveLog(
        {
            request: c.req,
            authHeader,
            message: 'Authorized',
            body,
        },
        'auth-authorized'
    )

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
            consignment,
            `consignment-incoming-${consignment.references?.customer}`
        )

        try {
            const tranId = consignment?.references?.customer
            const consignmentDate = consignment?.details?.runsheet?.date

            if (consignmentDate && tranId) {
                await updateSalesOrder(tranId, {
                    custbody_ce_estdeliverydate: consignmentDate,
                })
                saveLog(
                    {
                        consignment,
                        updated: {
                            custbody_ce_estdeliverydate: consignmentDate,
                        },
                    },
                    `consignment-updated-${consignment.references?.customer}`
                )
            }
            return c.json({ message: 'Received - Consignment' }, 202)
        } catch (error) {
            saveLog(
                {
                    consignment,
                    error,
                },
                `consignment-error-${consignment.references?.customer}`
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
        saveLog(purchase, `purchase-incoming-${purchase.references?.customer}`)

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
                saveLog(
                    {
                        purchase,
                        updated: {
                            custbody_3pl_status: status,
                        },
                    },
                    `purchase-updated-${purchase.references?.customer}`
                )
            }

            if (tranId && arrivalDate) {
                await updateTransferOrder(tranId, {
                    custbody_3pl_arrival: arrivalDate,
                })
                saveLog(
                    {
                        purchase,
                        updated: {
                            custbody_3pl_arrival: arrivalDate,
                        },
                    },
                    `purchase-updated-${purchase.references?.customer}`
                )
            }

            return c.json({ message: 'Received - Purchase Order' }, 202)
        } catch (error) {
            saveLog(
                {
                    purchaseOrder: purchase,
                    error,
                },
                `purchase-error-${purchase.references?.customer}`
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
        saveLog(salesOrder, `sales-incoming-${salesOrder.references?.customer}`)

        try {
            const tranId = salesOrder?.references?.customer
            const status = salesOrder?.status

            if (tranId && status) {
                await updateSalesOrder(tranId, {
                    custbody_status: status,
                })
                saveLog(
                    {
                        salesOrder,
                        updated: {
                            custbody_status: status,
                        },
                    },
                    `sales-updated-${salesOrder.references?.customer}`
                )
            }

            return c.json({ message: 'Received - Sales Order' }, 202)
        } catch (error) {
            saveLog(
                {
                    salesOrder: salesOrder,
                    error,
                },
                `sales-error-${salesOrder.references?.customer}`
            )
            return c.json({ message: 'Error - Purchase' }, 500)
        }
    }
)

// Schedule consignment updates every even hour
cron.schedule('0 0 */2 * * *', async () => {
    console.log('Running scheduled consignment updates...')
    try {
        await updatePendingConsignments()
    } catch (error) {
        console.error(
            'Error updating consignments, caught in the CRON job:',
            error
        )
    }
})

// Schedule sales order updates every odd hour
cron.schedule('0 0 1-23/2 * * *', async () => {
    console.log('Running scheduled sales order updates...')
    try {
        await updatePendingSalesOrders()
    } catch (error) {
        console.error(
            'Error updating sales orders, , caught in the CRON job:',
            error
        )
    }
})
// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
})
