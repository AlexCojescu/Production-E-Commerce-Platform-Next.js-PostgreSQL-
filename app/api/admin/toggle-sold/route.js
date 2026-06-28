import prisma from '@/lib/prisma'
import authAdmin from '@/middlewares/authAdmin'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { readJsonBody } from '@/lib/apiGuard'

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const isAdmin = await authAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 })
    }

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error
    const { productId } = parsed.body

    if (!productId) {
      return NextResponse.json({ error: 'missing productId' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) {
      return NextResponse.json({ error: 'product not found' }, { status: 404 })
    }

    const nextSold = !product.sold

    if (nextSold) {
      const hasSoldFields =
        product.dateSold != null &&
        product.soldPrice != null &&
        Number.isFinite(product.soldPrice)

      if (!hasSoldFields) {
        return NextResponse.json(
          {
            error:
              'Set date sold and sold price via Edit before marking as sold',
            requiresEdit: true,
          },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: nextSold
        ? { sold: true }
        : { sold: false, dateSold: null, soldPrice: null },
    })

    return NextResponse.json({
      message: `Product ${nextSold ? 'marked as sold' : 'marked as available'} successfully`,
      sold: updated.sold,
      product: updated,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.code || error.message }, { status: 500 })
  }
}
