import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    // 1. Authenticate user
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get productId from request
    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // 3. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 4. Check if favorite already exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    })

    // 5. Toggle logic
    if (existingFavorite) {
      // Remove from favorites
      await prisma.userFavorite.delete({
        where: {
          userId_productId: { userId, productId }
        }
      })
      return NextResponse.json({
        message: 'Removed from favorites',
        isFavorited: false
      })
    } else {
      // Add to favorites
      await prisma.userFavorite.create({
        data: { userId, productId }
      })
      return NextResponse.json({
        message: 'Added to favorites',
        isFavorited: true
      })
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
