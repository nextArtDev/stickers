import { prisma } from '@/lib/prisma'

export const getUserByPhoneNumber = async (phone: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { phone } })

    return user
  } catch {
    return null
  }
}

export const getUserById = async (id: string | undefined) => {
  try {
    if (!id) return null
    const user = await prisma.user.findUnique({
      where: { id },
      include: { image: { select: { url: true } } },
    })

    return user
  } catch {
    return null
  }
}
