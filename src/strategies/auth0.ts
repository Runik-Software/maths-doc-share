// src/payload/strategies/auth0.ts
import { auth0 } from '@/lib/auth0'
import type { AuthStrategy } from 'payload'

export const auth0Strategy: AuthStrategy = {
  name: 'auth0-strategy',
  authenticate: async ({ payload }) => {
    try {
      // getSession automatically reads Next.js headers/cookies
      const session = await auth0.getSession()

      if (!session?.user?.email) {
        return { user: null }
      }

      const { email } = session.user

      // Check if the user already exists in Payload
      const { docs } = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
      })

      if (docs.length > 0) {
        return {
          user: {
            ...docs[0],
          },
        }
      }

      // Sync new Auth0 user to Payload DB
      payload.logger.info(`No user found for email ${email}, creating new user in Payload.`)

      const userToCreate = {
        email,
        picture: session.user.picture,
        auth0Sub: session.user.sub,
        // Extract roles from Auth0 custom claims if configured, otherwise default
        roles: session.user['roles'] || ['User'],
      }
      payload.logger.info({ userToCreate }, 'User data to create in Payload')
      const newUser = await payload.create({
        collection: 'users',
        data: userToCreate,
      })
      payload.logger.info({ newUser }, `New user created in Payload: ${newUser.id}`)

      return {
        user: {
          ...newUser,
        },
      }
    } catch (error) {
      payload.logger.error({ error }, 'Error occurred while authenticating user')
      return { user: null }
    }
  },
}
