import { zValidator } from '@hono/zod-validator'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { Hono } from 'hono'
import { z } from 'zod'

type Env = {
    Bindings: {
        CC_API_KEY: string
    }
}

const app = new Hono<Env>()
app.use(logger())

const validator = z.object({
    type: z.enum(['hook-salesorder', 'hook-purchaseorder', 'hook-consignment']),
})

app.post('/webhook/:type', zValidator('param', validator), async (c) => {
    const { CC_API_KEY } = env(c)
    const authHeader = c.req.header('Authorization')

    if (authHeader !== CC_API_KEY) {
        return c.json({ message: 'not authorized' }, 401)
    }

    const hookType = c.req.valid('param').type

    // Process webhook based on type
    switch (hookType) {
        case 'hook-salesorder':
            return c.json({ message: 'Received - Sales Order' }, 202)
        case 'hook-purchaseorder':
            return c.json({ message: 'Received - Purchase Order' }, 202)
        case 'hook-consignment':
            return c.json({ message: 'Received - Consignment' }, 202)
        default:
            return c.json({ message: 'Received - Unknown' }, 202)
    }
})

serve({
    fetch: app.fetch,
    port: 8000,
})
