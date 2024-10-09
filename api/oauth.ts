import OAuth from 'oauth-1.0a'
import crypto from 'crypto-js'

const CONSUMER_KEY = process.env.NS_CONSUMER_KEY!
const CONSUMER_SECRET = process.env.NS_CONSUMER_SECRET!
const ACCESS_TOKEN = process.env.NS_ACCESS_TOKEN!
const TOKEN_SECRET = process.env.NS_TOKEN_SECRET!
const NS_ACCOUNT_ID = process.env.NS_ACCOUNT_ID!
const SIGNATURE_METHOD = 'HMAC-SHA256'

const oauth = new OAuth({
    consumer: {
        key: CONSUMER_KEY,
        secret: CONSUMER_SECRET,
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
                key: ACCESS_TOKEN,
                secret: TOKEN_SECRET,
            }
        )
    )

    return `${authHeader.Authorization}, realm="${NS_ACCOUNT_ID}"`
}
