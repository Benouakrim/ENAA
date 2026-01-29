"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Edit, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OnboardingStatusProps {
  onboardingCompleted: boolean;
  wizardCompleted: boolean;
  role: string;
  preferences?: {
    preferredEventTypes?: string[];
    preferredBudget?: string | null;
    preferredGuestCount?: string | null;
    preferredStyles?: string[];
    preferredRegion?: string | null;
  };
}

export default function OnboardingStatus({
  onboardingCompleted,
  wizardCompleted,
  role,
  preferences,
}: OnboardingStatusProps) {
  // If onboarding not completed, show alert
  if (!onboardingCompleted) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900">Onboarding non terminé</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Complétez votre onboarding pour profiter pleinement de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={role === "VENDOR" ? "/onboarding/vendor" : "/onboarding/client"}>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Compléter l&apos;onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // If skipped (completed but not filled wizard), show info
  if (onboardingCompleted && !wizardCompleted) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Préférences non renseignées</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            Vous avez sauté l&apos;onboarding. Ajoutez vos préférences pour des recommandations personnalisées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={role === "VENDOR" ? "/onboarding/vendor" : "/onboarding/client"}>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
              <Edit className="mr-2 h-4 w-4" />
              Ajouter mes préférences
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Show completed status with preferences summary
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Profil complété</CardTitle>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-100">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
        <CardDescription className="text-green-700">
          Vos préférences sont enregistrées
        </CardDescription>
      </CardHeader>
      {preferences && (
        <CardContent>
          <div className="space-y-2 text-sm">
            {preferences.preferredEventTypes && preferences.preferredEventTypes.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-green-900">Types d&apos;événements:</span>
                <div className="flex flex-wrap gap-1">
                  {preferences.preferredEventTypes.map((type) => (
                    <Badge key={type} variant="outline" className="bg-white">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {preferences.preferredBudget && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-900">Budget:</span>
                <Badge variant="outline" className="bg-white">
                  {preferences.preferredBudget}
                </Badge>
              </div>
            )}
            {preferences.preferredGuestCount && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-900">Nombre d&apos;invités:</span>
                <Badge variant="outline" className="bg-white">
                  {preferences.preferredGuestCount}
                </Badge>
              </div>
            )}
            {preferences.preferredStyles && preferences.preferredStyles.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-green-900">Styles:</span>
                <div className="flex flex-wrap gap-1">
                  {preferences.preferredStyles.map((style) => (
                    <Badge key={style} variant="outline" className="bg-white">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {preferences.preferredRegion && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-900">Région:</span>
                <Badge variant="outline" className="bg-white">
                  {preferences.preferredRegion}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
