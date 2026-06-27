import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody, inputValidationResponse } from "@/lib/apiGuard";
import { validateCartPayload } from "@/lib/inputLimits";

// Update user cart
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limited = enforceRateLimit(request, { userId, scope: 'cart' })
    if (limited) return limited

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error

    const cart = validateCartPayload(parsed.body?.cart)

    await prisma.user.update({
      where: { id: userId },
      data: { cart: cart }
    })

    return NextResponse.json({ message: 'Cart updated' })
  } catch (error) {
    const validation = inputValidationResponse(error)
    if (validation) return validation
    console.error('Cart update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update cart' }, { status: 400 })
  }
}

//Get user cart
export async function GET(request){
    try {
      const { userId } = getAuth(request)
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
  
      return NextResponse.json({ cart: user?.cart ?? {} })
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }
