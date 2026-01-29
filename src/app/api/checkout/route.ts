import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      cartId, 
      eventDate, 
      eventAddress, 
      notes,
      firstName,
      lastName,
      email,
      phone 
    } = body;

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId, userId: user.id },
      include: {
        items: {
          include: {
            service: {
              include: {
                vendor: true
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Filter out items with null services
    const validItems = cart.items.filter(item => item.service !== null);
    
    if (validItems.length === 0) {
      return NextResponse.json({ error: "No valid items in cart" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.service!.price * item.quantity, 0);
    const platformFee = subtotal * 0.05; // 5% platform fee
    const totalAmount = subtotal + platformFee;

    // Create booking with items
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        eventCity: eventAddress || null,
        status: 'PENDING',
        subtotal: subtotal,
        serviceFee: platformFee,
        total: totalAmount,
        notes: notes || null,
        contactName: `${firstName || ''} ${lastName || ''}`.trim() || null,
        contactEmail: email || null,
        contactPhone: phone || null,
        items: {
          create: validItems.map(item => {
            const service = item.service!;
            return {
              serviceId: item.serviceId,
              serviceName: service.title,
              vendorName: service.vendor.companyName,
              category: service.category,
              unitPrice: service.price,
              quantity: item.quantity,
              total: service.price * item.quantity,
              status: 'PENDING',
            };
          })
        }
      },
      include: {
        items: true
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        platformFee: platformFee,
        vendorPayout: subtotal,
        status: 'PENDING',
      }
    });

    // Clear cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // In a real implementation, you would:
    // 1. Create a Stripe checkout session
    // 2. Return the checkout URL for redirection
    // 3. Handle webhook for payment confirmation
    
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      bookingId: booking.id,
      // In production, you'd return:
      // checkoutUrl: stripeSession.url
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
