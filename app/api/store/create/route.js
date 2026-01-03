import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import imagekit from "@/configs/imagekit";

//create the store

export async function POST(request){
    try {
        const {userId} = getAuth(request)
        
        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }

        // Ensure user exists in database (create if doesn't exist)
        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true }
        })

        if (!user) {
            // Get user data from Clerk
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
                    // Migrate to current Clerk userId if needed
                    if (existingUser.id !== userId) {
                        // If user has a store, migrate it to the current Clerk userId
                        if (existingUser.store) {
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
                            user = { id: userId, email, name: existingUser.name, image: existingUser.image }
                        } else {
                            // No store, create user with Clerk userId
                            user = await prisma.user.create({
                                data: {
                                    id: userId,
                                    email,
                                    name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                                    image: existingUser.image || clerkUser.imageUrl || '',
                                    cart: existingUser.cart || {},
                                },
                            })
                        }
                    } else {
                        // Same ID, just use existing user
                        user = existingUser
                    }
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
                                where: { email },
                                include: { store: true }
                            })
                            if (existingUser) {
                                // Handle ID mismatch - migrate store if needed
                                if (existingUser.id !== userId && existingUser.store) {
                                    await prisma.user.upsert({
                                        where: { id: userId },
                                        update: {},
                                        create: {
                                            id: userId,
                                            email,
                                            name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                                            image: existingUser.image || clerkUser.imageUrl || '',
                                            cart: existingUser.cart || {},
                                        },
                                    })
                                    await prisma.store.update({
                                        where: { userId: existingUser.id },
                                        data: { userId: userId }
                                    })
                                    user = { id: userId, email, name: existingUser.name, image: existingUser.image }
                                } else if (existingUser.id !== userId) {
                                    // No store, create user with Clerk userId
                                    user = await prisma.user.create({
                                        data: {
                                            id: userId,
                                            email,
                                            name: existingUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                                            image: existingUser.image || clerkUser.imageUrl || '',
                                            cart: existingUser.cart || {},
                                        },
                                    })
                                } else {
                                    user = existingUser
                                }
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
        }
        
        //get

        const formData = await request.formData()

        const name = formData.get("name")
        const username = formData.get("username")
        const description = formData.get("description")
        const email = formData.get("email")
        const contact = formData.get("contact")
        const address = formData.get("address")
        const image = formData.get("image")

        if (!name || !username || !description || !email || !contact || !address || !image){
            return NextResponse.json({error: "missing store info"}, {status: 400})
        }

        // Ensure user record exists in database before proceeding
        // Re-fetch user to ensure it was created/migrated properly
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: { store: true }
        })

        if (!user) {
            console.error(`User ${userId} not found after creation/migration attempt`)
            return NextResponse.json({error: "User not found. Please try logging out and back in."}, {status: 404})
        }

        //check is user already registered
        const store = await prisma.store.findFirst({
            where: { userId: userId}
        })

        //if store is already registered
        if(store){
            return NextResponse.json({status: store.status})
        }

            //check if username is taken
            const isUsernameTaken = await prisma.store.findFirst({
                where: { username: username.toLowerCase() }
            })

            if(isUsernameTaken){
                return NextResponse.json({error: "username already taken"}, {status: 400})
            }

            // image upload to imagekit
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
            });

            const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '512' },
            ]
            })

            const newStore = await prisma.store.create({
                data: {
                  userId,
                  name,
                  description,
                  username: username.toLowerCase(),
                  email,
                  contact,
                  address,
                  logo: optimizedImage,
                  status: 'pending' // Explicitly set status
                }
              })
            
            console.log(`Store created successfully: ${newStore.id} for user: ${userId}`)
            
            // Store is already linked via userId foreign key, but ensure user relation exists
            // The store.user relation should work automatically via Prisma
            
            return NextResponse.json({ message: "applied, waiting for approval", storeId: newStore.id })
        
        } catch (error) {
            console.error('Error creating store:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                meta: error.meta,
                userId: userId
            });
            return NextResponse.json({ 
                error: error.code || error.message || 'Failed to create store',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }, { status: 500 })
        }
    }

    // check is user have already registered a store if yes then send status of store
export async function GET(request) {
    try {
      const { userId } = getAuth(request)
      const store = await prisma.store.findFirst({
        where: { userId: userId}
    })

    //if store is already registered
    if(store){
        return NextResponse.json({status: store.status})
    }

    return NextResponse.json({status: "not registered"})
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
  }
