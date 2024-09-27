import { zValidator } from '@hono/zod-validator'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'
import { Hono } from 'hono'
import { consignmentSchema, outboundOrderSchema } from './validation'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

type Env = {
    Bindings: {
        CC_API_KEY: string
    }
}

const authorizeHeaderToken = createMiddleware(async (c, next) => {
    const { CC_API_KEY } = env(c)
    const authHeader = c.req.header('Authorization')

    if (authHeader !== CC_API_KEY) {
        return c.json({ message: 'not authorized' }, 401)
    }
    await next()
})

const saveConsignmentLog = (consignment: any) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `consignment-${timestamp}.json`
    const currentFilePath = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(currentFilePath)
    const logDir = path.join(currentDir, '..', 'logs')

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const filePath = path.join(logDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(consignment, null, 2))
    console.log(`Consignment log saved: ${filePath}`)
}

const app = new Hono<Env>()
app.use(logger())
app.use(authorizeHeaderToken)

app.post(
    '/webhook/hook-purchaseorder',
    zValidator('json', outboundOrderSchema.partial().passthrough()),
    async (c) => {
        const outboundOrder = c.req.valid('json')
        console.log(
            'Received Outbound Order:',
            JSON.stringify(outboundOrder, null, 2)
        )
        return c.json({ message: 'Received - Purchase Order' }, 202)
    }
)

app.post(
    '/webhook/hook-consignment',
    zValidator('json', consignmentSchema.partial().passthrough()),
    async (c) => {
        const consignment = c.req.valid('json')
        console.log(
            'Received Consignment:',
            JSON.stringify(consignment, null, 2)
        )
        console.log('Saving consignment log...')
        saveConsignmentLog(consignment)
        return c.json({ message: 'Received - Consignment' }, 202)
    }
)

serve({
    fetch: app.fetch,
    port: 8080,
})
