import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { CartItemActions } from "./CartItemActions";
import {
  ShoppingCart,
  ArrowRight,
  MapPin,
  Star,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Shield,
  Lock,
  CreditCard,
  Info
} from "lucide-react";

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

export default async function CartPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/cart");
  }

  // Get the user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/onboarding");
  }

  // Get cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          service: {
            include: {
              vendor: {
                select: { companyName: true, verified: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  // Filter out items with null services and type the result properly
  type CartItemWithService = NonNullable<typeof cart>['items'][number] & { service: NonNullable<NonNullable<typeof cart>['items'][number]['service']> };
  const items = (cart?.items.filter((item): item is CartItemWithService => item.service !== null) || []);
  const subtotal = items.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const platformFee = subtotal * 0.05; // 5% platform fee
  const total = subtotal + platformFee;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Panier</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              Mon panier
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} service{items.length > 1 ? 's' : ''} sélectionné{items.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuer mes achats
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Votre panier est vide
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Parcourez notre catalogue de prestataires et ajoutez des services pour composer votre événement idéal.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/services">
                  Découvrir les services
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const service = item.service;
                return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                        <Image
                          src={service.images[0] || '/placeholder.jpg'}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {categoryNames[service.category] || service.category}
                              </Badge>
                              <h3 className="font-semibold text-lg text-foreground">
                                <Link 
                                  href={`/services/${service.category.toLowerCase()}/${service.id}`}
                                  className="hover:text-purple-600 transition-colors"
                                >
                                  {service.title}
                                </Link>
                              </h3>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                              {formatPrice(service.price * item.quantity)}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <span>{service.vendor.companyName}</span>
                              {service.vendor.verified && (
                                <Shield className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{service.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{service.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          {item.selectedDate && (
                            <p className="text-sm text-muted-foreground">
                              Date prévue : {new Date(item.selectedDate).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground">
                            Prix unitaire : {formatPrice(service.price)}
                          </div>
                          <CartItemActions itemId={item.id} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Récapitulatif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sous-total ({items.length} service{items.length > 1 ? 's' : ''})</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>Frais de service</span>
                          <Info className="h-3 w-3" />
                        </div>
                        <span className="font-medium">{formatPrice(platformFee)}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      <Link href="/checkout">
                        Passer la commande
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Link>
                    </Button>

                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Paiement 100% sécurisé</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>CB, Visa, Mastercard acceptées</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Annulation gratuite 48h avant</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-2">Besoin d&apos;aide ?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Notre équipe est disponible pour vous accompagner dans votre réservation.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Contacter le support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
