import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  CheckCircle2,
  Calendar,
  ArrowRight,
  Mail,
  FileText,
  MessageCircle
} from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { userId } = await auth();
  const { bookingId } = await searchParams;

  if (!userId) {
    redirect("/sign-in");
  }

  if (!bookingId) {
    redirect("/dashboard");
  }

  // Get booking details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/onboarding");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, userId: user.id },
    include: {
      items: true
    }
  });

  if (!booking) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Réservation confirmée !
          </h1>
          <p className="text-muted-foreground">
            Merci pour votre commande. Votre réservation a été enregistrée avec succès.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de réservation</p>
                <p className="font-mono font-bold text-foreground">{booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-xl font-bold text-foreground">{formatPrice(booking.total)}</p>
              </div>
            </div>

            {booking.eventDate && (
              <div className="flex items-center gap-3 mb-4 p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de l&apos;événement</p>
                  <p className="font-semibold text-foreground">
                    {new Date(booking.eventDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Services réservés</h3>
              {booking.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Prochaines étapes</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email de confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    Un email récapitulatif a été envoyé à {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Contact des prestataires</p>
                  <p className="text-sm text-muted-foreground">
                    Les prestataires ont été notifiés et vous contacteront sous 24h
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Suivi de commande</p>
                  <p className="text-sm text-muted-foreground">
                    Retrouvez tous les détails dans votre espace personnel
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Voir mes réservations
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Link href="/services">
              Continuer à explorer
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
