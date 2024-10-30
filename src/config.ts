import { WAREHOUSE_CONFIG } from './api/types'

const {
    // NetSuite
    NS_CONSUMER_KEY,
    NS_CONSUMER_SECRET,
    NS_ACCESS_TOKEN,
    NS_TOKEN_SECRET,
    NS_ACCOUNT_ID,

    // Motus
    MOTUS_ID,
    MOTUS_TENANT_UUID,
    MOTUS_CLIENT_ID,
    MOTUS_CLIENT_SECRET,
    MOTUS_CUSTOMER_UUID,

    // Growler
    GROWLER_ID,
    GROWLER_TENANT_UUID,
    GROWLER_CLIENT_ID,
    GROWLER_CLIENT_SECRET,
    GROWLER_CUSTOMER_UUID,

    // Craft
    CRAFT_ID,
    CRAFT_TENANT_UUID,
    CRAFT_CLIENT_ID,
    CRAFT_CLIENT_SECRET,
    CRAFT_CUSTOMER_UUID,
} = process.env

const NETSUITE_BASE_URL = `https://${NS_ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest`
export const NETSUITE = {
    SALES_ORDER_URL: `${NETSUITE_BASE_URL}/record/v1/salesOrder`,
    TRANSFER_ORDER_URL: `${NETSUITE_BASE_URL}/record/v1/transferOrder`,
    QUERY_URL: `${NETSUITE_BASE_URL}/query/v1/suiteql`,

    NS_ACCOUNT_ID,
    NS_CONSUMER_KEY,
    NS_CONSUMER_SECRET,
    NS_ACCESS_TOKEN,
    NS_TOKEN_SECRET,
}

export const WAREHOUSE_LOOKUP = {
    Motus: {
        LOCID: MOTUS_ID,
        tenantUUID: MOTUS_TENANT_UUID,
        client_id: MOTUS_CLIENT_ID,
        client_secret: MOTUS_CLIENT_SECRET,
        customerUUID: MOTUS_CUSTOMER_UUID,
    },
    'Motus Qld': {
        LOCID: MOTUS_ID,
        tenantUUID: MOTUS_TENANT_UUID,
        client_id: MOTUS_CLIENT_ID,
        client_secret: MOTUS_CLIENT_SECRET,
        customerUUID: MOTUS_CUSTOMER_UUID,
    },
    'Craft Transport': {
        LOCID: CRAFT_ID,
        tenantUUID: CRAFT_TENANT_UUID,
        client_id: CRAFT_CLIENT_ID,
        client_secret: CRAFT_CLIENT_SECRET,
        customerUUID: CRAFT_CUSTOMER_UUID,
    },
    'Growler Depot Canning Vale': {
        LOCID: GROWLER_ID,
        tenantUUID: GROWLER_TENANT_UUID,
        client_id: GROWLER_CLIENT_ID,
        client_secret: GROWLER_CLIENT_SECRET,
        customerUUID: GROWLER_CUSTOMER_UUID,
    },
    'Growler Depot': {
        LOCID: GROWLER_ID,
        tenantUUID: GROWLER_TENANT_UUID,
        client_id: GROWLER_CLIENT_ID,
        client_secret: GROWLER_CLIENT_SECRET,
        customerUUID: GROWLER_CUSTOMER_UUID,
    },
}
