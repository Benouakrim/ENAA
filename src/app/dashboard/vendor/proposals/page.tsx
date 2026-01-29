import { redirect } from "next/navigation";

// Proposals page redirects to vendor dashboard
// In the new supply-driven model, vendors manage services, not proposals
export default function VendorProposalsPage() {
  redirect("/dashboard/vendor/services");
}
