"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ServiceCategory, PriceRange } from "@prisma/client";
import { z } from "zod";

const ServiceListingSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(50, "La description doit contenir au moins 50 caractères"),
  category: z.nativeEnum(ServiceCategory),
  city: z.string().min(2, "La ville est requise"),
  region: z.string().optional(),
  address: z.string().optional(),
  priceType: z.string(),
  price: z.number().min(0, "Le prix doit être positif"),
  priceMax: z.number().optional(),
  priceRange: z.nativeEnum(PriceRange),
  eventTypes: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  minCapacity: z.number().optional(),
  maxCapacity: z.number().optional(),
  active: z.boolean().optional(),
});

/**
 * Create a new service listing
 */
export async function createServiceListing(data: unknown) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    // Get vendor profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    // Validate input
    const validatedData = ServiceListingSchema.parse(data);

    // Create the service
    const service = await prisma.serviceListing.create({
      data: {
        vendorId: user.vendorProfile.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        city: validatedData.city,
        region: validatedData.region || user.vendorProfile.region || "",
        address: validatedData.address,
        priceType: validatedData.priceType,
        price: validatedData.price,
        priceMax: validatedData.priceMax,
        priceRange: validatedData.priceRange,
        eventTypes: validatedData.eventTypes || [],
        styles: validatedData.styles || [],
        amenities: validatedData.amenities || [],
        images: validatedData.images || [],
        minCapacity: validatedData.minCapacity,
        maxCapacity: validatedData.maxCapacity,
        active: validatedData.active ?? true,
      },
    });

    revalidatePath("/dashboard/vendor/services");
    revalidatePath("/services");

    return { success: true, data: service };
  } catch (error) {
    console.error("Error creating service:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Données invalides",
        details: error.issues,
      };
    }

    return { success: false, error: "Erreur lors de la création du service." };
  }
}

/**
 * Update an existing service listing
 */
export async function updateServiceListing(serviceId: string, data: unknown) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    // Get vendor profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    // Verify ownership
    const existingService = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: "Service introuvable." };
    }

    if (existingService.vendorId !== user.vendorProfile.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier ce service." };
    }

    // Validate input
    const validatedData = ServiceListingSchema.parse(data);

    // Update the service
    const service = await prisma.serviceListing.update({
      where: { id: serviceId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        city: validatedData.city,
        region: validatedData.region,
        address: validatedData.address,
        priceType: validatedData.priceType,
        price: validatedData.price,
        priceMax: validatedData.priceMax,
        priceRange: validatedData.priceRange,
        eventTypes: validatedData.eventTypes || [],
        styles: validatedData.styles || [],
        amenities: validatedData.amenities || [],
        images: validatedData.images || [],
        minCapacity: validatedData.minCapacity,
        maxCapacity: validatedData.maxCapacity,
        active: validatedData.active,
      },
    });

    revalidatePath("/dashboard/vendor/services");
    revalidatePath(`/dashboard/vendor/services/${serviceId}/edit`);
    revalidatePath("/services");

    return { success: true, data: service };
  } catch (error) {
    console.error("Error updating service:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Données invalides",
        details: error.issues,
      };
    }

    return { success: false, error: "Erreur lors de la mise à jour du service." };
  }
}

/**
 * Delete a service listing
 */
export async function deleteServiceListing(serviceId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    // Get vendor profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    // Verify ownership
    const existingService = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: "Service introuvable." };
    }

    if (existingService.vendorId !== user.vendorProfile.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à supprimer ce service." };
    }

    // Delete the service
    await prisma.serviceListing.delete({
      where: { id: serviceId },
    });

    revalidatePath("/dashboard/vendor/services");
    revalidatePath("/services");

    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Erreur lors de la suppression du service." };
  }
}

/**
 * Toggle service active status
 */
export async function toggleServiceStatus(serviceId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    // Get vendor profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    // Verify ownership
    const existingService = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: "Service introuvable." };
    }

    if (existingService.vendorId !== user.vendorProfile.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à modifier ce service." };
    }

    // Toggle status
    const service = await prisma.serviceListing.update({
      where: { id: serviceId },
      data: { active: !existingService.active },
    });

    revalidatePath("/dashboard/vendor/services");
    revalidatePath("/services");

    return { success: true, data: service };
  } catch (error) {
    console.error("Error toggling service status:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }
}

/**
 * Get a single service listing by ID (for editing)
 */
export async function getServiceListingById(serviceId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Non autorisé." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user?.vendorProfile) {
      return { success: false, error: "Profil vendeur introuvable." };
    }

    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return { success: false, error: "Service introuvable." };
    }

    if (service.vendorId !== user.vendorProfile.id) {
      return { success: false, error: "Vous n'êtes pas autorisé à voir ce service." };
    }

    return { success: true, data: service };
  } catch (error) {
    console.error("Error fetching service:", error);
    return { success: false, error: "Erreur lors de la récupération du service." };
  }
}
