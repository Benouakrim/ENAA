import { redirect } from "next/navigation";

// Opportunities page redirects to vendor dashboard
// In the new supply-driven model, vendors manage services, not event opportunities
export default function EventDetailPage() {
  redirect("/dashboard/vendor/services");
}
