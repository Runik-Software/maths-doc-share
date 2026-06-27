import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import { seedMarketplace } from '../src/endpoints/seed/marketplace'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const projectRoot = path.resolve(dirname, '..')

dotenv.config({ path: path.resolve(projectRoot, '.env') })
dotenv.config({ path: path.resolve(projectRoot, 'test.env') })

const getFlagValue = (argv: string[], flag: string): string | undefined => {
  const directValue = argv.find((arg) => arg.startsWith(`${flag}=`))
  if (directValue) return directValue.slice(flag.length + 1)

  const flagIndex = argv.indexOf(flag)
  if (flagIndex >= 0 && flagIndex + 1 < argv.length) return argv[flagIndex + 1]

  return undefined
}

export const resolveDatabaseUri = ({
  argv = process.argv.slice(2),
  env = process.env,
}: {
  argv?: string[]
  env?: NodeJS.ProcessEnv
} = {}): string | undefined => {
  return (
    getFlagValue(argv, '--database-url') ??
    getFlagValue(argv, '--uri') ??
    env.DATABASE_URL ??
    env.DATABASE_URI ??
    env.POSTGRES_URL ??
    env.POSTGRES_URI
  )
}

export const main = async ({
  argv = process.argv.slice(2),
  env = process.env,
}: {
  argv?: string[]
  env?: NodeJS.ProcessEnv
} = {}): Promise<void> => {
  const databaseUri = resolveDatabaseUri({ argv, env })

  if (!databaseUri) {
    console.error(
      'No database URI provided. Use --database-url=postgres://... or set DATABASE_URL.',
    )
    process.exitCode = 1
    return
  }

  env.DATABASE_URL = databaseUri
  env.PAYLOAD_SECRET ||= 'local-seed-secret'

  const { createLocalReq, getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')

  const payload = await getPayload({ config })
  const req = await createLocalReq({}, payload)

  await seedMarketplace({ payload, req, images: [] })
  console.log('Marketplace seed complete.')
}

if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  await main()
}
