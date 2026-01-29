"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ServiceListing, VendorProfile } from "@prisma/client";
import { 
  Search, 
  MapPin, 
  Star, 
  Sparkles,
  Building2,
  UtensilsCrossed,
  Camera,
  Music,
  Palette,
  Flower2,
  Video,
  Wand2,
  Cake,
  Car,
  Users,
  PartyPopper,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  Heart,
  Shield,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";

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

const priceRanges = [
  { id: "BUDGET", label: "Économique", range: "< 500€" },
  { id: "STANDARD", label: "Standard", range: "500€ - 1500€" },
  { id: "PREMIUM", label: "Premium", range: "1500€ - 4000€" },
  { id: "LUXE", label: "Luxe", range: "> 4000€" },
];

const sortOptions = [
  { value: "popular", label: "Popularité" },
  { value: "rating", label: "Mieux notés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "newest", label: "Plus récents" },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

interface ServicesPageClientProps {
  services: (ServiceListing & { vendor: Pick<VendorProfile, 'companyName' | 'verified'> })[];
  total: number;
  page: number;
  totalPages: number;
  currentCategory?: string;
}

export default function ServicesPageClient({ services: initialServices, total: initialTotal, page: initialPage, totalPages: initialTotalPages, currentCategory }: ServicesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [cityQuery, setCityQuery] = useState(searchParams.get('city') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get('priceRange') || '');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory.toLowerCase());
    if (searchQuery) params.set('q', searchQuery);
    if (cityQuery) params.set('city', cityQuery);
    if (selectedPriceRange) params.set('priceRange', selectedPriceRange.toLowerCase());
    if (featuredOnly) params.set('featured', 'true');
    if (sortBy !== 'popular') params.set('sort', sortBy);
    
    router.push(`/services?${params.toString()}`);
  };

  const currentCategoryInfo = categories.find(c => c.id === currentCategory?.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-background pt-8 pb-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">Accueil</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-foreground">Services</span>
            {currentCategoryInfo && (
              <>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-foreground">{currentCategoryInfo.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentCategoryInfo ? currentCategoryInfo.name : featuredOnly ? 'Coups de cœur' : 'Tous les services'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {initialTotal} prestataire{initialTotal > 1 ? 's' : ''} disponible{initialTotal > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Rechercher
                </h3>
                <div className="relative">
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mot-clé..."
                    className="pr-10"
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                  <Button onClick={applyFilters} size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Catégories
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/services"
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      !currentCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    Toutes les catégories
                  </Link>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = currentCategory?.toUpperCase() === category.id;
                    return (
                      <Link
                        key={category.id}
                        href={`/services?category=${category.id.toLowerCase()}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* City */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ville
                </h3>
                <Input 
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Paris, Lyon..."
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Gamme de prix
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox 
                        id={`price-${range.id}`}
                        checked={selectedPriceRange === range.id}
                        onCheckedChange={(checked) => {
                          setSelectedPriceRange(checked ? range.id : '');
                        }}
                      />
                      <span className="text-sm">{range.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{range.range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    id="featured"
                    checked={featuredOnly}
                    onCheckedChange={(checked) => setFeaturedOnly(checked as boolean)}
                  />
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Coups de cœur uniquement</span>
                </label>
              </div>

              <Button onClick={applyFilters} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Appliquer les filtres
              </Button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Sort & View Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (value !== 'popular') {
                    params.set('sort', value);
                  } else {
                    params.delete('sort');
                  }
                  router.push(`/services?${params.toString()}`);
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Services Grid */}
            {initialServices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-muted-foreground mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button asChild>
                  <Link href="/services">Voir tous les services</Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {initialServices.map((service) => {
                  const cat = categories.find(c => c.id === service.category);
                  return (
                    <Link key={service.id} href={`/services/${service.category.toLowerCase()}/${service.id}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={service.images[0] || '/placeholder.jpg'}
                            alt={service.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {service.featured && (
                              <Badge className="bg-amber-500 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Coup de cœur
                              </Badge>
                            )}
                          </div>
                          <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors">
                            <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                          </button>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {cat?.name}
                            </Badge>
                            {service.vendor.verified && (
                              <Shield className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3" />
                            {service.city}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{service.rating.toFixed(1)}</span>
                              <span className="text-sm text-muted-foreground">({service.reviewCount})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground">À partir de</span>
                              <p className="font-bold text-primary">{formatPrice(service.price)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {initialTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={initialPage <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(initialPage - 1));
                    router.push(`/services?${params.toString()}`);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, initialTotalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === initialPage ? "default" : "outline"}
                        size="icon"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', String(pageNum));
                          router.push(`/services?${params.toString()}`);
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {initialTotalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', String(initialTotalPages));
                          router.push(`/services?${params.toString()}`);
                        }}
                      >
                        {initialTotalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={initialPage >= initialTotalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(initialPage + 1));
                    router.push(`/services?${params.toString()}`);
                  }}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
