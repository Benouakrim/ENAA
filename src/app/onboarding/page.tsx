"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { skipOnboarding } from "@/actions/user-actions";
import {
  Users,
  Briefcase,
  Check,
  ArrowRight,
  Sparkles,
  Calendar,
  TrendingUp,
  Award,
  Loader2,
  X,
} from "lucide-react";

type RoleType = "CLIENT" | "VENDOR" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);

    try {
      // Update user role in database
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Redirect based on role - both go to their respective wizards
      if (selectedRole === "CLIENT") {
        router.push("/onboarding/client");
      } else {
        router.push("/onboarding/vendor");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour votre profil. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setIsSkipping(true);
    try {
      await skipOnboarding(user.id);
      toast.success("Onboarding ignoré", {
        description: "Vous pouvez le compléter à tout moment depuis votre tableau de bord.",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      toast.error("Erreur", {
        description: "Impossible de passer l'onboarding. Veuillez réessayer.",
      });
    } finally {
      setIsSkipping(false);
    }
  };

  const roles = [
    {
      id: "CLIENT" as const,
      title: "Je suis Client",
      subtitle: "Je cherche des services pour mon événement",
      icon: Users,
      benefits: [
        { icon: Calendar, text: "Parcourez notre catalogue de services" },
        { icon: Sparkles, text: "Réservez directement en ligne" },
        { icon: TrendingUp, text: "Comparez et choisissez les meilleurs prestataires" },
      ],
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: "VENDOR" as const,
      title: "Je suis Prestataire",
      subtitle: "Je propose mes services événementiels",
      icon: Briefcase,
      benefits: [
        { icon: Award, text: "Créez vos offres et services" },
        { icon: Users, text: "Accédez à des milliers de clients potentiels" },
        { icon: TrendingUp, text: "Recevez des réservations directes" },
      ],
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue{user?.firstName ? `, ${user.firstName}` : ""} ! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pour vous offrir la meilleure expérience, dites-nous qui vous êtes
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                    : "hover:shadow-lg"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardContent className="p-0">
                  {/* Header */}
                  <div
                    className={`p-6 bg-gradient-to-r ${role.bgGradient} rounded-t-lg relative`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${role.gradient} flex items-center justify-center mb-4`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {role.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{role.subtitle}</p>
                  </div>

                  {/* Benefits */}
                  <div className="p-6 space-y-4">
                    {role.benefits.map((benefit, index) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <BenefitIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <span className="text-gray-700">{benefit.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting || isSkipping}
            className="px-8 py-6 text-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isSubmitting || isSkipping}
            className="text-gray-500 hover:text-gray-700"
          >
            {isSkipping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Passer pour le moment
              </>
            )}
          </Button>
        </div>

        {/* Skip hint */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Vous pouvez changer votre rôle plus tard dans les paramètres
        </p>
      </div>
    </div>
  );
}
