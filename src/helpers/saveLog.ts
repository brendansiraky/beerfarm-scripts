import path from 'path'
import fs from 'fs'

export const saveLog = (folderName: string, id: string, data: unknown) => {
    const timestamp = new Date()
    const timeString = `${timestamp.getHours()}-${timestamp.getMinutes()}-${timestamp.getSeconds()}`
    const filename = `${id}-${timeString}.json`

    const projectRoot = process.cwd()
    const logDir = path.join(projectRoot, 'logs', folderName)

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    const filePath = path.join(logDir, filename)
    fs.writeFileSync(
        filePath,
        JSON.stringify(
            {
                data,
                savedAt: timestamp.toISOString(),
            },
            null,
            2
        )
    )
    console.log(`Log saved to ${folderName}/${filename}`)
}

saveLog('consignment-incoming', 'S0123' || 'NO_ID', {
    consignmentStuff: '',
})


