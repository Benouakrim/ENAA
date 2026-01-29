import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Get cart item count
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ count: 0 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    // Get cart with items count
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({ count: cart?._count?.items || 0 });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 });
  }
}
