import imagekit from "@/configs/imagekit"
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";

// NOTE: The 'config' object for payload size is NOT used in the App Router 
// (app/api/...), so it has been removed. The limit is handled in next.config.mjs.

// Add a new product
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if(!storeId){
        return NextResponse.json({error: 'Not authorized: Store not found for user.'}, { status: 401 } )
    }

    // Get the data from the form
    const formData = await request.formData()
    const name = formData.get("name")
    const description = formData.get("description")
    // Convert form data to numbers for validation
    const mrp = Number(formData.get("mrp"))
    const price = Number(formData.get("price"))
    const category = formData.get("category")
    const brand = formData.get("brand")
    const condition = formData.get("condition")
    const images = formData.getAll("images")

    if (!name || !description || !mrp || !price || !category || !brand || !condition || images.length < 1) {
        return NextResponse.json({ error: 'Missing required product details.' }, { status: 400 })
      }

      // Validate image count
      if (images.length > 10) {
        return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
      }

      // Uploading Images to ImageKit
      const imagesUrl = []
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        
        // Skip if image is null or not a proper file (robustness check)
        if (!image || typeof image.arrayBuffer !== 'function') {
             console.warn(`Skipping invalid image file at index: ${i}`);
             continue;
        }

        try {
          const buffer = Buffer.from(await image.arrayBuffer())

          const response = await imagekit.upload({
            file: buffer,
            fileName: `${Date.now()}_${i}_${image.name}`,
            folder: "products",
            // Optional: Set a good upload tag for better organization/search
            tags: [storeId, category.toLowerCase()] 
          })

          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: 'auto' }, // Let ImageKit decide the best quality
              { format: 'webp' },  // Use modern webp format
              { width: '1024' }    // Standardize max width for display
            ]
          })

          imagesUrl.push(url)
        } catch (uploadError) {
          console.error(`Failed to upload image ${i}:`, uploadError)
          // Halt and return error if any image upload fails
          return NextResponse.json({
            error: `Failed to upload image ${i + 1}. Please try again.`
          }, { status: 500 })
        }
      }
      
        // Final check: If all images failed to upload (unlikely after previous checks)
        if (imagesUrl.length === 0) {
            return NextResponse.json({ error: 'No images were successfully uploaded.' }, { status: 500 });
        }

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                brand,
                condition,
                images: imagesUrl,
                storeId
            }
        })

        return NextResponse.json({message: "Product added successfully"})
            
    } catch (error) {
        console.error("Product POST Error:", error);
        // Catch-all for unexpected errors (DB, Auth, etc.)
        return NextResponse.json({ error: error.code || error.message || 'An internal server error occurred.' }, { status: 500 })
    }
}

// Get all products for a seller
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)
    
        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }
    
        const products = await prisma.product.findMany({ where: { storeId }})
    
        return NextResponse.json({ products })
    } catch (error) {
        console.error("Product GET Error:", error);
        return NextResponse.json({ error: error.code || error.message || 'An internal server error occurred.' }, { status: 500 })
    }
}