export interface OrderResponse {
    links: [
        {
            rel: string
            href: string
        }
    ]
    count: 1
    hasMore: false
    items: [{ links: []; id: string }]
    offset: 0
    totalResults: 1
}

export interface SalesOrder {
    links: Array<{
        rel: string
        href: string
    }>
    altShippingCost: number
    billingAddress: { links: Array<unknown> }
    canBeUnapproved: boolean
    canHaveStackable: boolean
    checkNumber: string
    createdDate: string
    cseg_ce_region: {
        links: Array<unknown>
        id: string
        refName: string
    }
    currency: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody10: boolean
    custbody15: boolean
    custbody17: string
    custbody30: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody4: boolean
    custbody5: boolean
    custbody6: boolean
    custbody7: boolean
    custbody8: boolean
    custbody9: boolean
    custbody_3pl_arrival: string
    custbody_3pl_status: string
    custbody_status: string // Actually doesn't exist in the response, but it's what we're using to update the status of the sales order which is allowed for some reason.
    custbody_auto_send_document_nonstore: boolean
    custbody_bs_ddr_donot_reprocess: boolean
    custbody_ce_bbl_equiv: number
    custbody_ce_bottles: number
    custbody_ce_cans: number
    custbody_ce_complianceupdate: boolean
    custbody_ce_consolidatedtransferorder: { links: Array<unknown> }
    custbody_ce_contracttermdata: string
    custbody_ce_estdeliverydate: string
    custbody_ce_excisetaxtransaction: boolean
    custbody_ce_issuedbatches: { links: Array<unknown> }
    custbody_ce_kegs: number
    custbody_ce_license: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_load_complete: boolean
    custbody_ce_load_process_status: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_locationaddress: string
    custbody_ce_mdf_ml_checkbox: boolean
    custbody_ce_ordertype: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_override_keg_deposits: boolean
    custbody_ce_override_pallet: boolean
    custbody_ce_overridecomplianceclass: boolean
    custbody_ce_overridediscounttip: boolean
    custbody_ce_pallets: number
    custbody_ce_recurringso: boolean
    custbody_ce_sd_deliinst: string
    custbody_ce_shipcompliantwholesale: boolean
    custbody_ce_spaces: number
    custbody_ce_tolocbonded: boolean
    custbody_ce_totalcontainers: number
    custbody_ce_totalweight: number
    custbody_ce_transformationtype: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_warehousestatus: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_workorderlinesupdated: boolean
    custbody_delivery_routing_non_touch: boolean
    custbody_erpff_p2p_auto_send_document: boolean
    custbody_erpff_p2p_document_sent: boolean
    custbody_exclude_from_3pl: boolean
    custbody_ff_br_exclude_transaction: boolean
    custbody_in8_ci_edi_810_sent: boolean
    custbody_in8_ci_edi_855_sent: boolean
    custbody_in8_ci_edi_940_sent: boolean
    custbody_in8_ci_edi_997_sent: boolean
    custbody_no_auto_email_workflow: boolean
    custbody_nondeductible_ref_tran: { links: Array<unknown> }
    custbody_ns_order_canceled: boolean
    custbody_ns_shipment_exported: boolean
    custbody_report_timestamp: string
    custbody_so_locked: string
    custbody_wms_delivert_routing_status: {
        links: Array<unknown>
        id: string
        refName: string
    }
    customForm: {
        id: string
        refName: string
    }
    defaultILShipMethKey: number
    department: {
        links: Array<unknown>
        id: string
        refName: string
    }
    discountTotal: number
    email: string
    entity: {
        links: Array<unknown>
        id: string
        refName: string
    }
    estGrossProfit: number
    exchangeRate: number
    giftCertApplied: number
    giftCertRedemption: { links: Array<unknown> }
    handlingMode: {
        id: string
        refName: string
    }
    id: string
    isMultiShipTo: boolean
    item: { links: Array<unknown> }
    lastModifiedDate: string
    location: {
        links: Array<unknown>
        id: string
        refName: string
    }
    memo: string
    needsPick: boolean
    orderStatus: {
        id: string
        refName: string
    }
    otherRefNum: string
    prevDate: string
    prevRep: number
    salesEffectiveDate: string
    salesRep: {
        links: Array<unknown>
        id: string
        refName: string
    }
    shipAddress: string
    shipAddressList: {
        links: Array<unknown>
        id: string
        refName: string
    }
    shipComplete: boolean
    shipDate: string
    shipGroup: { links: Array<unknown> }
    shipIsResidential: boolean
    shipMethod: {
        links: Array<unknown>
        id: string
        refName: string
    }
    shipOverride: boolean
    shippingAddress: { links: Array<unknown> }
    shippingAddress_text: string
    shippingCost: number
    shippingCostOverridden: boolean
    status: {
        id: string
        refName: string
    }
    subsidiary: {
        links: Array<unknown>
        id: string
        refName: string
    }
    subtotal: number
    suppressUserEventsAndEmails: string
    terms: {
        links: Array<unknown>
        id: string
        refName: string
    }
    toBeEmailed: boolean
    toBeFaxed: boolean
    toBePrinted: boolean
    total: number
    totalCostEstimate: number
    tranDate: string
    tranId: string
    updateDropshipOrderQty: string
    webStore: string
}

export interface TransferOrder {
    links: Array<unknown>
    altShippingCost: number
    canBeUnapproved: boolean
    createdDate: string
    currency: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody17: string
    custbody_3pl_arrival: string
    custbody_3pl_status: string
    custbody_ce_bonded: boolean
    custbody_ce_complianceupdate: boolean
    custbody_ce_consolidatedtransferorder: { links: Array<unknown> }
    custbody_ce_excisetaxtransaction: boolean
    custbody_ce_issuedbatches: { links: Array<unknown> }
    custbody_ce_license: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_load_complete: boolean
    custbody_ce_load_process_status: {
        links: Array<unknown>
        id: string
        refName: string
    }
    custbody_ce_locationaddress: string
    custbody_ce_overridecomplianceclass: boolean
    custbody_ce_pallets: number
    custbody_ce_tolocbonded: boolean
    custbody_ce_totalweight: number
    custbody_nondeductible_ref_tran: { links: Array<unknown> }
    customForm: {
        id: string
        refName: string
    }
    exchangeRate: number
    excludefromsupplyplanning: boolean
    firmed: boolean
    id: string
    incoTerm: {
        links: Array<unknown>
        id: string
        refName: string
    }
    item: { links: Array<unknown> }
    lastModifiedDate: string
    location: {
        links: Array<unknown>
        id: string
        refName: string
    }
    orderStatus: {
        id: string
        refName: string
    }
    prevDate: string
    shipAddress: string
    shipComplete: boolean
    shipDate: string
    shipIsResidential: boolean
    shipMethod: {
        links: Array<unknown>
        id: string
        refName: string
    }
    shipOverride: boolean
    shippingAddress: { links: Array<unknown> }
    shippingAddress_text: string
    shippingCost: number
    shippingCostOverridden: boolean
    status: {
        id: string
        refName: string
    }
    subsidiary: {
        links: Array<unknown>
        id: string
        refName: string
    }
    subtotal: number
    total: number
    tranDate: string
    tranId: string
    transferLocation: {
        links: Array<unknown>
        id: string
        refName: string
    }
    useItemCostAsTransferCost: boolean
}

export type WAREHOUSE_CONFIG = {
    LOCID: string
    tenantUUID: string
    client_id: string
    client_secret: string
    customerUUID: string
}
