import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Calendar,
  MapPin,
  Users,
  Euro,
  ShoppingBag,
  Store,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  CONFIRMED: { label: "Confirmé", variant: "default" },
  PAID: { label: "Payé", variant: "default" },
  IN_PROGRESS: { label: "En cours", variant: "default" },
  COMPLETED: { label: "Terminé", variant: "outline" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
  REFUNDED: { label: "Remboursé", variant: "destructive" },
};

export default async function ClientBookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch bookings with items and services
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          service: {
            include: {
              vendor: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group bookings by status
  const activeBookings = bookings.filter(
    (b) => ["PENDING", "CONFIRMED", "PAID", "IN_PROGRESS"].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) => ["COMPLETED", "CANCELLED", "REFUNDED"].includes(b.status)
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes réservations</h1>
          <p className="text-muted-foreground mt-1">
            Suivez l&apos;état de vos réservations et accédez aux détails
          </p>
        </div>
        <Button asChild>
          <Link href="/services">
            <Store className="mr-2 h-4 w-4" />
            Découvrir des services
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
                <p className="text-2xl font-bold">
                  {formatPrice(
                    bookings
                      .filter((b) => ["PAID", "COMPLETED"].includes(b.status))
                      .reduce((sum, b) => sum + b.total, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Réservations en cours
            </CardTitle>
            <CardDescription>
              Vos réservations actives et en attente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Réservation #{booking.id.slice(-6)}</h3>
                      <Badge variant={statusConfig[booking.status]?.variant || "default"}>
                        {statusConfig[booking.status]?.label || booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.eventDate)}
                      </span>
                      {booking.eventCity && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.eventCity}
                        </span>
                      )}
                      {booking.guestCount && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.guestCount} invités
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(booking.total)}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {booking.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.vendorName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusConfig[item.status]?.variant || "default"} className="mb-1">
                          {statusConfig[item.status]?.label || item.status}
                        </Badge>
                        <p className="text-sm font-medium">{formatPrice(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/client/bookings/${booking.id}`}>
                      Voir les détails
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {booking.items[0]?.service?.vendor && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/messages?vendor=${booking.items[0].service.vendor.userId}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contacter le prestataire
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Historique
            </CardTitle>
            <CardDescription>
              Vos réservations passées et annulées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors opacity-80"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Réservation #{booking.id.slice(-6)}</h3>
                      <Badge variant={statusConfig[booking.status]?.variant || "default"}>
                        {statusConfig[booking.status]?.label || booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.eventDate)}
                      </span>
                      <span>
                        {booking.items.length} service(s)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatPrice(booking.total)}</p>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <Link href={`/dashboard/client/bookings/${booking.id}`}>
                        Détails <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune réservation</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Vous n&apos;avez pas encore de réservations. Parcourez nos services pour trouver les prestataires parfaits pour votre événement.
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
