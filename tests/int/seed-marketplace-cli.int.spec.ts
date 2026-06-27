import { describe, expect, it } from 'vitest'

import { resolveDatabaseUri } from '../../scripts/seed-marketplace'

describe('resolveDatabaseUri', () => {
  it('prefers the CLI database-url flag', () => {
    const uri = resolveDatabaseUri({
      argv: ['--database-url', 'postgresql://cli.example/db'],
      env: { DATABASE_URL: 'postgresql://env.example/db' } as NodeJS.ProcessEnv,
    })

    expect(uri).toBe('postgresql://cli.example/db')
  })

  it('falls back to the DATABASE_URL environment variable', () => {
    const uri = resolveDatabaseUri({
      argv: [],
      env: { DATABASE_URL: 'postgresql://env.example/db' } as NodeJS.ProcessEnv,
    })

    expect(uri).toBe('postgresql://env.example/db')
  })
})
