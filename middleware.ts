import NextAuth from 'next-auth'

import authConfig from '@/auth.config'
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from '@/routes'

//to support Edge which is not supported by prisma by default
const { auth } = NextAuth(authConfig)

export default auth((req): void | Response | Promise<void | Response> => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isActivated = !!req.auth?.user.isVerified

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) return

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (isActivated) {
    if (!isLoggedIn && !isPublicRoute) {
      let callbackUrl = nextUrl.pathname
      if (nextUrl.search) {
        callbackUrl += nextUrl.search
      }

      const encodedCallbackUrl = encodeURIComponent(callbackUrl)
      // can be new URL(`/login`, nextUrl) if intercepting route
      return Response.redirect(
        new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        // new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      )
    }
  }
  //means don't do anything
  return
})

// Optionally, don't invoke Middleware on some paths
// simple matcher for any route you want to invoke he middleware(here all routes)
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
