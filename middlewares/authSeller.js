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
        
        await prisma.user.create({
          data: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
            image: clerkUser.imageUrl || '',
          },
        })
        
        // Re-fetch user with store relation after creation
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