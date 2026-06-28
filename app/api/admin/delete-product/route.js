import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/apiGuard";

// Delete a product (admin only)
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const parsed = await readJsonBody(request);
        if (parsed.error) return parsed.error;
        const { productId } = parsed.body;

        if (!productId) {
            return NextResponse.json({ error: 'missing productId' }, { status: 400 });
        }

        // Find the product with order items and their related orders
        const product = await prisma.product.findUnique({ 
            where: { id: productId },
            include: {
                orderItems: {
                    include: {
                        order: {
                            select: {
                                id: true,
                                status: true
                            }
                        }
                    }
                },
                rating: true,
                favoritedBy: true
            }
        });

        if (!product) {
            return NextResponse.json({ error: "product not found" }, { status: 404 });
        }

        // Check if product has been ordered and if any orders are not delivered
        if (product.orderItems && product.orderItems.length > 0) {
            // Check if all orders containing this product are DELIVERED
            const allOrdersDelivered = product.orderItems.every(orderItem => 
                orderItem.order.status === 'DELIVERED'
            );

            if (!allOrdersDelivered) {
                return NextResponse.json({ 
                    error: "Cannot delete product that has pending orders. Only products with all orders delivered can be deleted." 
                }, { status: 400 });
            }

            // Delete all OrderItems for this product first (since they don't cascade)
            await prisma.orderItem.deleteMany({
                where: { productId: productId }
            });
        }

        // Delete related records that don't cascade
        // Delete ratings
        await prisma.rating.deleteMany({
            where: { productId: productId }
        });

        // Delete favorites
        await prisma.userFavorite.deleteMany({
            where: { productId: productId }
        });

        // Delete the product
        await prisma.product.delete({
            where: { id: productId }
        });

        return NextResponse.json({ 
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 500 });
    }
}

