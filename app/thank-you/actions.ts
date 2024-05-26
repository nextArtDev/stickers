'use server'

import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const user = await currentUser()

  if (!user?.id || !user.phone) {
    throw new Error('You need to be logged in to view this page.')
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      billingAddress: true,
      configuration: {
        include: { croppedImageUrl: { select: { url: true } } },
      },
      shippingAddress: true,
      user: true,
    },
  })
  const updatedOrder = await prisma.order.update({
    where: { id: orderId, userId: user.id },
    data: {
      isPaid: true,
    },
  })
  // console.log(order)
  if (!order) throw new Error('This order does not exist.')

  if (updatedOrder.isPaid) {
    return order
  } else {
    return false
  }
}
