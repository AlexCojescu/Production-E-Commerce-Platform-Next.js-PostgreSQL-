import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Delete a store and all related data
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { storeId } = await request.json();

        if (!storeId) {
            return NextResponse.json({ error: 'missing storeId' }, { status: 400 });
        }

        // Find the store to verify it exists
        const store = await prisma.store.findUnique({ 
            where: { id: storeId }
        });

        if (!store) {
            return NextResponse.json({ error: "store not found" }, { status: 404 });
        }

        // Delete all orders for this store first (to handle foreign key constraint)
        // OrderItems will be cascade deleted automatically
        await prisma.order.deleteMany({
            where: { storeId: storeId }
        });

        // Delete the store
        // Products will be cascade deleted automatically (onDelete: Cascade in schema)
        // Ratings and UserFavorites related to products will also be cascade deleted
        await prisma.store.delete({
            where: { id: storeId }
        });

        return NextResponse.json({ message: "Store deleted successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

