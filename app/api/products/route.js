
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import {
  filterAllowedImageKitUrls,
  isAllowedImageKitUrl,
  sanitizeProfileImageUrl,
} from "@/lib/safeUrls";

function sanitizeProductImages(product) {
  return {
    ...product,
    images: filterAllowedImageKitUrls(product.images),
    store: product.store
      ? {
          ...product.store,
          logo: isAllowedImageKitUrl(product.store.logo) ? product.store.logo : '',
        }
      : product.store,
    rating: Array.isArray(product.rating)
      ? product.rating.map((entry) => ({
          ...entry,
          user: entry.user
            ? {
                ...entry.user,
                image: sanitizeProfileImageUrl(entry.user.image, ''),
              }
            : entry.user,
        }))
      : product.rating,
  }
}


export async function GET(request) {
        try {
            // Get userId if authenticated (optional)
            const { userId } = getAuth(request);

            let products = await prisma.product.findMany({
                where: {
                    OR: [
                        { inStock: true },
                        { sold: true }
                    ]
                },
                include: {
                rating: {
                    select: {
                    createdAt: true, rating: true, review: true,
                    user: { select: {name: true, image: true}}
                    }
                },
                store: true,
                _count: {
                    select: {
                        favoritedBy: true
                    }
                }
            },
        orderBy: { createdAt: 'desc' }
      })

    // Get user's favorites if authenticated
    let userFavorites = new Set();
    if (userId) {
        const favorites = await prisma.userFavorite.findMany({
            where: { userId },
            select: { productId: true }
        });
        userFavorites = new Set(favorites.map(fav => fav.productId));
    }

    // remove products with store isActive false and add favoriteCount and isFavorited
    products = products
        .filter(product => product.store.isActive)
        .map(sanitizeProductImages)
        .map(product => ({
            ...product,
            favoriteCount: product._count.favoritedBy,
            isFavorited: userId ? userFavorites.has(product.id) : false
        }))
        .map(({ _count, ...product }) => product)

    return NextResponse.json({products})
} catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An internal server error occurred." }, {
    status: 500
  });
}
}