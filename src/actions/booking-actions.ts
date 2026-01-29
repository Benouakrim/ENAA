"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@prisma/client";

/**
 * Update the status of a booking item (for vendors)
 */
export async function updateBookingItemStatus(
  bookingItemId: string,
  newStatus: string
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    // Verify the booking item belongs to this vendor
    const bookingItem = await prisma.bookingItem.findUnique({
      where: { id: bookingItemId },
      include: {
        service: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!bookingItem || !bookingItem.service) {
      return { success: false, error: "Réservation introuvable." };
    }

    if (bookingItem.service.vendor.userId !== userId) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier cette réservation." };
    }

    // Update the booking item status
    await prisma.bookingItem.update({
      where: { id: bookingItemId },
      data: { status: newStatus as BookingStatus },
    });

    // If all items in the booking are completed, update the main booking status
    const booking = await prisma.booking.findFirst({
      where: {
        items: { some: { id: bookingItemId } },
      },
      include: { items: true },
    });

    if (booking) {
      const allCompleted = booking.items.every((item) => item.status === "COMPLETED");
      const allCancelled = booking.items.every((item) => item.status === "CANCELLED");
      const anyConfirmed = booking.items.some((item) => item.status === "CONFIRMED");

      if (allCompleted) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        });
      } else if (allCancelled) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        });
      } else if (anyConfirmed && booking.status === "PENDING") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" },
        });
      }
    }

    revalidatePath("/dashboard/vendor/bookings");
    revalidatePath("/dashboard/client/bookings");

    return { success: true };
  } catch (error) {
    console.error("Error updating booking item status:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }
}

/**
 * Get booking details (for vendor)
 */
export async function getVendorBookingDetails(bookingItemId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    const bookingItem = await prisma.bookingItem.findUnique({
      where: { id: bookingItemId },
      include: {
        service: {
          include: {
            vendor: true,
          },
        },
        booking: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!bookingItem || !bookingItem.service) {
      return { success: false, error: "Réservation introuvable." };
    }

    if (bookingItem.service.vendor.userId !== userId) {
      return { success: false, error: "Vous n'êtes pas autorisé à voir cette réservation." };
    }

    return { success: true, data: bookingItem };
  } catch (error) {
    console.error("Error getting booking details:", error);
    return { success: false, error: "Erreur lors de la récupération des détails." };
  }
}

/**
 * Get earnings summary for vendor
 */
export async function getVendorEarnings() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
      },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    // Get all booking items for this vendor
    const bookingItems = await prisma.bookingItem.findMany({
      where: {
        service: {
          vendorId: user.vendorProfile.id,
        },
      },
      include: {
        booking: {
          include: {
            transactions: true,
          },
        },
        service: true,
      },
    });

    // Calculate earnings
    const completedItems = bookingItems.filter(
      (item) => item.status === "COMPLETED" || item.status === "PAID"
    );
    const totalEarnings = completedItems.reduce((sum, item) => sum + item.total, 0);
    const pendingEarnings = bookingItems
      .filter((item) => item.status === "CONFIRMED" || item.status === "IN_PROGRESS")
      .reduce((sum, item) => sum + item.total, 0);

    // Get transactions for detailed history
    const transactions = await prisma.transaction.findMany({
      where: {
        booking: {
          items: {
            some: {
              service: {
                vendorId: user.vendorProfile.id,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        booking: true,
      },
    });

    // Monthly breakdown
    const now = new Date();
    const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      
      const monthItems = completedItems.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      });
      
      return {
        month: monthName,
        earnings: monthItems.reduce((sum, item) => sum + item.total, 0),
        count: monthItems.length,
      };
    }).reverse();

    return {
      success: true,
      data: {
        totalEarnings,
        pendingEarnings,
        totalBookings: bookingItems.length,
        completedBookings: completedItems.length,
        transactions,
        monthlyEarnings,
      },
    };
  } catch (error) {
    console.error("Error getting vendor earnings:", error);
    return { success: false, error: "Erreur lors de la récupération des revenus." };
  }
}
