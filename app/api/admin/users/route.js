import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        createdAt: true,
                    }
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

        return NextResponse.json({ users });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

