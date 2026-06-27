
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody, inputValidationResponse } from "@/lib/apiGuard";
import { validateAddressFields } from "@/lib/inputLimits";

export async function POST(request) {
    try {
      const { userId } = getAuth(request)
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const limited = enforceRateLimit(request, { userId, scope: 'address' })
      if (limited) return limited

      const parsed = await readJsonBody(request)
      if (parsed.error) return parsed.error

      // Ensure user exists in database (create if doesn't exist)
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

      const { address } = parsed.body
      const validatedAddress = validateAddressFields(address || {})

      const newAddress = await prisma.address.create({
        data: { userId, ...validatedAddress }
      })
      // Save the cart to the user object
  
      return NextResponse.json({newAddress, message: 'Address added succesfully' })
    } catch (error) {
      const validation = inputValidationResponse(error)
      if (validation) return validation
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}


//get all addresses for user
export async function GET(request){
    try {
      const { userId } = getAuth(request)
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
     
      const addresses = await prisma.address.findMany({
        where: { userId }
      })
      // Save the cart to the user object
  
      return NextResponse.json({addresses})
    } catch (error) {
      // Catch block logic would go here
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

