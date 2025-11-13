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
            where: { id: userId }
        })

        if (!user) {
            // Get user data from Clerk
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)
            
            // Create user in database
            user = await prisma.user.create({
                data: {
                    id: clerkUser.id,
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
                    image: clerkUser.imageUrl || '',
                }
            })
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
                  logo: optimizedImage
                }
              })
            // link store to user
        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } }
        })
        
        return NextResponse.json({ message: "applied, waiting for approval" })
        
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: error.code || error.message }, {})
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
