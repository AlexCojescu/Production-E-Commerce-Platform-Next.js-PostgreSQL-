import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



// Update user cart
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { cart } = await request.json()

    // Validate cart is an object
    if (!cart || typeof cart !== 'object' || Array.isArray(cart)) {
      return NextResponse.json({ error: 'Invalid cart format' }, { status: 400 })
    }

    // Save the cart to the user object
    await prisma.user.update({
      where: { id: userId },
      data: { cart: cart }
    })

    return NextResponse.json({ message: 'Cart updated' })
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update cart' }, { status: 400 })
  }
}

//Get user cart
export async function GET(request){
    try {
      const { userId } = getAuth(request)
  
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
  
      return NextResponse.json({ cart: user.cart })
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }