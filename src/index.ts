import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { env } from 'hono/adapter'
import { Hono } from 'hono'
import path from 'path'
import fs from 'fs'

import {
    consignmentSchema,
    inboundOrderSchema,
    outboundOrderSchema,
} from './validation'
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

const saveLog = (data: any, type: 'consignment' | 'outbound' | 'inbound') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${type}-${timestamp}.json`
    const currentFilePath = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(currentFilePath)
    const logDir = path.join(currentDir, '..', 'logs', type)

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const filePath = path.join(logDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    console.log(
        `${type.charAt(0).toUpperCase() + type.slice(1)} log saved: ${filePath}`
    )
}

const app = new Hono<Env>()
app.use(logger())
app.use(authorizeHeaderToken)

app.post(
    '/webhook/hook-purchaseorder',
    // zValidator('json', outboundOrderSchema.partial().passthrough()),
    async (c) => {
        // const outboundOrder = c.req.valid('json')
        const outboundOrder = await c.req.json()
        console.log(
            'Received Outbound Order:',
            JSON.stringify(outboundOrder, null, 2)
        )
        saveLog(outboundOrder, 'outbound')
        return c.json({ message: 'Received - Purchase Order' }, 202)
    }
)

app.post(
    '/webhook/hook-consignment',
    // zValidator('json', consignmentSchema.partial().passthrough()),
    async (c) => {
        // const consignment = c.req.valid('json')
        const consignment = await c.req.json()
        console.log(
            'Received Consignment:',
            JSON.stringify(consignment, null, 2)
        )
        console.log('Saving consignment log...')
        saveLog(consignment, 'consignment')
        return c.json({ message: 'Received - Consignment' }, 202)
    }
)

app.post(
    '/webhook/hook-inboundorder',
    // zValidator('json', inboundOrderSchema.partial().passthrough()),
    async (c) => {
        // const inboundOrder = c.req.valid('json')
        const inboundOrder = await c.req.json()
        console.log(
            'Received Inbound Order:',
            JSON.stringify(inboundOrder, null, 2)
        )
        console.log('Saving inbound order log...')
        saveLog(inboundOrder, 'inbound')
        return c.json({ message: 'Received - Inbound Order' }, 202)
    }
)

serve({
    fetch: app.fetch,
    port: 8080,
})
