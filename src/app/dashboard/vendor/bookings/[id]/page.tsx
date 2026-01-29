import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Euro,
  Mail,
  Phone,
  Package,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import BookingActions from "../BookingActions";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Confirmé", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  PAID: { label: "Payé", color: "bg-green-100 text-green-800", icon: Euro },
  IN_PROGRESS: { label: "En cours", color: "bg-purple-100 text-purple-800", icon: Clock },
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  // Get the booking item
  const bookingItem = await prisma.bookingItem.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          user: true,
        },
      },
      service: true,
    },
  });

  if (!bookingItem || !bookingItem.service) {
    notFound();
  }

  // Verify ownership
  if (bookingItem.service.vendorId !== user.vendorProfile.id) {
    redirect("/dashboard/vendor/bookings");
  }

  const statusInfo = statusConfig[bookingItem.status];
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/vendor/bookings">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux réservations
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Détails de la réservation</h1>
            <p className="text-muted-foreground mt-1">
              Réservation #{bookingItem.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <Badge className={`${statusInfo?.color} text-sm px-4 py-2`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusInfo?.label}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service réservé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {bookingItem.serviceName}
                  </h3>
                  <p className="text-muted-foreground">{bookingItem.category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Quantité: {bookingItem.quantity}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Prix unitaire: {formatPrice(bookingItem.unitPrice)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(bookingItem.total)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de l&apos;événement</p>
                    <p className="font-medium">{formatDate(bookingItem.booking.eventDate)}</p>
                  </div>
                </div>

                {bookingItem.booking.eventType && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type d&apos;événement</p>
                      <p className="font-medium">{bookingItem.booking.eventType}</p>
                    </div>
                  </div>
                )}

                {bookingItem.booking.eventCity && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lieu</p>
                      <p className="font-medium">{bookingItem.booking.eventCity}</p>
                    </div>
                  </div>
                )}

                {bookingItem.booking.guestCount && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre d&apos;invités</p>
                      <p className="font-medium">{bookingItem.booking.guestCount} personnes</p>
                    </div>
                  </div>
                )}
              </div>

              {bookingItem.booking.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Notes du client</p>
                  <p className="text-foreground bg-muted p-3 rounded-lg">
                    {bookingItem.booking.notes}
                  </p>
                </div>
              )}

              {bookingItem.vendorNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Vos notes</p>
                  <p className="text-foreground bg-muted p-3 rounded-lg">
                    {bookingItem.vendorNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <BookingActions
                bookingItemId={bookingItem.id}
                currentStatus={bookingItem.status}
              />
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contacter le client
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Client Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {bookingItem.booking.user.firstName} {bookingItem.booking.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">Client</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {bookingItem.booking.contactEmail || bookingItem.booking.user.email ? (
                  <a
                    href={`mailto:${bookingItem.booking.contactEmail || bookingItem.booking.user.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{bookingItem.booking.contactEmail || bookingItem.booking.user.email}</span>
                  </a>
                ) : null}

                {bookingItem.booking.contactPhone || bookingItem.booking.user.phone ? (
                  <a
                    href={`tel:${bookingItem.booking.contactPhone || bookingItem.booking.user.phone}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{bookingItem.booking.contactPhone || bookingItem.booking.user.phone}</span>
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix unitaire</span>
                <span>{formatPrice(bookingItem.unitPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantité</span>
                <span>x{bookingItem.quantity}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(bookingItem.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Réservation créée</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(bookingItem.createdAt)}
                    </p>
                  </div>
                </div>
                {bookingItem.status !== "PENDING" && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Statut mis à jour</p>
                      <p className="text-xs text-muted-foreground">
                        {statusInfo?.label}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
