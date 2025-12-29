import prisma from "@/lib/prisma"
import { getAuth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    // 1. Authenticate user
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Ensure user exists in database (create if doesn't exist)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      try {
        // Get user data from Clerk
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        const email = clerkUser.emailAddresses[0]?.emailAddress || ''
        
        // Check if user with this email already exists
        if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email }
          })
          
          if (existingUser) {
            // User with this email exists - use existing user
            user = existingUser
          } else {
            // Create new user
            try {
              user = await prisma.user.create({
                data: {
                  id: clerkUser.id,
                  email,
                  name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                  image: clerkUser.imageUrl || '',
                }
              })
            } catch (error) {
              // Handle unique constraint violation (email already exists)
              if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                // Try to find and use existing user
                const existingUser = await prisma.user.findUnique({
                  where: { email }
                })
                if (existingUser) {
                  user = existingUser
                } else {
                  throw error
                }
              } else {
                throw error
              }
            }
          }
        } else {
          // No email - create user anyway (shouldn't happen with Clerk)
          user = await prisma.user.create({
            data: {
              id: clerkUser.id,
              email: '',
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
              image: clerkUser.imageUrl || '',
            }
          })
        }
      } catch (error) {
        console.error('Error creating user from Clerk:', error)
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
      }
    }

    // 3. Get productId from request
    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // 4. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 5. Check if favorite already exists
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    })

    // 6. Toggle logic
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
