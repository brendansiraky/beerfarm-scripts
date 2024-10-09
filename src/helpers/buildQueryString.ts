export function buildQueryString(
    params: Record<string, string | number>
): string {
    const queryString = Object.entries(params)
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&')
    return queryString ? `?${queryString}` : ''
}
