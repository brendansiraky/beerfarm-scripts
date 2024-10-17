import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { Hono, HonoRequest } from 'hono'

import { saveLog } from './helpers/saveLog'
import {
    consignmentSchema,
    salesOrderSchema,
    purchaseOrderSchema,
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
        return c.json({ message: 'OK-V1' }, 200)
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
// TODO - Beerfarm update something in CC which we then need to read the status coming through in the purchaseorder webbook.
// We need to check if the status is REJECTED, then potentially fire off an email to beerfarm letting them know something was rejected.
app.post(
    '/webhooks/hook-purchaseorder',
    zValidator('json', purchaseOrderSchema.partial().passthrough()),
    async (c) => {
        const purchaseOrder = c.req.valid('json')
        saveLog(purchaseOrder, 'purchase')
        return c.json({ message: 'Received - Purchase Order' }, 202)
    }
)

// Webhook endpoint for sales orders
app.post(
    '/webhooks/hook-salesorder',
    zValidator('json', salesOrderSchema.partial().passthrough()),
    async (c) => {
        const salesOrder = c.req.valid('json')

        const tranIdFromCC = salesOrder.references?.customer
        const status = salesOrder?.status
        if (status && tranIdFromCC) {
            // 1. Receive the consignment

            // 2. Get the sales order id by the consignment customer
            const salesOrder = await getSalesOrderIdByTranId(tranIdFromCC)

            // 3. Update the sales order with the status from the salesorder change
            await updateSalesOrderByTranId(salesOrder.id, salesOrder.tranId, {
                custbody_status: status,
            })
        }

        saveLog(salesOrder, 'sales')
        return c.json({ message: 'Received - Sales Order' }, 202)
    }
)

// Start the server
serve({
    fetch: app.fetch,
    port: 3000,
})
