import prisma from '@/lib/prisma'

export async function findAddressForUser(userId, addressId) {
  if (!userId || !addressId) return null
  return prisma.address.findFirst({
    where: { id: addressId, userId },
  })
}

export async function findOrderForUser(userId, orderId, include = undefined) {
  if (!userId || !orderId) return null
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    ...(include ? { include } : {}),
  })
}

export async function orderContainsProduct(order, productId) {
  if (!order?.orderItems?.length) return false
  return order.orderItems.some((item) => item.productId === productId)
}
