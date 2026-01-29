import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Ensures the current Clerk user exists in the database
 * Creates the user if they don't exist
 * Returns the user from the database
 */
export async function ensureUserExists() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Check if user exists in database by ID
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If user doesn't exist, create them
  if (!user) {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
    const primaryPhone = clerkUser.phoneNumbers.find(
      (p) => p.id === clerkUser.primaryPhoneNumberId
    )?.phoneNumber;

    // Helper to extract country from phone number
    const getCountryFromPhone = (phoneNumber: string): string | null => {
      const countryMap: Record<string, string> = {
        '+33': 'France',
        '+212': 'Maroc',
        '+213': 'Algérie',
        '+216': 'Tunisie',
        '+1': 'USA/Canada',
        '+44': 'Royaume-Uni',
        '+32': 'Belgique',
        '+41': 'Suisse',
        '+34': 'Espagne',
        '+39': 'Italie',
        '+49': 'Allemagne',
      };
      
      for (const [code, country] of Object.entries(countryMap)) {
        if (phoneNumber.startsWith(code)) {
          return country;
        }
      }
      return null;
    };

    const phoneCountry = primaryPhone ? getCountryFromPhone(primaryPhone) : null;

    // Try to create or update user, handling duplicate email conflicts
    try {
      // Check if a user with this email already exists (from webhook or other source)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: primaryEmail },
      });

      if (existingUserByEmail && existingUserByEmail.id !== userId) {
        // Delete the old user record and create a new one with correct Clerk ID
        // This handles cases where webhook created user with different ID
        await prisma.user.delete({
          where: { email: primaryEmail },
        });
      }

      // Create or update user with correct Clerk userId
      user = await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          phone: primaryPhone || null,
          avatarUrl: clerkUser.imageUrl,
          country: phoneCountry,
          role: "CLIENT", // Default role
        },
        update: {
          email: primaryEmail,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          phone: primaryPhone || null,
          avatarUrl: clerkUser.imageUrl,
          ...(phoneCountry && { country: phoneCountry }),
        },
      });
    } catch (error: any) {
      // If there's still a duplicate key error, try to find and update the existing user
      if (error.code === 'P2002' || error.code === '23505') {
        // Find user by email and update it
        const existingUser = await prisma.user.findUnique({
          where: { email: primaryEmail },
        });
        
        if (existingUser) {
          // Update existing user
          user = await prisma.user.update({
            where: { email: primaryEmail },
            data: {
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              phone: primaryPhone || null,
              avatarUrl: clerkUser.imageUrl,
              ...(phoneCountry && { country: phoneCountry }),
            },
          });
        } else {
          // Re-throw if we can't find the user
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  return user;
}

/**
 * Updates the role of the current user
 */
export async function updateUserRole(role: "CLIENT" | "VENDOR") {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Ensure user exists first
  await ensureUserExists();

  // Update user role
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return user;
}

/**
 * Checks if the current user has completed onboarding
 * For vendors, this means they have a vendor profile
 * For clients, they can proceed directly
 */
export async function checkOnboardingStatus() {
  const { userId } = await auth();
  
  if (!userId) {
    return { completed: false, role: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  if (!user) {
    return { completed: false, role: null };
  }

  // If user is a vendor, check if they have a vendor profile
  if (user.role === "VENDOR") {
    return {
      completed: !!user.vendorProfile,
      role: user.role,
      needsVendorProfile: !user.vendorProfile,
    };
  }

  return { completed: true, role: user.role };
}
