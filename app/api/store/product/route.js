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
    
    // Check if user is authenticated before proceeding
    if (!userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const storeId = await authSeller(userId)

    if(!storeId){
        return NextResponse.json({error: 'Not authorized: Store not found for user.'}, { status: 401 } )
    }

    // Get the data from the request body (now JSON instead of FormData)
    const body = await request.json()
    const { name, description, mrp, price, category, brand, condition, imageUrls } = body

    // Convert to numbers for validation
    const mrpNum = Number(mrp)
    const priceNum = Number(price)

    if (!name || !description || !mrpNum || !priceNum || !category || !brand || !condition || !imageUrls || imageUrls.length < 1) {
        return NextResponse.json({ error: 'Missing required product details.' }, { status: 400 })
      }

      // Validate image count
      if (imageUrls.length > 10) {
        return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
      }

      // Validate that all imageUrls are strings
      if (!Array.isArray(imageUrls) || !imageUrls.every(url => typeof url === 'string')) {
        return NextResponse.json({ error: 'Invalid image URLs provided' }, { status: 400 })
      }

        await prisma.product.create({
            data: {
                name,
                description,
                mrp: mrpNum,
                price: priceNum,
                category,
                brand,
                condition,
                images: imageUrls,
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

// Get all products for a seller, or a single product by ID
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        
        // Check if user is authenticated before proceeding
        if (!userId) {
          return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const storeId = await authSeller(userId)
    
        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

        // Check if productId is provided in query params
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
    
        if (productId) {
            // Fetch single product with favorite count
            const product = await prisma.product.findFirst({
                where: { 
                    id: productId,
                    storeId // Ensure product belongs to seller's store
                },
                include: {
                    _count: {
                        select: {
                            favoritedBy: true
                        }
                    }
                }
            })

            if (!product) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 })
            }

            // Add favoriteCount to product object
            const productWithFavorites = {
                ...product,
                favoriteCount: product._count.favoritedBy
            }
            delete productWithFavorites._count

            return NextResponse.json({ product: productWithFavorites })
        }
    
        // Fetch all products with favorite counts
        const products = await prisma.product.findMany({ 
            where: { storeId },
            include: {
                _count: {
                    select: {
                        favoritedBy: true
                    }
                }
            }
        })
    
        // Add favoriteCount to each product
        const productsWithFavorites = products.map(product => ({
            ...product,
            favoriteCount: product._count.favoritedBy
        })).map(({ _count, ...product }) => product)
    
        return NextResponse.json({ products: productsWithFavorites })
    } catch (error) {
        console.error("Product GET Error:", error);
        return NextResponse.json({ error: error.code || error.message || 'An internal server error occurred.' }, { status: 500 })
    }
}

// Update an existing product
export async function PUT(request) {
    try {
        const { userId } = getAuth(request)
        
        // Check if user is authenticated before proceeding
        if (!userId) {
          return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized: Store not found for user.' }, { status: 401 })
        }

        const body = await request.json()
        const { productId, name, description, mrp, price, category, brand, condition, imageUrls } = body

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
        }

        // Verify product belongs to seller's store
        const existingProduct = await prisma.product.findFirst({
            where: { 
                id: productId,
                storeId 
            }
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 })
        }

        // Convert to numbers for validation
        const mrpNum = Number(mrp)
        const priceNum = Number(price)

        if (!name || !description || !mrpNum || !priceNum || !category || !brand || !condition || !imageUrls || imageUrls.length < 1) {
            return NextResponse.json({ error: 'Missing required product details.' }, { status: 400 })
        }

        // Validate image count
        if (imageUrls.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
        }

        // Validate that all imageUrls are strings
        if (!Array.isArray(imageUrls) || !imageUrls.every(url => typeof url === 'string')) {
            return NextResponse.json({ error: 'Invalid image URLs provided' }, { status: 400 })
        }

        // Update the product
        await prisma.product.update({
            where: { id: productId },
            data: {
                name,
                description,
                mrp: mrpNum,
                price: priceNum,
                category,
                brand,
                condition,
                images: imageUrls,
            }
        })

        return NextResponse.json({ message: "Product updated successfully" })

    } catch (error) {
        console.error("Product PUT Error:", error);
        return NextResponse.json({ error: error.code || error.message || 'An internal server error occurred.' }, { status: 500 })
    }
}