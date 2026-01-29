import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VendorWizard from "@/components/VendorWizard";
import { Award } from "lucide-react";

export default async function VendorOnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Rejoignez notre réseau de prestataires
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Développez votre activité avec des clients de qualité
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <VendorWizard />
      </div>
    </div>
  );
}
