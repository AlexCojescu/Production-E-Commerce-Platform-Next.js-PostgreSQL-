import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/requiredEnv";
import { readJsonBody } from "@/lib/apiGuard";

// Delete a user and all related data
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const parsed = await readJsonBody(request);
        if (parsed.error) return parsed.error;
        const { userToDeleteId } = parsed.body;

        if (!userToDeleteId) {
            return NextResponse.json({ error: 'missing userToDeleteId' }, { status: 400 });
        }

        // Prevent admin from deleting themselves
        if (userToDeleteId === userId) {
            return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
        }

        // Find the user to verify it exists
        const user = await prisma.user.findUnique({ 
            where: { id: userToDeleteId },
            include: {
                store: true,
                buyerOrders: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "user not found" }, { status: 404 });
        }

        if (isAdminEmail(user.email)) {
            return NextResponse.json({ error: 'Cannot delete an admin account' }, { status: 403 });
        }

        // Delete all orders for this user first (to handle foreign key constraint)
        // OrderItems will be cascade deleted automatically
        await prisma.order.deleteMany({
            where: { userId: userToDeleteId }
        });

        // Delete the store if it exists (to handle foreign key constraint)
        // Products will be cascade deleted automatically
        if (user.store) {
            // Delete all orders for the store first
            await prisma.order.deleteMany({
                where: { storeId: user.store.id }
            });
            
            // Then delete the store
            await prisma.store.delete({
                where: { id: user.store.id }
            });
        }

        // Delete the user
        // Ratings, Addresses, and UserFavorites will be cascade deleted automatically
        await prisma.user.delete({
            where: { id: userToDeleteId }
        });

        return NextResponse.json({ message: "User deleted successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

