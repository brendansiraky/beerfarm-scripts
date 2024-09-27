import { z } from 'zod'

const addressSchema = z.object({
    companyName: z.string(),
    contactName: z.string().optional(),
    address1: z.string(),
    suburb: z.string(),
    state: z.object({
        name: z.string(),
        code: z.string(),
    }),
    postcode: z.string(),
    country: z.object({
        name: z.string(),
        iso2Code: z.string(),
        iso3Code: z.string(),
    }),
    location: z.object({
        lat: z.string(),
        lon: z.string(),
    }),
    enabled: z.boolean(),
    approved: z.boolean(),
    draft: z.boolean(),
    starred: z.boolean(),
    references: z.object({
        numericId: z.string(),
    }),
    id: z.string(),
})

const outboundOrderItemSchema = z.object({
    details: z.object({
        product: z.object({
            customer: z.object({
                enabled: z.boolean(),
                name: z.string(),
                id: z.string(),
            }),
            name: z.string(),
            references: z.object({
                code: z.string(),
            }),
            id: z.string(),
        }),
        unitOfMeasure: z.object({
            type: z.string(),
            name: z.string(),
        }),
    }),
    type: z.string(),
    measures: z.object({
        quantity: z.number(),
    }),
    references: z.object({
        numericId: z.string(),
    }),
    properties: z.object({
        sop_custom_field_1: z.string(),
        sop_custom_field_2: z.string(),
        sop_custom_field_3: z.string(),
        batchNumber: z.string(),
        expiryDate: z.string(),
    }),
    id: z.string(),
})

export const outboundOrderSchema = z.object({
    details: z.object({
        urgent: z.boolean(),
        invoiceValue: z.object({
            amount: z.number(),
            currency: z.string(),
        }),
        collect: z.object({
            address: addressSchema,
        }),
        deliver: z.object({
            method: z.object({
                type: z.string(),
            }),
            address: addressSchema,
            instructions: z.string(),
        }),
    }),
    items: z.array(outboundOrderItemSchema),
    type: z.string(),
    status: z.string(),
    customer: z.object({
        enabled: z.boolean(),
        name: z.string(),
        id: z.string(),
    }),
    warehouse: z.object({
        enabled: z.boolean(),
        name: z.string(),
        id: z.string(),
    }),
    version: z.number(),
    references: z.object({
        customer: z.string(),
        numericId: z.string(),
    }),
    id: z.string(),
})

export const consignmentSchema = z.object({
    details: z.object({
        manifest: z.object({
            id: z.string().uuid(),
        }),
        type: z.string(),
        authorityToLeave: z.boolean(),
        runsheet: z.object({
            date: z.string(),
            name: z.string(),
            id: z.string().uuid(),
        }),
        deliveryRun: z.object({
            warehouse: z.object({
                enabled: z.boolean(),
                name: z.string(),
                id: z.string().uuid(),
            }),
            name: z.string(),
            id: z.string().uuid(),
        }),
        collect: z.object({
            address: addressSchema,
        }),
        deliver: z.object({
            address: addressSchema,
            instructions: z.string(),
        }),
    }),
    areChargesEditable: z.boolean(),
    source: z.string(),
    type: z.string(),
    status: z.string(),
    customer: z.object({
        enabled: z.boolean(),
        name: z.string(),
        id: z.string().uuid(),
    }),
    warehouse: z.object({
        enabled: z.boolean(),
        name: z.string(),
        id: z.string().uuid(),
    }),
    user: z.object({
        name: z.string(),
        id: z.string().uuid(),
    }),
    createDate: z.string(),
    lastModified: z.string(),
    measures: z.object({
        distance: z.object({
            value: z.number(),
            unit: z.string(),
        }),
        hours: z.number(),
    }),
    references: z.object({
        customer: z.string(),
        numericId: z.string(),
    }),
    id: z.string().uuid(),
})

type Address = z.infer<typeof addressSchema>
type OutboundOrderItem = z.infer<typeof outboundOrderItemSchema>

export type Consignment = z.infer<typeof consignmentSchema>
export type OutboundOrder = z.infer<typeof outboundOrderSchema>
