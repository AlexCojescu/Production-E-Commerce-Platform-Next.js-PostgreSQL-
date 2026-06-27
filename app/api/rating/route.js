import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findOrderForUser, orderContainsProduct } from "@/lib/authz";
import { enforceRateLimit, readJsonBody, inputValidationResponse } from "@/lib/apiGuard";
import { requireString, LIMITS } from "@/lib/inputLimits";

// Add new rating
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const limited = enforceRateLimit(request, { userId, scope: 'rating' })
    if (limited) return limited

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error

    const { orderId, productId, rating, review } = parsed.body

    if (typeof orderId !== 'string' || typeof productId !== 'string') {
      return NextResponse.json({ error: "Invalid rating payload" }, { status: 400 })
    }

    const ratingNum = Number(rating)
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const safeReview = requireString(review, LIMITS.REVIEW, 'review')

    const order = await findOrderForUser(userId, orderId, { orderItems: true })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!orderContainsProduct(order, productId)) {
      return NextResponse.json({ error: "Product was not part of this order" }, { status: 403 })
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json({ error: "You can only rate delivered orders" }, { status: 400 })
    }

    const isAlreadyRated = await prisma.rating.findFirst({where: {productId, orderId}})

if (isAlreadyRated) {
  return NextResponse.json({ error: "Product already rated" }, { status: 400 })
}

const response = await prisma.rating.create({
    data: {userId, productId, rating: ratingNum, review: safeReview, orderId}
  })
  
  return NextResponse.json({message: "Rating added successfully", rating: response})
  
  } catch (error) {
    const validation = inputValidationResponse(error)
    if (validation) return validation
    console.error(error);
    return NextResponse.json({error: error.code || error.message}, { status: 400 })
  }
}

// Get all ratings for a user
export async function GET(request) {
    try {
      const { userId } = getAuth(request)
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
  
      const ratings = await prisma.rating.findMany({
        where: { userId }
      })
  
      return NextResponse.json({ratings})
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
  }
