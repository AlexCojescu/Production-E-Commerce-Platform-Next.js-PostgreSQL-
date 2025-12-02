import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get all products (admin only)
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ products });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 500 });
    }
}

