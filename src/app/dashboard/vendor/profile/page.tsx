import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Star,
  Edit,
  CheckCircle2,
  Package,
  TrendingUp,
} from "lucide-react";

export default async function VendorProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendorProfile: {
        include: {
          services: true,
        },
      },
    },
  });

  if (!user?.vendorProfile) {
    redirect("/onboarding/vendor");
  }

  const profile = user.vendorProfile;
  const activeServices = profile.services.filter((s) => s.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil Prestataire</h1>
            <p className="text-gray-600 mt-1">Gérez vos informations professionnelles</p>
          </div>
          <Link href="/dashboard/vendor/profile/edit">
            <Button size="lg" className="gap-2">
              <Edit className="h-5 w-5" />
              Modifier le profil
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Réservations</p>
                  <p className="text-3xl font-bold text-green-600">{profile.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Services actifs</p>
                  <p className="text-3xl font-bold text-amber-600">{activeServices}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chiffre d&apos;affaires</p>
                  <p className="text-2xl font-bold text-purple-600">{profile.totalRevenue.toLocaleString()}€</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-blue-600">{profile.rating.toFixed(1)}</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-500">({profile.reviewCount} avis)</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{profile.companyName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {profile.verified && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                    {profile.featured && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                        <Star className="h-3 w-3 mr-1" />
                        Mis en avant
                      </Badge>
                    )}
                  </div>
                </div>
                {profile.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.yearFounded && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Année de création</p>
                      <p className="text-gray-900">{profile.yearFounded}</p>
                    </div>
                  )}
                  {profile.teamSize && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Taille de l&apos;équipe</p>
                      <p className="text-gray-900">{profile.teamSize}</p>
                    </div>
                  )}
                  {profile.travelRadius && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Zone de déplacement</p>
                      <p className="text-gray-900">{profile.travelRadius} km</p>
                    </div>
                  )}
                  {profile.responseTime && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Temps de réponse</p>
                      <p className="text-gray-900">{profile.responseTime}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mes Services ({profile.services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.services.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de services</p>
                    <Link href="/dashboard/vendor/services">
                      <Button>Créer mon premier service</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profile.services.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{service.price}€</p>
                          <Badge variant={service.active ? "default" : "secondary"}>
                            {service.active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {profile.services.length > 5 && (
                      <Link href="/dashboard/vendor/services" className="text-center">
                        <Button variant="outline" className="w-full">
                          Voir tous les services ({profile.services.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm">{profile.city}</p>
                    {profile.region && <p className="text-xs text-gray-500">{profile.region}</p>}
                    {profile.address && <p className="text-xs text-gray-500">{profile.address}</p>}
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${profile.phone}`} className="hover:text-purple-600">
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${profile.email}`} className="hover:text-purple-600 text-sm">
                      {profile.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {(profile.website || profile.instagram || profile.facebook) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-purple-600"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Site web</span>
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-purple-600"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm">@{profile.instagram}</span>
                    </a>
                  )}
                  {profile.facebook && (
                    <a
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-purple-600"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm">Facebook</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
