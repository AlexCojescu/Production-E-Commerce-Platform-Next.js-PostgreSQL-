import { inngest } from "./client";
import prisma from '@/lib/prisma'

export const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-create'},
    {event: 'clerk/user.created'},
    async ({ event }) => {
        const {data} = event
        const email = data.email_addresses[0]?.email_address
        
        if (!email) {
            console.error('No email address found for user:', data.id)
            return
        }

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            // If user exists with different ID, this shouldn't happen (Clerk prevents duplicate emails)
            // But if it does, update the existing user instead of creating a duplicate
            console.warn(`User with email ${email} already exists with ID ${existingUser.id}, but Clerk created user with ID ${data.id}`)
            await prisma.user.update({
                where: { email },
                data: {
                    id: data.id,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                }
            })
            return
        }

        // Check if user with this ID already exists
        const existingUserById = await prisma.user.findUnique({
            where: { id: data.id }
        })

        if (existingUserById) {
            // User already exists, just update
            await prisma.user.update({
                where: { id: data.id },
                data: {
                    email,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                }
            })
            return
        }

        // Create new user
        try {
            await prisma.user.create({
                data: {
                    id: data.id,
                    email,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                }
            })
        } catch (error) {
            // Handle unique constraint violation (email already exists)
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                console.warn(`Email ${email} already exists, updating existing user`)
                await prisma.user.update({
                    where: { email },
                    data: {
                        id: data.id,
                        name: `${data.first_name} ${data.last_name}`,
                        image: data.image_url,
                    }
                })
            } else {
                throw error
            }
        }
    }
)

// Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction(
    { id: 'sync-user-update' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
      const { data } = event;
      await prisma.user.update({
        where: { id: data.id },
        data: {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
        }
      })
    }
  )

  export const syncUserDeletion = inngest.createFunction(
    { id: 'sync-user-delete' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
      const { data } = event
      await prisma.user.delete({
        where: {id: data.id,}
      })
    }
  )

  // Inngest Function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
  {id: 'delete-coupon-on-expiry'},
  { event: 'app/coupon.expired' },
  async ({ event, step }) => {
    const { data } = event
    const expiryDate = new Date(data.expires_at)
    await step.sleepUntil('wait-for-expiry', expiryDate)

    await step.run('delete-coupon-from-database', async () => {
      await prisma.coupon.delete({
        where: { code: data.code }
      })
    })
  }
)


