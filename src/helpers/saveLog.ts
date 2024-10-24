import path from 'path'
import fs from 'fs'

export const saveLog = (data: any, type: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${type}-${timestamp}.json`

    const projectRoot = process.cwd()
    const logDir = path.join(projectRoot, 'logs', type)

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const filePath = path.join(logDir, filename)
    fs.writeFileSync(
        filePath,
        JSON.stringify(
            {
                data,
                savedAt: new Date().toISOString(),
            },
            null,
            2
        )
    )
    console.log(
        `${type.charAt(0).toUpperCase() + type.slice(1)} log saved: ${filePath}`
    )
}
