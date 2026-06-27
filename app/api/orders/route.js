import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";
import { findAddressForUser } from "@/lib/authz";
import { enforceRateLimit, readJsonBody, inputValidationResponse } from "@/lib/apiGuard";
import { validateOrderItems, requireCouponCode } from "@/lib/inputLimits";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const limited = enforceRateLimit(request, { userId, scope: 'orders' })
    if (limited) return limited

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error

    const { addressId, items, couponCode: rawCouponCode, paymentMethod } = parsed.body

    if (!addressId || typeof addressId !== 'string' || !paymentMethod) {
        return NextResponse.json({ error: "missing order details." }, { status: 400 });
      }

    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return NextResponse.json({ error: "invalid payment method" }, { status: 400 })
    }

    validateOrderItems(items)

    let coupon = null;
    const couponCode = rawCouponCode ? requireCouponCode(rawCouponCode) : null;
      
      if (couponCode) {
        coupon = await prisma.coupon.findUnique({
            where: {code: couponCode}
          })  
          if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
          }
      }

    if(couponCode && coupon?.forNewUser) {
      const userorders = await prisma.order.findMany({where: {userId}})
      if (userorders.length > 0) {
        return NextResponse.json({ error: "Coupon valid for new users" }, {
          status: 400})
      }
    }

    const isPlusMember = has({plan: 'plus'})

    if (couponCode && coupon.forMember) {
      if (!isPlusMember) {
        return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 })
      }
    }

    const ownedAddress = await findAddressForUser(userId, addressId)
    if (!ownedAddress) {
      return NextResponse.json({ error: "Invalid address" }, { status: 403 })
    }

    // Group orders by storeId using a Map
    const ordersByStore = new Map()

    for (const item of items) {
        const product = await prisma.product.findUnique({where: { id: item.id }})
        if (!product || !product.inStock || product.sold) {
          return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 })
        }
        const storeId = product.storeId

        if (!ordersByStore.has(storeId)) {
            ordersByStore.set(storeId, [])
        }
        ordersByStore.get(storeId).push({...item, price: product.price})
    }

    let orderIds = [];
    let fullAmount = 0;

    let isShippingFeeAdded = false

    for (const [storeId, sellerItems] of ordersByStore.entries()) {
        let total = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      
        if (couponCode) {
          total -= (total * coupon.discount) / 100;
        }
        if (isPlusMember && !isShippingFeeAdded) {
          total += 5;
          isShippingFeeAdded = true
        }
      
        fullAmount += parseFloat(total.toFixed(2))
      
        const order = await prisma.order.create({
            data: {
              userId,
              storeId,
              addressId,
              total: parseFloat(total.toFixed(2)),
              paymentMethod,
              isCouponUsed: coupon ? true : false,
              coupon: coupon ? coupon : {},
              orderItems: {
                create: sellerItems.map(item => ({
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            }
          })
          orderIds.push(order.id)
      }

      if (paymentMethod === 'STRIPE') {
        const stripeKey = process.env.STRIPE_SECRET_KEY
        if (!stripeKey?.trim()) {
          return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
        }
        const stripe = Stripe(stripeKey)
        const origin = await request.headers.get('origin')
      
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Order'
              },
              unit_amount: Math.round(fullAmount * 100)
            },
            quantity: 1
          }],
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // current time + 30 minutes
          mode: 'payment',
          success_url: `${origin}/loading?nextUrl=orders`,
          cancel_url: `${origin}/cart`,
          metadata: {
            orderIds: orderIds.join(','),
            userId,
            appId: 'gocart'
          }
        })
      
        return NextResponse.json({session})
      }

            // Clear the cart
        await prisma.user.update({
            where: { id: userId },
            data: { cart: {} }
        })
  
  return NextResponse.json({ message: 'Orders Placed Successfully' })
      
} catch (error) {
    const validation = inputValidationResponse(error)
    if (validation) return validation
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 })
  }

}

// Get all orders for a user
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
          return NextResponse.json({ error: "not authorized" }, { status: 401 })
        }
        const orders = await prisma.order.findMany({
          where: {
            userId,
            OR: [
              { paymentMethod: PaymentMethod.COD },
              { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] }
            ],
          },
          include: {
            orderItems: { include: { product: true } },
            address: true,
          },
          orderBy: { createdAt: 'desc' }
        })
      
        return NextResponse.json({ orders })
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
  }