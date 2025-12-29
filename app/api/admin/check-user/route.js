import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Check if a user exists in Clerk and database
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'email is required' }, { status: 400 });
        }

        // Check database
        const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { store: true }
        });

        // Check Clerk
        let clerkUser = null;
        let clerkError = null;
        try {
            const client = await clerkClient();
            // Search for user by email in Clerk
            const users = await client.users.getUserList({
                emailAddress: [email]
            });
            if (users.data && users.data.length > 0) {
                clerkUser = users.data[0];
            }
        } catch (error) {
            clerkError = error.message;
        }

        return NextResponse.json({
            email,
            inDatabase: !!dbUser,
            inClerk: !!clerkUser,
            dbUser: dbUser ? {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                hasStore: !!dbUser.store,
                storeStatus: dbUser.store?.status
            } : null,
            clerkUser: clerkUser ? {
                id: clerkUser.id,
                emailAddresses: clerkUser.emailAddresses.map(e => e.emailAddress),
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName
            } : null,
            clerkError
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
}

