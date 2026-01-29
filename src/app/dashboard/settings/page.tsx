import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Shield,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import SettingsClient from "./SettingsClient";

function formatDate(date: Date | null) {
  if (!date) return "Non renseigné";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const isVendor = user.role === "VENDOR";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatarUrl || ""} />
                <AvatarFallback className="text-2xl">
                  {(user.firstName?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-2" variant={isVendor ? "default" : "secondary"}>
                {isVendor ? "Prestataire" : "Client"}
              </Badge>
              
              {isVendor && user.vendorProfile && (
                <div className="mt-4 pt-4 border-t w-full">
                  <p className="text-sm font-medium text-foreground">
                    {user.vendorProfile.companyName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.vendorProfile.city}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Vos informations de base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="font-medium">{user.firstName || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{user.lastName || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{user.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pays</p>
                  <p className="font-medium">{user.country || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ville</p>
                  <p className="font-medium">{user.city || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">{formatDate(user.birthday)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Pour modifier vos informations personnelles, accédez à votre compte Clerk.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Mot de passe</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification inconnue
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <Badge variant="outline">Désactivé</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <SettingsClient />

          {/* Vendor Settings */}
          {isVendor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Paramètres prestataire
                </CardTitle>
                <CardDescription>
                  Gérez vos informations professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href="/dashboard/vendor/profile/edit"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">Profil entreprise</p>
                    <p className="text-sm text-muted-foreground">
                      Modifiez vos informations professionnelles
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link
                  href="/dashboard/vendor/services"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">Mes services</p>
                    <p className="text-sm text-muted-foreground">
                      Gérez vos offres de services
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link
                  href="/dashboard/vendor/earnings"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">Paiements & Revenus</p>
                    <p className="text-sm text-muted-foreground">
                      Consultez vos revenus et transactions
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                <div>
                  <p className="font-medium text-red-900">Supprimer mon compte</p>
                  <p className="text-sm text-red-700">
                    Cette action est irréversible et supprimera toutes vos données
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
