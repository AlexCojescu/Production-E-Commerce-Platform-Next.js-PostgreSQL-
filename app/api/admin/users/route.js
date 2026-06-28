import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sanitizeProfileImageUrl } from "@/lib/safeUrls";

// Get all users
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        status: true,
                        isActive: true,
                    }
                },
                buyerOrders: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        paymentMethod: true,
                        isPaid: true,
                        isRefunded: true,
                        isCouponUsed: true,
                        address: {
                            select: {
                                name: true,
                                email: true,
                                street: true,
                                city: true,
                                state: true,
                                zip: true,
                                country: true,
                                phone: true,
                            },
                        },
                        store: {
                            select: {
                                name: true,
                                username: true,
                            },
                        },
                        orderItems: {
                            select: {
                                quantity: true,
                                price: true,
                                product: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        ratings: true,
                        Address: true,
                        favoriteProducts: true,
                        buyerOrders: true,
                    }
                }
            },
            orderBy: {
                email: 'asc'
            }
        });

        const sanitizedUsers = users.map((user) => ({
            ...user,
            image: sanitizeProfileImageUrl(user.image, ''),
        }));

        return NextResponse.json({ users: sanitizedUsers });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

