import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getServiceById } from "@/actions/service-actions";
import { ServiceType } from "@/lib/service-types";
import ServiceDetailClient from "./ServiceDetailClient";

interface PageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { type, id } = await params;

  // Validate service type
  const validTypes: ServiceType[] = [
    "venue", "caterer", "photographer", "dj", "decorator",
    "florist", "videographer", "makeup", "planner", "patisserie",
    "transport", "animator"
  ];

  if (!validTypes.includes(type as ServiceType)) {
    notFound();
  }

  const result = await getServiceById(type as ServiceType, id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ServiceDetailClient service={result.data} />;
}
