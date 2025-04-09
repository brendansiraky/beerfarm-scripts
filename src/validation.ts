import { z } from 'zod'

// Commented out fields for now as we don't actually care about them and this was causing issues in payload incoming.
// Inbound Orders
export const purchaseOrderSchema = z.object({
    details: z.object({
        urgent: z.boolean(),
        instructions: z.string(),
        arrivalDate: z.string(),
        parentId: z.string().uuid(),
        hasChildren: z.boolean(),
    }),
    status: z.enum([
        'DRAFT',
        'NOT_YET_RECEIVED',
        'RECEIVED',
        'VERIFIED',
        'ALLOCATED',
        'REJECTED',
    ]),
    references: z.object({
        customer: z.string(),
        // numericId: z.string(),
    }),
})

// Commented out fields for now as we don't actually care about them and this was causing issues in payload incoming.
export const consignmentSchema = z.object({
    details: z.object({
        runsheet: z.object({
            date: z.string(),
            name: z.string(),
            id: z.string().uuid(),
        }),
    }),
    references: z.object({
        customer: z.string(),
        numericId: z.string(),
    }),
})

// Commented out fields for now as we don't actually care about them and this was causing issues in payload incoming.
// Outbound Orders
export const salesOrderSchema = z.object({
    status: z.enum([
        'AWAITING_PICK_AND_PACK',
        'DISPATCHED',
        'DRAFT',
        'PACKED',
        'PACKING_IN_PROGRESS',
        'REJECTED',
    ]),
    references: z.object({
        customer: z.string(),
        // numericId: z.string(),
    }),
})

export type SalesOrder = z.infer<typeof salesOrderSchema>
export type Consignment = z.infer<typeof consignmentSchema>
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>
