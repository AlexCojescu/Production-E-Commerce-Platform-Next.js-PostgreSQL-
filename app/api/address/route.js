
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
      const { userId } = getAuth(request)
      const { address } = await request.json()

      address.userId = userId

      const newAddress = await prisma.address.create({
        data: address
      })
      // Save the cart to the user object
  
      return NextResponse.json({newAddress, message: 'Address added succesfully' })
    } catch (error) {
      // Catch block logic would go here
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}


//get all addresses for user
export async function GET(request){
    try {
      const { userId } = getAuth(request)
     
      const addresses = await prisma.address.findMany({
        where: { userId }
      })
      // Save the cart to the user object
  
      return NextResponse.json({addresses})
    } catch (error) {
      // Catch block logic would go here
      console.error(error);
      return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

