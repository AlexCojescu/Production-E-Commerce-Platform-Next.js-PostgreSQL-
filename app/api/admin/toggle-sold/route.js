import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Toggle product sold status (admin only)
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: 'missing productId' }, { status: 400 });
        }

        // Find the product
        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            return NextResponse.json({ error: "product not found" }, { status: 404 });
        }

        // Toggle sold status
        await prisma.product.update({
            where: { id: productId },
            data: { sold: !product.sold }
        });

        return NextResponse.json({ 
            message: `Product ${!product.sold ? 'marked as sold' : 'marked as available'} successfully`,
            sold: !product.sold
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 500 });
    }
}

