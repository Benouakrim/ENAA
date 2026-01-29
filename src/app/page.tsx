import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import type { Deal, ServiceListing, VendorProfile } from "@prisma/client";
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight,
  Sparkles,
  Building2,
  UtensilsCrossed,
  Camera,
  Music,
  Palette,
  Flower2,
  Video,
  Wand2,
  PartyPopper,
  Cake,
  Car,
  Users,
  BadgePercent,
  Clock,
  Shield,
  Heart,
  Calendar
} from "lucide-react";

// Category configuration
const categories = [
  { id: "VENUE", name: "Lieux & Salles", icon: Building2, color: "bg-blue-500" },
  { id: "CATERER", name: "Traiteurs", icon: UtensilsCrossed, color: "bg-orange-500" },
  { id: "PHOTOGRAPHER", name: "Photographes", icon: Camera, color: "bg-purple-500" },
  { id: "DJ", name: "DJ & Musique", icon: Music, color: "bg-pink-500" },
  { id: "DECORATOR", name: "Décoration", icon: Palette, color: "bg-teal-500" },
  { id: "FLORIST", name: "Fleuristes", icon: Flower2, color: "bg-rose-500" },
  { id: "VIDEOGRAPHER", name: "Vidéastes", icon: Video, color: "bg-indigo-500" },
  { id: "MAKEUP", name: "Maquillage", icon: Wand2, color: "bg-fuchsia-500" },
  { id: "PLANNER", name: "Wedding Planners", icon: Users, color: "bg-amber-500" },
  { id: "PATISSERIE", name: "Pâtisserie", icon: Cake, color: "bg-yellow-500" },
  { id: "TRANSPORT", name: "Transport", icon: Car, color: "bg-slate-500" },
  { id: "ANIMATOR", name: "Animation", icon: PartyPopper, color: "bg-green-500" },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export default async function Home() {
  // Fetch featured services
  const featuredServices = await prisma.serviceListing.findMany({
    where: { featured: true, active: true },
    take: 8,
    orderBy: { rating: 'desc' },
    include: {
      vendor: {
        select: { companyName: true, verified: true }
      }
    }
  });

  // Fetch deals
  const activeDeals = await prisma.deal.findMany({
    where: {
      active: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() }
    },
    take: 3
  });

  // Fetch category counts
  const categoryCounts = await prisma.serviceListing.groupBy({
    by: ['category'],
    where: { active: true },
    _count: true
  });

  const categoryCountMap = new Map(
    categoryCounts.map((c: { category: string; _count: number }) => [c.category, c._count])
  );

  // Fetch top rated services
  const topRatedServices = await prisma.serviceListing.findMany({
    where: { active: true, rating: { gte: 4.5 } },
    take: 6,
    orderBy: { rating: 'desc' },
    include: {
      vendor: {
        select: { companyName: true, verified: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Plus de 240 prestataires vérifiés
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Réservez les meilleurs{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                prestataires
              </span>{" "}
              pour votre événement
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Comparez, choisissez et réservez en quelques clics. Paiement sécurisé et avis vérifiés.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form action="/services" method="get" className="bg-white rounded-2xl shadow-xl border border-border p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search-query" className="text-xs font-medium text-muted-foreground mb-1 block">Quoi ?</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-query"
                    name="q"
                    placeholder="DJ, photographe, salle..." 
                    className="pl-9 border-0 shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
              </div>
              <div className="w-px bg-border hidden sm:block" />
              <div className="flex-1">
                <label htmlFor="search-city" className="text-xs font-medium text-muted-foreground mb-1 block">Où ?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-city"
                    name="city"
                    placeholder="Paris, Lyon, Marseille..." 
                    className="pl-9 border-0 shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
              </div>
              <div className="w-px bg-border hidden sm:block" />
              <div className="sm:w-48">
                <label htmlFor="search-date" className="text-xs font-medium text-muted-foreground mb-1 block">Quand ?</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-date"
                    name="date"
                    type="date"
                    className="pl-9 border-0 shadow-none focus-visible:ring-0 text-base"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground">Populaires:</span>
              {["Mariage", "Anniversaire", "Événement corporate", "Baptême"].map((term) => (
                <Link 
                  key={term}
                  href={`/services?eventType=${encodeURIComponent(term)}`}
                  className="text-sm text-primary hover:underline"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Parcourir par catégorie
              </h2>
              <p className="text-muted-foreground">
                Trouvez le prestataire idéal pour chaque aspect de votre événement
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/services">
                Voir tout <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = categoryCountMap.get(category.id as never) || 0;
              return (
                <Link 
                  key={category.id}
                  href={`/services/${category.id.toLowerCase()}`}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 border-border">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium text-foreground text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{count} offres</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Deals */}
      {activeDeals.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <Badge variant="destructive" className="mb-2">
                  <BadgePercent className="h-3 w-3 mr-1" />
                  Offres limitées
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Promotions en cours
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDeals.map((deal: Deal) => (
                <Card key={deal.id} className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{deal.name}</h3>
                        <p className="text-sm text-muted-foreground">{deal.description}</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">
                        {deal.discountType === 'percentage' 
                          ? `-${deal.discountValue}%` 
                          : `-${formatPrice(deal.discountValue)}`}
                      </Badge>
                    </div>
                    {deal.code && (
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border">
                        <code className="flex-1 font-mono font-bold text-primary">{deal.code}</code>
                        <Button size="sm" variant="ghost">Copier</Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Valable jusqu&apos;au {new Date(deal.validUntil).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Services */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                <Sparkles className="inline h-6 w-6 text-amber-500 mr-2" />
                Nos coups de cœur
              </h2>
              <p className="text-muted-foreground">
                Sélection de prestataires d&apos;exception recommandés par nos équipes
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/services?featured=true">
                Voir tout <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service: ServiceListing & { vendor: Pick<VendorProfile, 'companyName' | 'verified'> }) => (
              <Link key={service.id} href={`/services/${service.category.toLowerCase()}/${service.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={service.images[0] || '/placeholder.jpg'}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-amber-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Coup de cœur
                      </Badge>
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.id === service.category)?.name}
                      </Badge>
                      {service.vendor.verified && (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({service.reviewCount})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">À partir de</span>
                        <p className="font-bold text-primary">{formatPrice(service.price)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                <Star className="inline h-6 w-6 text-amber-500 mr-2 fill-amber-500" />
                Les mieux notés
              </h2>
              <p className="text-muted-foreground">
                Prestataires avec les meilleures évaluations de nos clients
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/services?sort=rating">
                Voir tout <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedServices.map((service: ServiceListing & { vendor: Pick<VendorProfile, 'companyName' | 'verified'> }) => (
              <Link key={service.id} href={`/services/${service.category.toLowerCase()}/${service.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all flex flex-row h-full">
                  <div className="relative w-32 sm:w-40 flex-shrink-0">
                    <Image
                      src={service.images[0] || '/placeholder.jpg'}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          {service.rating.toFixed(1)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {service.reviewCount} avis
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                        {service.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {service.city}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatPrice(service.price)}</span>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Voir <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Réservez vos prestataires en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Explorez</h3>
              <p className="text-muted-foreground">
                Parcourez notre catalogue de prestataires vérifiés. Filtrez par catégorie, lieu, date et budget.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Composez</h3>
              <p className="text-muted-foreground">
                Ajoutez vos services préférés au panier. Comparez les offres et créez votre événement sur mesure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Réservez</h3>
              <p className="text-muted-foreground">
                Confirmez votre réservation et payez en toute sécurité. Échangez directement avec vos prestataires.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/services">
                Commencer à explorer
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 overflow-hidden">
            <CardContent className="p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Vous êtes prestataire événementiel ?
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  Rejoignez notre plateforme et développez votre activité. Créez vos offres, gérez vos réservations et touchez de nouveaux clients.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/onboarding/vendor">
                      Devenir prestataire
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="text-white border-white/30 hover:bg-white/10">
                    <Link href="/about/vendors">En savoir plus</Link>
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-white">0%</p>
                  <p className="text-sm text-white/80">Commission<br/>le 1er mois</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-white">10k+</p>
                  <p className="text-sm text-white/80">Clients<br/>potentiels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">ENAA Orchidée</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                La marketplace des prestataires événementiels. Réservez en toute confiance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Catégories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services/venue" className="hover:text-foreground">Lieux & Salles</Link></li>
                <li><Link href="/services/caterer" className="hover:text-foreground">Traiteurs</Link></li>
                <li><Link href="/services/photographer" className="hover:text-foreground">Photographes</Link></li>
                <li><Link href="/services/dj" className="hover:text-foreground">DJ & Musique</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">À propos</Link></li>
                <li><Link href="/onboarding/vendor" className="hover:text-foreground">Devenir prestataire</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Centre d&apos;aide</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/terms" className="hover:text-foreground">CGU</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-foreground">Confidentialité</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ENAA Orchidée. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
