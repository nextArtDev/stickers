import NextAuth, { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'

import authConfig from '@/auth.config'

import { prisma } from './lib/prisma'
import { getUserById } from './lib/queries/auth/user'
import { getImageById } from './lib/queries/auth/image'
// import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
// import { getAccountByUserId } from './data/account'

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       role: Role
//       phone: string
//       isVerified: boolean
//       image?: string
//     } & DefaultSession['user']
//   }
// }
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/error',
  },
  //   events: {
  //     async linkAccount({ user }) {
  //       await prisma.user.update({
  //         where: { id: user.id },
  //         // data: { emailVerified: new Date() },
  //       })
  //     },
  //   },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'Credentials') return true

      const existingUser = await getUserById(user.id)

      // Prevent sign in without verification
      if (!existingUser || !existingUser?.isVerified) return false
      // allow user to sign in
      return true
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as Role
      }

      if (session.user) {
        session.user.isVerified = token.isVerified as boolean
      }

      if (token.picture && session.user.image) {
        session.user.image = token.picture
      }

      if (session.user) {
        session.user.name = token.name
        session.user.phone = token.phone as string
        // session.user.isOAuth = token.isOAuth as boolean
      }

      return session
    },
    // session uses the session to generate the session, so first we should fix the session
    async jwt({ token }) {
      //sub is user.id but "user" field is not reliable to use

      // It means we're logged out
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token

      //   const existingAccount = await getAccountByUserId(existingUser.id)
      // if (existingUser.imageId) {
      //   const image = await getImageById(existingUser.imageId)
      //   token.picture = image?.url
      // }
      // We do all them to update session when we update user
      // token.isOAuth = !!existingUser
      token.name = existingUser.name
      token.phone = existingUser.phone
      token.role = existingUser.role
      token.isVerified = existingUser.isVerified
      // token.picture = existingUser.image?.url

      return token
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
})
