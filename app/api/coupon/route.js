import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody, inputValidationResponse, RATE_LIMITS } from "@/lib/apiGuard";
import { requireCouponCode, InputValidationError } from "@/lib/inputLimits";

// Verify coupon
export async function POST(request) {
  try {
    const { userId, has } = getAuth(request)

    const limited = enforceRateLimit(request, {
      userId,
      scope: 'coupon',
      ...RATE_LIMITS.STRICT,
    })
    if (limited) return limited

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error
    const { code: rawCode } = parsed.body

    const code = requireCouponCode(rawCode)

    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
        expiresAt: { gt: new Date() }
      }
    })

    if (!coupon) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
      }
  
      if (coupon.forNewUser) {
        if (userId) {
          const userorders = await prisma.order.findMany({where: {userId}})
          if (userorders.length > 0) {
            return NextResponse.json({ error: "Coupon valid for new users" }, {
              status: 400
            })
          }
        }
      }
  
      if (coupon.forMember) {
        const hasPlusPlan = has({ plan: 'plus' })
        if (!hasPlusPlan) {
          return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 })
        }
      }
  
      return NextResponse.json({coupon})
    } catch (error) {
      const validation = inputValidationResponse(error)
      if (validation) return validation
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
  }
