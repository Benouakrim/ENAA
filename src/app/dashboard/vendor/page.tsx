import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Euro,
  Star,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

export default async function VendorDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user and vendor profile with services
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: {
        include: {
          services: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  // If user doesn't have a vendor profile, redirect to onboarding
  if (!user?.vendorProfile) {
    redirect("/onboarding/vendor");
  }

  const { vendorProfile } = user;

  // Get all services count
  const totalServicesCount = await prisma.serviceListing.count({
    where: { vendorId: vendorProfile.id }
  });

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour, {vendorProfile.companyName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vendor/services">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServicesCount}</div>
            <p className="text-xs text-muted-foreground">
              services publiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorProfile.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {vendorProfile.reviewCount} avis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(vendorProfile.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              sur la plateforme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Votre note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {vendorProfile.rating.toFixed(1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(vendorProfile.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Basé sur {vendorProfile.reviewCount} avis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut du profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vérification</span>
              {vendorProfile.verified ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  En attente
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mise en avant</span>
              {vendorProfile.featured ? (
                <Badge className="bg-purple-100 text-purple-700">
                  Mis en avant
                </Badge>
              ) : (
                <Badge variant="outline">Standard</Badge>
              )}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/vendor/profile">
                Modifier mon profil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mes services</CardTitle>
            <CardDescription>Vos services les plus récents</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/vendor/services">
              Voir tout <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vendorProfile.services.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">
                Aucun service publié
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Créez votre premier service pour commencer à recevoir des réservations
              </p>
              <Button asChild>
                <Link href="/dashboard/vendor/services">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un service
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorProfile.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{service.title}</h3>
                      {service.active ? (
                        <Badge variant="secondary" className="text-xs">Actif</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactif</Badge>
                      )}
                      {service.featured && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          Mis en avant
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.category} • {formatPrice(service.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {service.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
