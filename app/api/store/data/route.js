import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  filterAllowedImageKitUrls,
  isAllowedImageKitUrl,
} from "@/lib/safeUrls";


export async function GET(request) {
    try {
      // Get store username from query params
      const { searchParams } = new URL(request.url)
      const username = searchParams.get('username').toLowerCase();
  
      if (!username) {
        return NextResponse.json({ error: "missing username" }, { status: 400 })
      }
  
      // Get store info and inStock products with ratings
      const store = await prisma.store.findUnique({
        where: {username, isActive: true},
        include: {
          Product: {
            where: { inStock: true },
            include: { rating: true }
          }
        }
      })
  
      if (!store) {
        return NextResponse.json({ error: "store not found" }, { status: 400 })
      }

      const sanitizedStore = {
        ...store,
        logo: isAllowedImageKitUrl(store.logo) ? store.logo : '',
        Product: store.Product.map((product) => ({
          ...product,
          images: filterAllowedImageKitUrls(product.images),
        })),
      }
      
      return NextResponse.json({ store: sanitizedStore })
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
      }
    }