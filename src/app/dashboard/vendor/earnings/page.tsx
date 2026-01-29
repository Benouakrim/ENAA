import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Euro,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
} from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function VendorEarningsPage() {
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

  // Get all booking items for this vendor
  const bookingItems = await prisma.bookingItem.findMany({
    where: {
      service: {
        vendorId: user.vendorProfile.id,
      },
    },
    include: {
      booking: {
        include: {
          transactions: true,
          user: true,
        },
      },
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate earnings
  const completedItems = bookingItems.filter(
    (item) => item.status === "COMPLETED" || item.status === "PAID"
  );
  const totalEarnings = completedItems.reduce((sum, item) => sum + item.total, 0);
  const pendingEarnings = bookingItems
    .filter((item) => item.status === "CONFIRMED" || item.status === "IN_PROGRESS")
    .reduce((sum, item) => sum + item.total, 0);

  // Monthly breakdown
  const now = new Date();
  const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("fr-FR", { month: "long" });
    
    const monthItems = completedItems.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
    });
    
    return {
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year: date.getFullYear(),
      earnings: monthItems.reduce((sum, item) => sum + item.total, 0),
      count: monthItems.length,
    };
  }).reverse();

  // Current month vs last month
  const currentMonth = monthlyEarnings[monthlyEarnings.length - 1];
  const lastMonth = monthlyEarnings[monthlyEarnings.length - 2];
  const percentChange = lastMonth.earnings > 0 
    ? ((currentMonth.earnings - lastMonth.earnings) / lastMonth.earnings) * 100 
    : currentMonth.earnings > 0 ? 100 : 0;

  // Get recent transactions/completed bookings
  const recentCompletedItems = completedItems.slice(0, 10);

  // Platform fee (e.g., 10%)
  const platformFeeRate = 0.1;
  const platformFees = totalEarnings * platformFeeRate;
  const netEarnings = totalEarnings - platformFees;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revenus</h1>
        <p className="text-muted-foreground mt-1">
          Suivez vos gains et l&apos;historique de vos transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Revenus nets</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {formatPrice(netEarnings)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  après commission plateforme
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois-ci</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatPrice(currentMonth.earnings)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {percentChange >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(percentChange).toFixed(0)}% vs mois dernier
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatPrice(pendingEarnings)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bookingItems.filter(i => i.status === "CONFIRMED" || i.status === "IN_PROGRESS").length} réservations
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commissions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatPrice(platformFees)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(platformFeeRate * 100).toFixed(0)}% du total
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>Vos revenus des 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyEarnings.map((month, index) => {
              const maxEarning = Math.max(...monthlyEarnings.map(m => m.earnings));
              const percentage = maxEarning > 0 ? (month.earnings / maxEarning) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-muted-foreground">
                    {month.month}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right font-medium">
                    {formatPrice(month.earnings)}
                  </div>
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {month.count} {month.count === 1 ? 'vente' : 'ventes'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
          <CardDescription>Historique de vos dernières ventes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCompletedItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Euro className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCompletedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.serviceName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.booking.user.firstName} {item.booking.user.lastName}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatPrice(item.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      Net: {formatPrice(item.total * (1 - platformFeeRate))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Info */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Informations de paiement</h3>
              <p className="text-sm text-blue-700 mt-1">
                Les revenus sont transférés sur votre compte bancaire sous 7 jours ouvrés après la complétion de chaque prestation.
                La commission de la plateforme ({(platformFeeRate * 100).toFixed(0)}%) est automatiquement déduite.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
