import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create-event(.*)",
  "/onboarding/vendor(.*)",
]);

// Define routes that don't require onboarding check
const isOnboardingRoute = createRouteMatcher([
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Check if the route is protected
  if (isProtectedRoute(req)) {
    // If user is not authenticated, redirect to sign-in
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check onboarding status (skip for onboarding routes)
    if (!isOnboardingRoute(req)) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            onboardingCompleted: true,
            role: true,
            vendorProfile: {
              select: { id: true },
            },
          },
        });

        // If user hasn't completed onboarding, redirect to onboarding
        if (user && !user.onboardingCompleted) {
          const onboardingUrl = new URL("/onboarding", req.url);
          return NextResponse.redirect(onboardingUrl);
        }

        // If vendor hasn't created vendor profile, redirect to vendor onboarding
        if (user && user.role === "VENDOR" && !user.vendorProfile) {
          const vendorOnboardingUrl = new URL("/onboarding/vendor", req.url);
          return NextResponse.redirect(vendorOnboardingUrl);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Continue on error to avoid blocking access
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
