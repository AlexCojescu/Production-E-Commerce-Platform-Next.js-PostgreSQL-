import prisma from '@/lib/prisma'
import authAdmin from '@/middlewares/authAdmin'
import { buildAdminProductUpdateData } from '@/lib/adminProductValidation'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { readJsonBody } from '@/lib/apiGuard'

const productInclude = {
  store: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
}

async function requireAdmin(request) {
  const { userId } = getAuth(request)
  const isAdmin = await authAdmin(userId)

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'not authorized' }, { status: 401 }) }
  }

  return { userId }
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const products = await prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.code || error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const parsed = await readJsonBody(request)
    if (parsed.error) return parsed.error
    const body = parsed.body
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } })
    if (!existing) {
      return NextResponse.json({ error: 'product not found' }, { status: 404 })
    }

    const result = buildAdminProductUpdateData(body)
    if (result.error) {
      const firstError = Object.values(result.error)[0]
      return NextResponse.json({ error: firstError, errors: result.error }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: result.data,
      include: productInclude,
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.code || error.message }, { status: 500 })
  }
}
