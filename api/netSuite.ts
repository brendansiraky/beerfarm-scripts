import axios, { AxiosResponse } from 'axios'

import { getAuthHeader } from './oauth'

export async function netSuiteRequest<T>(
    url: string,
    method: 'GET' | 'PATCH' = 'GET',
    updateData?: any
) {
    const options: any = {
        headers: {
            Authorization: getAuthHeader(url, method),
            'Content-Type': 'application/json',
        },
        method,
        url,
    }

    if (updateData && method === 'PATCH') {
        options.data = updateData
    }

    try {
        const response: AxiosResponse<T> = await axios(options)
        return response.data
    } catch (error) {
        throw error
    }
}
