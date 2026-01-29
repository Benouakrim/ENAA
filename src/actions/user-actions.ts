"use server";

import { prisma } from "@/lib/prisma";
import { PriceRange, ServiceCategory } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

/**
 * Save user's wizard preferences (for CLIENT users) - Legacy single-value version
 */
export async function saveWizardPreferences(
  userId: string,
  preferences: {
    preferredEventType?: string;
    preferredVibe?: string;
    preferredBudget?: string;
    preferredGuestCount?: string;
    preferredServices?: string[];
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      preferredEventTypes: preferences.preferredEventType ? [preferences.preferredEventType] : [],
      preferredStyles: preferences.preferredVibe ? [preferences.preferredVibe] : [],
      preferredBudget: preferences.preferredBudget as PriceRange | undefined,
      preferredGuestCount: preferences.preferredGuestCount,
      wizardCompleted: true,
      onboardingCompleted: true,
    },
  });
}

/**
 * Save client preferences from the new wizard (supports multiple selections)
 * Uses the authenticated user from Clerk
 */
export async function saveClientPreferences(
  preferences: {
    preferredEventTypes?: string[];
    preferredStyles?: string[];
    preferredCategories?: string[];
    preferredBudget?: string;
    preferredGuestCount?: string;
    preferredRegion?: string;
  }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Non authentifié" };
  }
  
  // Map string categories to ServiceCategory enum values
  const categoryMap: Record<string, ServiceCategory> = {
    "Lieu/Salle": "VENUE",
    "Traiteur": "CATERER",
    "Photographe": "PHOTOGRAPHER",
    "DJ/Musique": "DJ",
    "Décoration": "DECORATOR",
    "Fleuriste": "FLORIST",
    "Vidéaste": "VIDEOGRAPHER",
    "Animation": "ANIMATOR",
    "Transport": "TRANSPORT",
    "Wedding Planner": "PLANNER",
    "Maquillage/Coiffure": "MAKEUP",
    "Pâtisserie": "PATISSERIE",
  };
  
  const mappedCategories = (preferences.preferredCategories || [])
    .map(cat => categoryMap[cat] || cat)
    .filter(cat => Object.values(categoryMap).includes(cat as ServiceCategory)) as ServiceCategory[];
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferredEventTypes: preferences.preferredEventTypes || [],
      preferredStyles: preferences.preferredStyles || [],
      preferredCategories: mappedCategories,
      preferredBudget: preferences.preferredBudget as PriceRange | undefined,
      preferredGuestCount: preferences.preferredGuestCount,
      preferredRegion: preferences.preferredRegion,
      wizardCompleted: preferences.preferredEventTypes && preferences.preferredEventTypes.length > 0,
      onboardingCompleted: true,
    },
  });
  
  return { success: true };
}

/**
 * Mark user's onboarding as completed
 * Uses the authenticated user from Clerk
 */
export async function completeOnboarding() {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Non authentifié" };
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { 
      onboardingCompleted: true,
    },
  });
  
  return { success: true };
}

/**
 * Update user's role and mark onboarding as started
 */
export async function updateUserRole(userId: string, role: "CLIENT" | "VENDOR") {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      role,
      onboardingCompleted: false,
    },
  });
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string, 
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    birthday?: Date;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Skip onboarding (marks it as completed without filling preferences)
 */
export async function skipOnboarding(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      onboardingCompleted: true,
      wizardCompleted: false, // User skipped, so wizard not completed
    },
  });
}

/**
 * Get user's onboarding status
 */
export async function getUserOnboardingStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      onboardingCompleted: true,
      wizardCompleted: true,
      role: true,
      preferredEventTypes: true,
      preferredBudget: true,
      preferredGuestCount: true,
      preferredStyles: true,
      preferredRegion: true,
      vendorProfile: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });

  return user;
}

/**
 * Get user's full profile
 */
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
      bookings: {
        include: {
          items: {
            include: {
              service: {
                include: {
                  vendor: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      favorites: {
        include: {
          service: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get client bookings
 */
export async function getClientBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          service: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get client favorites
 */
export async function getClientFavorites(userId: string) {
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      service: {
        include: {
          vendor: true,
          reviews: {
            take: 5,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Toggle favorite service
 */
export async function toggleFavorite(userId: string, serviceId: string) {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_serviceId: {
        userId,
        serviceId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { action: "removed" };
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        serviceId,
      },
    });
    return { action: "added" };
  }
}
