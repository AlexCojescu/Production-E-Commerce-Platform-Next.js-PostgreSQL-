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
            // User with this email exists but may have different ID
            // This can happen if Clerk userId changed or different environment
            if (existingUser.id !== userId) {
              // If user has a store, migrate it to the current Clerk userId
              if (existingUser.store) {
                // Create new user record with Clerk userId if it doesn't exist
                try {
                  await prisma.user.upsert({
                    where: { id: userId },
                    update: {
                      email,
                      name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                      image: existingUser.image || clerkUser.imageUrl || '',
                    },
                    create: {
                      id: userId,
                      email,
                      name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                      image: existingUser.image || clerkUser.imageUrl || '',
                      cart: existingUser.cart || {},
                    },
                  })
                  
                  // Update store to point to the new Clerk userId
                  await prisma.store.update({
                    where: { userId: existingUser.id },
                    data: { userId: userId }
                  })
                } catch (error) {
                  console.error('Error migrating user/store to Clerk userId:', error)
                  // If migration fails, user won't have access - but better than data loss
                }
              } else {
                // No store, just create user with Clerk userId
                try {
                  await prisma.user.create({
                    data: {
                      id: userId,
                      email,
                      name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                      image: existingUser.image || clerkUser.imageUrl || '',
                      cart: existingUser.cart || {},
                    },
                  })
                } catch (error) {
                  console.error('Error creating user with Clerk userId:', error)
                }
              }
            } else {
              // Same ID, just use existing user
              user = existingUser
            }
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
                  // Handle ID mismatch same as above
                  if (existingUser.id !== userId && existingUser.store) {
                    await prisma.store.update({
                      where: { userId: existingUser.id },
                      data: { userId: userId }
                    })
                  }
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