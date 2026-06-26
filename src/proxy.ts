import { auth0 } from './lib/auth0'

export async function proxy(request: Request) {
  return auth0.middleware(request)
}

export const config = {
  // Run the Auth0 session middleware over the public site and its own /auth/*
  // routes only. The Payload admin (/admin) and REST API (/api) have their own
  // auth and must be excluded: letting auth0.middleware roll the session cookie
  // on every admin form-state Server Action triggers a router-refresh loop.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|admin|api).*)'],
}
