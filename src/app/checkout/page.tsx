import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "./CheckoutForm";
import {
  ChevronRight,
  ArrowLeft,
  Shield,
  Lock,
  CreditCard,
  Check,
  Calendar
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

export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/checkout");
  }

  // Get the user from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/onboarding");
  }
  
  // Dev-only mock data
  const isDev = process.env.NODE_ENV === 'development';
  // Use static date 90 days from build time in dev
  const mockEventDate = isDev ? '2026-04-28' : '';
  const mockEventType = isDev ? "Mariage" : '';
  const mockEventAddress = isDev ? "25 Rue de la Paix, 75002 Paris, France" : '';
  const mockNotes = isDev ? "Nous aimerions une décoration florale avec des roses blanches et des orchidées. La cérémonie commencera à 15h, suivie d'un cocktail à 17h." : '';
  const mockPhone = isDev ? "+33 6 12 34 56 78" : '';

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

  if (items.length === 0) {
    redirect("/cart");
  }

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
          <Link href="/cart" className="hover:text-foreground">Panier</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Paiement</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="h-8 w-8" />
              Finaliser la commande
            </h1>
            <p className="text-muted-foreground mt-1">
              Confirmez vos informations et procédez au paiement
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au panier
            </Link>
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">Panier</span>
            </div>
            <div className="w-12 h-0.5 bg-green-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-foreground">Paiement</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-muted-foreground">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Détails de l&apos;événement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Date de l&apos;événement *</Label>
                    <Input type="date" id="eventDate" name="eventDate" defaultValue={mockEventDate} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Type d&apos;événement</Label>
                    <Input id="eventType" name="eventType" defaultValue={mockEventType} placeholder="Mariage, anniversaire..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventAddress">Adresse de l&apos;événement</Label>
                  <Input id="eventAddress" name="eventAddress" defaultValue={mockEventAddress} placeholder="Adresse complète" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes complémentaires</Label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Informations supplémentaires pour les prestataires..."
                    defaultValue={mockNotes}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Vos coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      defaultValue={user.firstName || ''} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      defaultValue={user.lastName || ''} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    name="email" 
                    defaultValue={user.email} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="06 12 34 56 78" 
                    defaultValue={mockPhone}
                    required 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Vous serez redirigé vers notre plateforme de paiement sécurisée Stripe après validation.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-white rounded px-3 py-1 border">
                      <span className="text-sm font-medium">VISA</span>
                    </div>
                    <div className="bg-white rounded px-3 py-1 border">
                      <span className="text-sm font-medium">Mastercard</span>
                    </div>
                    <div className="bg-white rounded px-3 py-1 border">
                      <span className="text-sm font-medium">CB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CheckoutForm cartId={cart?.id || ''} total={total} />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Votre commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items List */}
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {items.map((item) => {
                      const service = item.service;
                      return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={service.images[0] || '/placeholder.jpg'}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {service.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {categoryNames[service.category]}
                          </p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {formatPrice(service.price)}
                          </p>
                        </div>
                      </div>
                    )})}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frais de service (5%)</span>
                      <span className="font-medium">{formatPrice(platformFee)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Prestataires vérifiés</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span>Annulation gratuite 48h avant</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
