import prisma from '@/lib/prisma';
import { clerkMiddleware } from '@clerk/nextjs/server';

const authSeller = async (userId) => {
  try {
    // Return false early if userId is null or undefined
    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    })

    if (!user) {
      return false
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