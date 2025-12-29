import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

const authSeller = async (userId) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:4',message:'authSeller called',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Return false early if userId is null or undefined
    if (!userId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:8',message:'userId is null/undefined',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return false
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    })

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:15',message:'User lookup result',data:{userId,userExists:!!user,hasStore:!!user?.store,storeId:user?.store?.id,storeStatus:user?.store?.status,storeUserId:user?.store?.userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // If user doesn't exist in database, create them from Clerk
    if (!user) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:19',message:'User not found, creating from Clerk',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:22',message:'Clerk user fetched',data:{clerkUserId:clerkUser.id,clerkEmail:clerkUser.emailAddresses[0]?.emailAddress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        const email = clerkUser.emailAddresses[0]?.emailAddress || ''
        
        // Check if user with this email already exists
        if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: { store: true }
          })
          
          if (existingUser) {
            // User with this email exists - use it (shouldn't happen with Clerk, but handle gracefully)
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:39',message:'Email already exists, using existing user',data:{userId,email,existingUserId:existingUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
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
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:57',message:'Email unique constraint violation, fetching existing user',data:{userId,email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
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
        if (!user || !user.store) {
          user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true },
          })
        }
        
        // Re-fetch user with store relation after creation
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: { store: true },
        })
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:35',message:'User created and re-fetched',data:{userId,userExists:!!user,hasStore:!!user?.store,storeId:user?.store?.id,storeStatus:user?.store?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:38',message:'Error creating user from Clerk',data:{userId,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.error('Error creating user from Clerk:', error)
        return false
      }
    }

    if (user.store) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:45',message:'Store exists, checking status',data:{storeId:user.store.id,storeStatus:user.store.status,storeUserId:user.store.userId,expectedStatus:'approved'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (user.store.status === 'approved') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:47',message:'Store approved, returning storeId',data:{storeId:user.store.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return user.store.id
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:50',message:'Store not approved',data:{storeId:user.store.id,storeStatus:user.store.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:53',message:'No store found for user',data:{userId,userEmail:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:55',message:'Returning false',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return false
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authSeller.js:58',message:'Exception in authSeller',data:{userId,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error(error)
    return false
  }
}

export default authSeller