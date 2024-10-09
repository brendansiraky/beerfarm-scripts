import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { Hono } from 'hono'

import { saveLog } from './helpers/saveLog'
import {
    consignmentSchema,
    inboundOrderSchema,
    outboundOrderSchema,
} from './validation'
import {
    getSalesOrderIdByTranId,
    updateSalesOrderByTranId,
} from './api/salesOrder'

// Define environment type for type-safety
type Env = {
    Bindings: {
        CC_API_KEY: string
    }
}

// Middleware to authorize requests using a header token
const authorizeHeaderToken = createMiddleware(async (c, next) => {
    if (c.req.path === '/health') {
        return c.json({ message: 'OK' }, 200)
    }

    const { CC_API_KEY } = env(c)
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        saveLog(
            {
                request: c.req,
                authHeader,
                message: 'Invalid authorization header',
            },
            'auth'
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
        },
        'auth'
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
        const outboundOrder = c.req.valid('json')
        saveLog(outboundOrder, 'outbound')
        return c.json({ message: 'Received - Purchase Order' }, 202)
    }
)

// Webhook endpoint for inbound orders
app.post(
    '/webhooks/hook-inboundorder',
    zValidator('json', inboundOrderSchema.partial().passthrough()),
    async (c) => {
        const inboundOrder = c.req.valid('json')
        saveLog(inboundOrder, 'inbound')
        return c.json({ message: 'Received - Inbound Order' }, 202)
    }
)

// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
    // hostname: '0.0.0.0',
})
