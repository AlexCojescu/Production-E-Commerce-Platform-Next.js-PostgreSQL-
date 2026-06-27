// ./app/api/stripe/route.js

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey?.trim()) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey)
}

export async function POST(request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret?.trim()) {
      console.error('[security] STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    const stripe = getStripeClient()

    // Get raw body for Stripe signature verification
    const body = await request.text(); // raw string, no body parser needed [web:24][web:27]
    const sig = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    ); // [web:24][web:27]

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      }); // [web:36][web:37]

      const { orderIds, userId, appId } = session.data[0].metadata;

      if (appId !== "gocart") {
        return NextResponse.json({
          received: true,
          message: "Invalid app id",
        });
      }

      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        // mark order as paid
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            });
          })
        );

        // delete cart from user
        await prisma.user.update({
          where: { id: userId },
          data: { cart: {} },
        });
      } else {
        // delete order from db
        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            // NOTE: prisma.order.deleteId does not exist in Prisma;
            // use delete({ where: { id } }) instead. [web:34]
            await prisma.order.delete({
              where: { id: orderId },
            });
          })
        );
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntent(event.data.object.id, true);
        break;
      }

      case "payment_intent.canceled": {
        await handlePaymentIntent(event.data.object.id, false);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// No `export const config` here; it is deprecated and ignored in app routes. [web:16][web:25]
