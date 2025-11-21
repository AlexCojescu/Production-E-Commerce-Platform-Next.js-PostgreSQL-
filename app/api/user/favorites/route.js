import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    // 1. Authenticate user
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch favorites with full product details
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true,
            rating: {
              select: {
                createdAt: true,
                rating: true,
                review: true,
                user: { select: { name: true, image: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Most recent first
    })

    // 3. Filter out products from inactive stores or out of stock
    const activeFavorites = favorites.filter(
      fav => fav.product.inStock && fav.product.store.isActive
    )

    return NextResponse.json({ favorites: activeFavorites })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
