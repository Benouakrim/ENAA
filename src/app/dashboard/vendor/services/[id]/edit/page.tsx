import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceFormClient from "../../new/ServiceFormClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get vendor profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  if (!user || user.role !== "VENDOR" || !user.vendorProfile) {
    redirect("/dashboard");
  }

  // Get the service
  const service = await prisma.serviceListing.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  // Verify ownership
  if (service.vendorId !== user.vendorProfile.id) {
    redirect("/dashboard/vendor/services");
  }

  return (
    <ServiceFormClient
      vendorProfile={{
        id: user.vendorProfile.id,
        city: user.vendorProfile.city,
        region: user.vendorProfile.region || "",
      }}
      mode="edit"
      service={{
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        city: service.city,
        region: service.region,
        address: service.address,
        priceType: service.priceType,
        price: service.price,
        priceMax: service.priceMax,
        priceRange: service.priceRange,
        eventTypes: service.eventTypes,
        styles: service.styles,
        amenities: service.amenities,
        images: service.images,
        minCapacity: service.minCapacity,
        maxCapacity: service.maxCapacity,
        active: service.active,
      }}
    />
  );
}
