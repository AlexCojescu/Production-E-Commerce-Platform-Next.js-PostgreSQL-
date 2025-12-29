import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

const authSeller = async (userId) => {
  try {
    // Return false early if userId is null or undefined
    if (!userId) {
      return false
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    })

    // If user doesn't exist in database, create them from Clerk
    if (!user) {
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        
        const email = clerkUser.emailAddresses[0]?.emailAddress || ''
        
        // Check if user with this email already exists
        if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { store: true }
          })
          
          if (existingUser) {
            // User with this email exists - use it (shouldn't happen with Clerk, but handle gracefully)
            user = existingUser
          } else {
            // Create new user
            try {
              await prisma.user.create({
                data: {
                  id: clerkUser.id,
                  email,
                  name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                  image: clerkUser.imageUrl || '',
                },
              })
            } catch (error) {
              // Handle unique constraint violation (email already exists)
              if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                // Try to find and use existing user
                const existingUser = await prisma.user.findUnique({
                  where: { email },
                  include: { store: true }
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
          await prisma.user.create({
            data: {
              id: clerkUser.id,
              email: '',
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
              image: clerkUser.imageUrl || '',
            },
          })
        }
        
        // Re-fetch user with store relation after creation/update
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: { store: true },
        })
      } catch (error) {
        console.error('Error creating user from Clerk:', error)
        return false
      }
    }

    if (user.store) {
      if (user.store.status === 'approved') {
        return user.store.id
      }
    }
    
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export default authSeller