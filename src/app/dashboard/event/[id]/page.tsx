import { redirect } from "next/navigation";

/**
 * DEPRECATED: Event system replaced with direct booking flow
 * Redirects to client bookings page
 */
export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // The event system has been replaced with a direct booking model
  // Redirect to bookings page
  redirect("/dashboard/client/bookings");
}
