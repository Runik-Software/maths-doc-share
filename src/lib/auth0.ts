import { Auth0Client } from '@auth0/nextjs-auth0/server'

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session) => {
    const roleClaim = 'http://localhost:3000/roles' // Update this to match your Auth0 custom claim namespace

    if (session.user && session.user[roleClaim]) {
      session.user.roles = session.user[roleClaim]
    } else {
      session.user.roles = []
    }

    return session
  },
})
