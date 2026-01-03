import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Approve Seller
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    // ... continued from previous code snippets ...

    const { storeId, status } = await request.json();

    if (status === 'approved') {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true }
      })
    } else if (status === 'rejected') {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "rejected" }
      })
    }

    // ... continuation of the POST function's logic
    return NextResponse.json({ message: status + ' successfully' })

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
} // End of POST function

// get all pending and rejected stores
export async function GET(request) {
    try {
      const { userId } = getAuth(request);
      const isAdmin = await authAdmin(userId);
  
      if (!isAdmin) {
        return NextResponse.json({ error: 'not authorized' }, { status: 401 });
      }
  
      const stores = await prisma.store.findMany({
        where: { status: { in: ["pending", "rejected"] } },
        include: { user: true },
        orderBy: { createdAt: 'desc' } // Most recent first
      });
  
      console.log(`Admin ${userId} requested pending stores. Found ${stores.length} stores.`);
      
      return NextResponse.json({ stores });
      
    } catch (error) {
        console.error('Error fetching pending stores:', error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 });
    }
  }