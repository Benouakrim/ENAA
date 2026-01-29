import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import {
  Plus,
  Edit,
  Eye,
  Star,
  MapPin,
  ToggleRight,
  Sparkles,
  TrendingUp,
  Package
} from "lucide-react";
import ServiceActions from "./ServiceActions";

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

// Category names in French
const categoryNames: Record<string, string> = {
  VENUE: "Lieu & Salle",
  CATERER: "Traiteur",
  PHOTOGRAPHER: "Photographe",
  DJ: "DJ & Musique",
  DECORATOR: "Décoration",
  FLORIST: "Fleuriste",
  VIDEOGRAPHER: "Vidéaste",
  MAKEUP: "Maquillage",
  PLANNER: "Wedding Planner",
  PATISSERIE: "Pâtisserie",
  TRANSPORT: "Transport",
  ANIMATOR: "Animation",
};

export default async function VendorServicesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the user and vendor profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true
    }
  });

  if (!user || user.role !== "VENDOR" || !user.vendorProfile) {
    redirect("/dashboard");
  }

  // Get vendor's services
  const services = await prisma.serviceListing.findMany({
    where: { vendorId: user.vendorProfile.id },
    orderBy: { createdAt: 'desc' },
  });

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.active).length;
  const totalReviews = services.reduce((sum, s) => sum + s.reviewCount, 0);
  const totalBookings = services.reduce((sum, s) => sum + s.bookingCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes services</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos offres et créez de nouvelles prestations
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Link href="/dashboard/vendor/services/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau service
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalServices}</p>
                <p className="text-sm text-muted-foreground">Services total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ToggleRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeServices}</p>
                <p className="text-sm text-muted-foreground">Services actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
                <p className="text-sm text-muted-foreground">Avis reçus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalBookings}</p>
                <p className="text-sm text-muted-foreground">Réservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucun service créé
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Créez votre premier service pour commencer à recevoir des réservations de clients.
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/dashboard/vendor/services/new">
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier service
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                    <Image
                      src={service.images[0] || '/placeholder.jpg'}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    {!service.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Inactif</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {categoryNames[service.category] || service.category}
                          </Badge>
                          {service.featured && (
                            <Badge className="bg-amber-500 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Coup de cœur
                            </Badge>
                          )}
                          {service.active ? (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-400 text-gray-500">
                              Inactif
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-xl font-bold text-foreground">
                        {formatPrice(service.price)}
                      </p>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{service.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{service.rating.toFixed(1)} ({service.reviewCount} avis)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{service.bookingCount} réservations</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/services/${service.category.toLowerCase()}/${service.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/vendor/services/${service.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Link>
                      </Button>
                      <ServiceActions serviceId={service.id} isActive={service.active} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
