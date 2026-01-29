import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { 
  Star, 
  MapPin, 
  Calendar,
  ChevronRight,
  Heart,
  Share2,
  Shield,
  Check,
  Sparkles,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { ContactVendorButton } from "./ContactVendorButton";
import { FavoriteButton } from "./FavoriteButton";

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const { userId } = await auth();

  const service = await prisma.serviceListing.findUnique({
    where: { id },
    include: {
      vendor: {
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, avatarUrl: true }
          }
        }
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true }
          }
        }
      },
      availability: {
        where: {
          date: { gte: new Date() },
          available: true
        },
        take: 30,
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!service || service.category.toLowerCase() !== category.toLowerCase()) {
    notFound();
  }

  // Get similar services
  const similarServices = await prisma.serviceListing.findMany({
    where: {
      category: service.category,
      active: true,
      id: { not: service.id }
    },
    take: 4,
    orderBy: { rating: 'desc' },
    include: {
      vendor: {
        select: { companyName: true, verified: true }
      }
    }
  });

  const metadata = service.metadata as Record<string, unknown> | null;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/services" className="hover:text-foreground">Services</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/services?category=${category}`} className="hover:text-foreground capitalize">{category}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{service.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/services?category=${category}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux résultats
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden">
              <div className="col-span-4 md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto">
                <Image
                  src={service.images[0] || '/placeholder.jpg'}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              {service.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square hidden md:block">
                  <Image
                    src={img}
                    alt={`${service.title} ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Title & Quick Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {service.featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Coup de cœur
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">{category}</Badge>
                {service.vendor.verified && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{service.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{service.rating.toFixed(1)}</span>
                  <span>({service.reviewCount} avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{service.city}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {metadata && Object.keys(metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(metadata).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability Calendar Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Disponibilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                {service.availability.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {service.availability.slice(0, 14).map((slot) => (
                      <Badge
                        key={slot.id}
                        variant="outline"
                        className="bg-green-50 border-green-200 text-green-700"
                      >
                        {new Date(slot.date).toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </Badge>
                    ))}
                    {service.availability.length > 14 && (
                      <Badge variant="secondary">
                        +{service.availability.length - 14} autres dates
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Contactez le prestataire pour connaître ses disponibilités.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avis clients
                </CardTitle>
                {service.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{service.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 5</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {service.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {service.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                            {review.user.avatarUrl ? (
                              <Image
                                src={review.user.avatarUrl}
                                alt={`${review.user.firstName} ${review.user.lastName}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-foreground">
                                {review.user.firstName} {review.user.lastName?.[0]}.
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun avis pour le moment. Soyez le premier à donner votre avis !
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle>À propos du prestataire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {service.vendor.user.avatarUrl ? (
                      <Image
                        src={service.vendor.user.avatarUrl}
                        alt={service.vendor.companyName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                        {service.vendor.companyName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        {service.vendor.companyName}
                      </h3>
                      {service.vendor.verified && (
                        <Shield className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    {service.vendor.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {service.vendor.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {service.vendor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{service.vendor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">À partir de</span>
                      <p className="text-3xl font-bold text-foreground">{formatPrice(service.price)}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{service.priceType}</Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <AddToCartButton serviceId={service.id} userId={userId} />
                    
                    <ContactVendorButton
                      vendorUserId={service.vendor.userId}
                      serviceId={service.id}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <FavoriteButton
                      serviceId={service.id}
                      userId={userId}
                    />
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="border-t border-border mt-6 pt-6">
                    <h4 className="font-medium text-foreground mb-3">Ce qui est inclus :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Réservation confirmée sous 24h
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Paiement sécurisé
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Annulation gratuite 48h avant
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Support client dédié
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{service.rating.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Note moyenne</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{service.reviewCount}</p>
                      <p className="text-xs text-muted-foreground">Avis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Similar Services */}
        {similarServices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Services similaires
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarServices.map((similar) => (
                <Link key={similar.id} href={`/services/${similar.category.toLowerCase()}/${similar.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={similar.images[0] || '/placeholder.jpg'}
                        alt={similar.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                        {similar.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-sm">{similar.rating.toFixed(1)}</span>
                        </div>
                        <p className="font-bold text-primary text-sm">{formatPrice(similar.price)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
