import { join, extname, dirname } from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function getConsignmentOrders() {
    try {
        const directoryPath = join(__dirname, '../../logs/consignment-incoming')
        const files = await fs.readdir(directoryPath)
        const jsonFiles = files.filter((file) => extname(file) === '.json')

        const logContents = await Promise.all(
            jsonFiles.map(async (file) => {
                const filePath = join(directoryPath, file)
                const content = await fs.readFile(filePath, 'utf8')
                const data = JSON.parse(content)

                // Extract only the needed fields
                return {
                    runsheet: data.data.details.runsheet,
                    customerReference: data.data.references.customer,
                    createDate: data.data.createDate,
                }
            })
        )

        return logContents
    } catch (error) {
        console.error('Error parsing log files:', error)
        throw error
    }
}
