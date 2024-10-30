import OAuth from 'oauth-1.0a'
import crypto from 'crypto-js'
import { NETSUITE } from '../config'

const {
    NS_CONSUMER_KEY,
    NS_CONSUMER_SECRET,
    NS_ACCESS_TOKEN,
    NS_TOKEN_SECRET,
    NS_ACCOUNT_ID,
} = NETSUITE

const SIGNATURE_METHOD = 'HMAC-SHA256'

const oauth = new OAuth({
    consumer: {
        key: NS_CONSUMER_KEY!,
        secret: NS_CONSUMER_SECRET!,
    },
    signature_method: SIGNATURE_METHOD,
    hash_function(base_string: string, key: string) {
        return crypto.HmacSHA256(base_string, key).toString(crypto.enc.Base64)
    },
})

export function getAuthHeader(url: string, method: string): string {
    const authHeader = oauth.toHeader(
        oauth.authorize(
            {
                url,
                method,
            },
            {
                key: NS_ACCESS_TOKEN!,
                secret: NS_TOKEN_SECRET!,
            }
        )
    )

    return `${authHeader.Authorization}, realm="${NS_ACCOUNT_ID}"`
}
