"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureUserExists } from "@/lib/sync-user";
import { z } from "zod";

// Zod Schema for Vendor Profile Validation
const VendorProfileSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  description: z.string().min(50, "La description doit contenir au moins 50 caractères"),
  city: z.string().min(2, "La ville est requise"),
});

/**
 * Create a vendor profile for the current logged-in user
 */
export async function createVendorProfile(data: unknown) {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter pour créer un profil prestataire.",
      };
    }

    // Validate the input data
    const validatedData = VendorProfileSchema.parse(data);

    // Ensure user exists in database
    let user = await ensureUserExists();
    
    if (!user) {
      return {
        success: false,
        error: "Impossible de récupérer les informations utilisateur. Veuillez réessayer.",
      };
    }

    // Check if user already has vendor profile
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return {
        success: false,
        error: "Vous avez déjà un profil prestataire.",
      };
    }

    // Update user's role to VENDOR
    user = await prisma.user.update({
      where: { id: userId },
      data: { role: "VENDOR" },
    });

    // Create the vendor profile
    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: userId,
        companyName: validatedData.companyName,
        description: validatedData.description,
        city: validatedData.city,
        verified: false, // Will be verified by admin later
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard/vendor");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: vendorProfile,
    };
  } catch (error) {
    console.error("Error creating vendor profile:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Erreur de validation",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: "Une erreur est survenue lors de la création de votre profil. Veuillez réessayer.",
    };
  }
}

/**
 * Get the vendor profile for the current user
 */
export async function getVendorProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Non autorisé.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
      },
    });

    if (!user || !user.vendorProfile) {
      return {
        success: false,
        error: "Profil prestataire introuvable.",
      };
    }

    return {
      success: true,
      data: user.vendorProfile,
    };
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du profil.",
    };
  }
}

/**
 * Update vendor profile
 */
export async function updateVendorProfile(data: {
  companyName?: string;
  description?: string;
  city?: string;
  region?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  yearFounded?: number;
  teamSize?: string;
  travelRadius?: number;
  responseTime?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter.",
      };
    }

    // Get vendor profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
      },
    });

    if (!user?.vendorProfile) {
      return {
        success: false,
        error: "Profil prestataire introuvable.",
      };
    }

    // Update the profile
    const updatedProfile = await prisma.vendorProfile.update({
      where: { id: user.vendorProfile.id },
      data: {
        ...data,
      },
    });

    // Revalidate paths
    revalidatePath("/dashboard/vendor/profile");
    revalidatePath("/dashboard/vendor");

    return {
      success: true,
      data: updatedProfile,
    };
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil.",
    };
  }
}

/**
 * DEPRECATED: Submit a proposal for an event
 * The demand-driven proposal model has been replaced with a supply-driven marketplace model.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitProposal(_data?: {
  eventId: string;
  price: number;
  message: string;
}) {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Le modèle de propositions a été remplacé par un système de réservation directe.",
  };
}
