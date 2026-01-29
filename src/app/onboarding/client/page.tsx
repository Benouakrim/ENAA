import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ClientWizard from "@/components/ClientWizard";
import { Sparkles } from "lucide-react";

export default async function ClientOnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Bienvenue sur ENAA Orchidée
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Personnalisez votre expérience pour trouver les meilleurs prestataires
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ClientWizard />
      </div>
    </div>
  );
}
