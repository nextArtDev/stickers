'use server'

import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const getAuthStatus = async () => {
  const user = await currentUser()
  if (!user?.id || !user.phone) {
    throw new Error('Invalid user data')
  }

  const existingUser = await prisma.user.findFirst({
    where: { id: user.id },
  })

  if (!existingUser) {
    // await prisma.user.create({
    //   data: {
    //     id: user.id,
    //     phone: user.phone,
    //   },
    // })
    redirect('register')
  }

  return { success: true }
}
