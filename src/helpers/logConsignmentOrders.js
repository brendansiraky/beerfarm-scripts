import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function parseJsonLogs(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath)
        const jsonFiles = files.filter((file) => extname(file) === '.json')

        const logContents = await Promise.all(
            jsonFiles.map(async (file) => {
                const filePath = join(directoryPath, file)
                const content = await fs.readFile(filePath, 'utf8')
                const data = JSON.parse(content)

                // Extract only the needed fields
                return {
                    runsheet: data.details.runsheet,
                    customerReference: data.references.customer,
                    createDate: data.createDate,
                }
            })
        )

        return logContents
    } catch (error) {
        console.error('Error parsing log files:', error)
        throw error
    }
}

parseJsonLogs(join(__dirname, '../../logs/consignment'))
    .then((logs) => console.log(logs))
    .catch((error) => console.error(error))
