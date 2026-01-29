import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Star,
  Euro,
  Store,
  ShoppingCart,
  MessageSquare,
  Trash2,
  ExternalLink,
} from "lucide-react";
import FavoriteActions from "./FavoriteActions";

const categoryLabels: Record<string, string> = {
  VENUE: "Lieu/Salle",
  CATERER: "Traiteur",
  PHOTOGRAPHER: "Photographe",
  DJ: "DJ/Musique",
  DECORATOR: "Décoration",
  FLORIST: "Fleuriste",
  VIDEOGRAPHER: "Vidéaste",
  MAKEUP: "Maquillage/Coiffure",
  PLANNER: "Wedding Planner",
  PATISSERIE: "Pâtisserie",
  TRANSPORT: "Transport",
  ANIMATOR: "Animation",
};

const priceRangeLabels: Record<string, string> = {
  BUDGET: "Économique",
  STANDARD: "Standard",
  PREMIUM: "Premium",
  LUXE: "Luxe",
};

export default async function ClientFavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch favorites with services and vendors
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      service: {
        include: {
          vendor: true,
          reviews: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Mes favoris
          </h1>
          <p className="text-muted-foreground mt-1">
            Retrouvez les services que vous avez sauvegardés
          </p>
        </div>
        <Button asChild>
          <Link href="/services">
            <Store className="mr-2 h-4 w-4" />
            Découvrir plus de services
          </Link>
        </Button>
      </div>

      {/* Favorites Count */}
      {favorites.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {favorites.length} service(s) dans vos favoris
        </p>
      )}

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const service = favorite.service;
            if (!service) return null;

            return (
              <Card key={favorite.id} className="group overflow-hidden hover:shadow-lg transition-all">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  {service.images && service.images[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-primary/20" />
                    </div>
                  )}
                  
                  {/* Remove Favorite Button */}
                  <div className="absolute top-3 right-3">
                    <FavoriteActions
                      serviceId={service.id}
                      isFavorited={true}
                    />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 text-foreground hover:bg-white">
                      {categoryLabels[service.category] || service.category}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Vendor */}
                  <p className="text-sm text-muted-foreground mb-1">
                    {service.vendor.companyName}
                  </p>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{service.city}, {service.region}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{service.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({service.reviewCount} avis)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{formatPrice(service.price)}</span>
                      {service.priceMax && (
                        <span className="text-muted-foreground">
                          - {formatPrice(service.priceMax)}
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">
                      {priceRangeLabels[service.priceRange] || service.priceRange}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/services/${service.category.toLowerCase()}/${service.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/messages?vendor=${service.vendor.userId}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/cart?add=${service.id}`}>
                        <ShoppingCart className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-red-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun favori</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Vous n&apos;avez pas encore ajouté de services à vos favoris. Parcourez notre catalogue pour découvrir des prestataires.
            </p>
            <Button asChild size="lg">
              <Link href="/services">
                <Store className="mr-2 h-5 w-5" />
                Découvrir les services
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
