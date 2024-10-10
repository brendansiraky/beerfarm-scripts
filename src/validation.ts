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

export const purchaseOrderSchema = z.object({
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
    items: z.array(
        z.object({
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
    ),
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
            address: addressSchema.extend({
                phone: z.string().optional(),
                properties: z
                    .object({
                        ins: z.string(),
                        ot: z.string(),
                        ct: z.string(),
                    })
                    .optional(),
            }),
        }),
        deliver: z.object({
            address: addressSchema.extend({
                contactName: z.string().optional(),
                properties: z
                    .object({
                        ins: z.string(),
                        ot: z.string(),
                        ct: z.string(),
                    })
                    .optional(),
            }),
            instructions: z.string(),
        }),
    }),
    items: z.array(
        z.object({
            details: z.object({
                product: z.object({
                    name: z.string(),
                    references: z.object({
                        code: z.string(),
                    }),
                    id: z.string().uuid(),
                }),
                job: z
                    .object({
                        id: z.string().uuid(),
                    })
                    .optional(),
            }),
            type: z.string(),
            measures: z.object({
                weight: z.number().optional(),
                quantity: z.number(),
            }),
            properties: z.object({
                description: z.string(),
            }),
            id: z.string().uuid(),
        })
    ),
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
    properties: z.object({
        'collect.cins': z.string(),
        serviceType: z.string(),
        'collect.cot': z.string(),
        'collect.cct': z.string(),
    }),
    id: z.string().uuid(),
})

// Still not sure what this will look like
// Likely we won't need this schema
export const salesOrderSchema = z.object({})

export type SalesOrder = z.infer<typeof salesOrderSchema>
export type Consignment = z.infer<typeof consignmentSchema>
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>
