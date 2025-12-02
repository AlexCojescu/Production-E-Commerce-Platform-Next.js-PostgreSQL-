
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request) {
        try {
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

    // remove products with store isActive false and add favoriteCount
    products = products
        .filter(product => product.store.isActive)
        .map(product => ({
            ...product,
            favoriteCount: product._count.favoritedBy
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