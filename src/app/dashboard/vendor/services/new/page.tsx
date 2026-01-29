import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceFormClient from "./ServiceFormClient";

export default async function NewServicePage() {
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

  return (
    <ServiceFormClient 
      vendorProfile={{
        id: user.vendorProfile.id,
        city: user.vendorProfile.city,
        region: user.vendorProfile.region || "",
      }}
      mode="create"
    />
  );
}
