import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServices } from "@/actions/service-actions";
import { ServiceType } from "@/lib/service-types";
import { getCurrentUser } from "@/lib/sync-clerk";
import ServicesClient from "./ServicesClient";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    region?: string;
    eventType?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const serviceType = (params.type as ServiceType) || "venue";
  const region = params.region || "";
  const eventType = params.eventType || "";
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);

  // Get user preferences
  const dbUser = await getCurrentUser();

  // Fetch initial services
  const result = await getServices({
    serviceType,
    region: region || undefined,
    eventType: eventType || undefined,
    search: search || undefined,
    page,
    limit: 12,
  });

  return (
    <ServicesClient
      initialServices={result.data}
      initialPagination={result.pagination}
      userPreferences={{
        preferredEventTypes: dbUser?.preferredEventTypes || [],
        preferredRegion: dbUser?.preferredRegion || null,
        preferredBudget: dbUser?.preferredBudget || null,
        preferredCategories: dbUser?.preferredCategories || [],
      }}
    />
  );
}
