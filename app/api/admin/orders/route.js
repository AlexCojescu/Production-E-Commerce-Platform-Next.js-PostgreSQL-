import prisma from '@/lib/prisma'
import authAdmin from '@/middlewares/authAdmin'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { OrderStatus } from '@prisma/client'
import {
  findPaymentIntentIdForOrder,
  getStripeClient,
} from '@/lib/stripeAdmin'
import { readJsonBody } from '@/lib/apiGuard'

const ACTIVE_STATUSES = [
  OrderStatus.ORDER_PLACED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const isAdmin = await authAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error
    const { orderId, action, status } = parsed.body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'missing orderId' }, { status: 400 })
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'missing action' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'order not found' }, { status: 404 })
    }

    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'order is already cancelled' },
        { status: 400 }
      )
    }

    if (order.isRefunded && action !== 'updateStatus') {
      return NextResponse.json(
        { error: 'order has already been refunded' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'updateStatus': {
        if (!status || !ACTIVE_STATUSES.includes(status)) {
          return NextResponse.json({ error: 'invalid status' }, { status: 400 })
        }

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status },
        })

        return NextResponse.json({
          message: 'Order status updated',
          order: updated,
        })
      }

      case 'cancel': {
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
        })

        return NextResponse.json({
          message: 'Order cancelled',
          order: updated,
        })
      }

      case 'refund': {
        if (order.isRefunded) {
          return NextResponse.json(
            { error: 'order already refunded' },
            { status: 400 }
          )
        }

        if (order.paymentMethod === 'STRIPE') {
          if (!order.isPaid) {
            return NextResponse.json(
              { error: 'cannot refund an unpaid Stripe order' },
              { status: 400 }
            )
          }

          const stripe = getStripeClient()
          const paymentIntentId = await findPaymentIntentIdForOrder(
            stripe,
            orderId,
            order.stripePaymentIntentId
          )

          if (!paymentIntentId) {
            return NextResponse.json(
              { error: 'Stripe payment not found for this order' },
              { status: 404 }
            )
          }

          await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(order.total * 100),
          })

          const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
              isRefunded: true,
              isPaid: false,
              status: OrderStatus.CANCELLED,
              stripePaymentIntentId: paymentIntentId,
            },
          })

          return NextResponse.json({
            message: 'Stripe refund issued and order cancelled',
            order: updated,
          })
        }

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            isRefunded: true,
            status: OrderStatus.CANCELLED,
          },
        })

        return NextResponse.json({
          message: 'Order marked as refunded and cancelled',
          order: updated,
        })
      }

      default:
        return NextResponse.json({ error: 'invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 400 }
    )
  }
}
