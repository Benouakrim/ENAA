import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VendorProfileEditClient from "./VendorProfileEditClient";

export default async function VendorProfileEditPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  if (!user?.vendorProfile) {
    redirect("/onboarding/vendor");
  }

  return <VendorProfileEditClient profile={JSON.parse(JSON.stringify(user.vendorProfile))} />;
}
