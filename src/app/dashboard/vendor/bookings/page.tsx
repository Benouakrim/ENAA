import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Euro,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import BookingActions from "./BookingActions";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Confirmé", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  PAID: { label: "Payé", color: "bg-green-100 text-green-800", icon: Euro },
  IN_PROGRESS: { label: "En cours", color: "bg-purple-100 text-purple-800", icon: Loader2 },
  COMPLETED: { label: "Terminé", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Annulé", color: "bg-red-100 text-red-800", icon: XCircle },
  REFUNDED: { label: "Remboursé", color: "bg-gray-100 text-gray-800", icon: Euro },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function VendorBookingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get vendor profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: true,
    },
  });

  if (!user || user.role !== "VENDOR" || !user.vendorProfile) {
    redirect("/dashboard");
  }

  // Get all booking items for this vendor's services
  const bookingItems = await prisma.bookingItem.findMany({
    where: {
      service: {
        vendorId: user.vendorProfile.id,
      },
    },
    include: {
      booking: {
        include: {
          user: true,
        },
      },
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate stats
  const pendingCount = bookingItems.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookingItems.filter((b) => b.status === "CONFIRMED" || b.status === "PAID").length;
  const completedCount = bookingItems.filter((b) => b.status === "COMPLETED").length;
  const totalRevenue = bookingItems
    .filter((b) => b.status === "COMPLETED" || b.status === "PAID")
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Réservations</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les réservations de vos clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                <p className="text-sm text-muted-foreground">Confirmées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Revenus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {bookingItems.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucune réservation
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Vous n&apos;avez pas encore reçu de réservations. Publiez vos services pour commencer à recevoir des clients.
            </p>
            <Button asChild>
              <Link href="/dashboard/vendor/services">
                <Package className="h-4 w-4 mr-2" />
                Gérer mes services
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookingItems.map((item) => {
            const statusInfo = statusConfig[item.status];
            const StatusIcon = statusInfo?.icon || Clock;

            return (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {item.serviceName}
                            </h3>
                            <Badge className={statusInfo?.color || "bg-gray-100"}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo?.label || item.status}
                            </Badge>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {item.booking.user.firstName} {item.booking.user.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.booking.eventDate)}</span>
                            </div>
                            {item.booking.eventCity && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{item.booking.eventCity}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4" />
                              <span className="font-semibold text-foreground">
                                {formatPrice(item.total)}
                              </span>
                            </div>
                          </div>

                          {item.booking.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              Note: {item.booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/vendor/bookings/${item.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </Link>
                      <BookingActions
                        bookingItemId={item.id}
                        currentStatus={item.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
