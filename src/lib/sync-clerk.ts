import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { PriceRange, ServiceCategory } from "@prisma/client";

export interface SyncedUserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "CLIENT" | "VENDOR" | null;
  country: string | null;
  city: string | null;
  birthday: Date | null;
  onboardingCompleted: boolean;
  wizardCompleted: boolean;
  preferredEventTypes: string[];
  preferredStyles: string[];
  preferredBudget: PriceRange | null;
  preferredGuestCount: string | null;
  preferredCategories: ServiceCategory[];
  preferredRegion: string | null;
}

/**
 * Get country name from phone number prefix
 */
function getCountryFromPhone(phone: string): string | null {
  const countryPrefixes: Record<string, string> = {
    "+33": "France",
    "+1": "États-Unis",
    "+44": "Royaume-Uni",
    "+49": "Allemagne",
    "+39": "Italie",
    "+34": "Espagne",
    "+32": "Belgique",
    "+41": "Suisse",
    "+212": "Maroc",
    "+213": "Algérie",
    "+216": "Tunisie",
    "+221": "Sénégal",
    "+225": "Côte d'Ivoire",
    "+961": "Liban",
    "+7": "Russie",
    "+86": "Chine",
    "+81": "Japon",
    "+82": "Corée du Sud",
  };
  
  for (const [prefix, country] of Object.entries(countryPrefixes)) {
    if (phone.startsWith(prefix)) {
      return country;
    }
  }
  
  return null;
}

/**
 * Syncs the current Clerk user with our database
 * This ensures the user exists in our DB and returns their data
 */
export async function syncCurrentUser(): Promise<SyncedUserData | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  const primaryPhone = clerkUser.phoneNumbers.find(
    (p) => p.id === clerkUser.primaryPhoneNumberId
  )?.phoneNumber;

  // Try to extract country from phone number
  const phoneCountry = primaryPhone ? getCountryFromPhone(primaryPhone) : null;

  // Upsert user to database
  const user = await prisma.user.upsert({
    where: { id: clerkUser.id },
    create: {
      id: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      phone: primaryPhone || null,
      avatarUrl: clerkUser.imageUrl,
      country: phoneCountry,
    },
    update: {
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      // Only update phone if user signed up with phone
      ...(primaryPhone && { phone: primaryPhone }),
      avatarUrl: clerkUser.imageUrl,
      // Only update country from phone if not already set
      ...(!phoneCountry ? {} : {}),
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role as "CLIENT" | "VENDOR" | null,
    country: user.country,
    city: user.city,
    birthday: user.birthday,
    onboardingCompleted: user.onboardingCompleted,
    wizardCompleted: user.wizardCompleted,
    preferredEventTypes: user.preferredEventTypes,
    preferredStyles: user.preferredStyles,
    preferredBudget: user.preferredBudget,
    preferredGuestCount: user.preferredGuestCount,
    preferredCategories: user.preferredCategories,
    preferredRegion: user.preferredRegion,
  };
}

/**
 * Get Clerk user data without database sync
 * Useful for pre-populating wizard fields
 */
export async function getClerkUserData() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  const primaryPhone = clerkUser.phoneNumbers.find(
    (p) => p.id === clerkUser.primaryPhoneNumberId
  )?.phoneNumber;

  const phoneCountry = primaryPhone ? getCountryFromPhone(primaryPhone) : null;

  return {
    id: clerkUser.id,
    email: primaryEmail || "",
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    phone: primaryPhone || "",
    avatarUrl: clerkUser.imageUrl || "",
    country: phoneCountry || "",
    // Check if user signed up with Google/OAuth
    hasGoogleAccount: clerkUser.externalAccounts?.some(acc => acc.provider === "google"),
    hasPhoneSignup: !!primaryPhone,
    hasEmailSignup: !!primaryEmail,
  };
}

/**
 * Get user data from database (without syncing from Clerk)
 */
export async function getUserFromDb(userId: string): Promise<SyncedUserData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role as "CLIENT" | "VENDOR" | null,
    country: user.country,
    city: user.city,
    birthday: user.birthday,
    onboardingCompleted: user.onboardingCompleted,
    wizardCompleted: user.wizardCompleted,
    preferredEventTypes: user.preferredEventTypes,
    preferredStyles: user.preferredStyles,
    preferredBudget: user.preferredBudget,
    preferredGuestCount: user.preferredGuestCount,
    preferredCategories: user.preferredCategories,
    preferredRegion: user.preferredRegion,
  };
}

/**
 * Get current authenticated user from database
 */
export async function getCurrentUser(): Promise<SyncedUserData | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return getUserFromDb(userId);
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
 * Mark user's onboarding as completed
 */
export async function completeOnboarding(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      onboardingCompleted: true,
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
 * Save user's wizard preferences (for CLIENT users)
 */
export async function saveWizardPreferences(
  userId: string,
  preferences: {
    preferredEventTypes?: string[];
    preferredStyles?: string[];
    preferredBudget?: string;
    preferredGuestCount?: string;
    preferredCategories?: string[];
    preferredRegion?: string;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      preferredEventTypes: preferences.preferredEventTypes || [],
      preferredStyles: preferences.preferredStyles || [],
      preferredBudget: preferences.preferredBudget as any,
      preferredGuestCount: preferences.preferredGuestCount,
      preferredCategories: preferences.preferredCategories as any || [],
      preferredRegion: preferences.preferredRegion,
    },
  });
}

/**
 * Get user's wizard preferences
 */
export async function getWizardPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredEventTypes: true,
      preferredStyles: true,
      preferredBudget: true,
      preferredGuestCount: true,
      preferredCategories: true,
      preferredRegion: true,
    },
  });

  return user;
}
