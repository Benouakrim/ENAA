import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Get user's cart
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            service: {
              include: {
                vendor: {
                  select: { companyName: true, verified: true }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              service: {
                include: {
                  vendor: {
                    select: { companyName: true, verified: true }
                  }
                }
              }
            }
          }
        }
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      if (!item.service) return sum;
      return sum + item.service.price * item.quantity;
    }, 0);
    const platformFee = subtotal * 0.05; // 5% platform fee
    const total = subtotal + platformFee;

    return NextResponse.json({
      cart,
      subtotal,
      platformFee,
      total
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, eventDate, quantity = 1 } = body;

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify service exists
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        serviceId: serviceId,
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          serviceId: serviceId,
          selectedDate: eventDate ? new Date(eventDate) : null,
          quantity,
          unitPrice: service.price,
        },
      });
    }

    // Update cart timestamp
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    // Delete item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
