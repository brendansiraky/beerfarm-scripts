import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { Hono } from 'hono'

import {
    consignmentSchema,
    inboundOrderSchema,
    outboundOrderSchema,
} from './validation'
import {
    getSalesOrderIdByTranId,
    updateSalesOrderByTranId,
} from '../api/salesOrder'
import { saveLog } from './helpers/saveLog'

// Define environment type for type-safety
type Env = {
    Bindings: {
        CC_API_KEY: string
    }
}

// Middleware to authorize requests using a header token
const authorizeHeaderToken = createMiddleware(async (c, next) => {
    const { CC_API_KEY } = env(c)
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Invalid authorization header' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (token !== CC_API_KEY) {
        return c.json({ message: 'Not authorized' }, 401)
    }

    await next()
})

// Create a new Hono app instance
const app = new Hono<Env>()

// Apply middleware
app.use(logger())
app.use(authorizeHeaderToken)

// Health check endpoint
app.get('/health', (c) => c.json({ message: 'OK' }, 200))

// Webhook endpoint for consignments
app.post(
    '/webhooks/hook-consignment',
    zValidator('json', consignmentSchema.partial().passthrough()),
    async (c) => {
        const consignment = c.req.valid('json')
        const tranIdFromCC = consignment.references?.customer
        if (consignment.details?.runsheet?.date && tranIdFromCC) {
            // 1. Receive the consignment

            // 2. Get the sales order id by the consignment customer
            const salesOrder = await getSalesOrderIdByTranId(tranIdFromCC)

            // 3. Update the sales order with the consignment est delivery date
            // Add whichever updates to the sales order here.
            await updateSalesOrderByTranId(salesOrder.id, salesOrder.tranId, {
                custbody_ce_estdeliverydate: consignment.details.runsheet.date,
            })
        }

        saveLog(consignment, 'consignment')
        return c.json({ message: 'Received - Consignment' }, 202)
    }
)

// Webhook endpoint for purchase orders
app.post(
    '/webhooks/hook-purchaseorder',
    zValidator('json', outboundOrderSchema.partial().passthrough()),
    async (c) => {
        const outboundOrder = await c.req.json()
        saveLog(outboundOrder, 'outbound')
        return c.json({ message: 'Received - Purchase Order' }, 202)
    }
)

// Webhook endpoint for inbound orders
app.post(
    '/webhooks/hook-inboundorder',
    zValidator('json', inboundOrderSchema.partial().passthrough()),
    async (c) => {
        const inboundOrder = await c.req.json()
        saveLog(inboundOrder, 'inbound')
        return c.json({ message: 'Received - Inbound Order' }, 202)
    }
)

// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
})
