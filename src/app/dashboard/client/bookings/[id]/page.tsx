import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Euro,
  Phone,
  Mail,
  ArrowLeft,
  MessageSquare,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente de confirmation", color: "bg-amber-500", icon: Clock },
  CONFIRMED: { label: "Confirmé par le prestataire", color: "bg-blue-500", icon: CheckCircle2 },
  PAID: { label: "Payé", color: "bg-green-500", icon: CreditCard },
  IN_PROGRESS: { label: "Service en cours", color: "bg-purple-500", icon: Store },
  COMPLETED: { label: "Terminé", color: "bg-green-600", icon: CheckCircle2 },
  CANCELLED: { label: "Annulé", color: "bg-red-500", icon: XCircle },
  REFUNDED: { label: "Remboursé", color: "bg-gray-500", icon: Euro },
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Fetch booking with all details
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          service: {
            include: {
              vendor: true,
            },
          },
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Verify ownership
  if (booking.userId !== userId) {
    redirect("/dashboard/client/bookings");
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
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

  const StatusIcon = statusConfig[booking.status]?.icon || Clock;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/client/bookings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux réservations
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Réservation #{booking.id.slice(-6)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Créée le {formatDate(booking.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusConfig[booking.status]?.color || "bg-gray-500"}`} />
          <span className="font-medium">
            {statusConfig[booking.status]?.label || booking.status}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Détails de l&apos;événement
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(booking.eventDate)}</p>
              </div>
            </div>
            {booking.eventCity && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Lieu</p>
                  <p className="font-medium">{booking.eventCity}</p>
                </div>
              </div>
            )}
            {booking.eventType && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{booking.eventType}</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {booking.guestCount && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre d&apos;invités</p>
                  <p className="font-medium">{booking.guestCount} personnes</p>
                </div>
              </div>
            )}
            {booking.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{booking.contactPhone}</p>
                </div>
              </div>
            )}
            {booking.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.contactEmail}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Services réservés
          </CardTitle>
          <CardDescription>
            {booking.items.length} service(s) dans cette réservation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {booking.items.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.serviceName}</h4>
                    <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                    <Badge variant="outline" className="mt-2">
                      {item.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      item.status === "COMPLETED" ? "default" :
                      item.status === "CANCELLED" ? "destructive" : "secondary"
                    }
                    className="mb-2"
                  >
                    {statusConfig[item.status]?.label || item.status}
                  </Badge>
                  <p className="text-lg font-bold">{formatPrice(item.total)}</p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </p>
                  )}
                </div>
              </div>

              {item.vendorNotes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Note du prestataire</p>
                  <p className="text-sm text-muted-foreground">{item.vendorNotes}</p>
                </div>
              )}

              {item.service?.vendor && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/services/${item.category.toLowerCase()}/${item.serviceId}`}>
                      Voir le service
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/messages?vendor=${item.service.vendor.userId}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contacter
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Récapitulatif du paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(booking.subtotal)}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(booking.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de service</span>
              <span>{formatPrice(booking.serviceFee)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(booking.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{booking.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contacter les prestataires
          </Link>
        </Button>
        {booking.status === "PENDING" && (
          <Button variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Annuler la réservation
          </Button>
        )}
      </div>
    </div>
  );
}
