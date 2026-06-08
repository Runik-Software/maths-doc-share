import { auth0 } from '@/lib/auth0'
import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  const session = await auth0.getSession()

  return <HeaderClient data={headerData} session={session} />
}
