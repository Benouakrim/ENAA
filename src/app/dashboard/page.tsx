import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user exists and get their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  // If user doesn't exist in our DB, they need to complete onboarding
  if (!user) {
    redirect("/onboarding");
  }

  // Redirect based on role
  if (user.role === "VENDOR") {
    // If vendor has no profile, go to vendor onboarding
    if (!user.vendorProfile) {
      redirect("/onboarding/vendor");
    }
    redirect("/dashboard/vendor");
  } else {
    redirect("/dashboard/client");
  }
}
