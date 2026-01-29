"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Euro,
  Heart,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getServices } from "@/actions/service-actions";
import {
  ServiceType,
  serviceTypeLabels,
  frenchRegions,
  budgetRanges,
} from "@/lib/service-types";

const eventTypes = [
  "Mariage",
  "Anniversaire",
  "Corporatif",
  "Soirée Privée",
  "Baptême/Communion",
  "Remise de diplômes",
  "Baby Shower",
  "Fiançailles",
];

const serviceCategories: { type: ServiceType; icon: string; color: string }[] = [
  { type: "venue", icon: "🏰", color: "bg-amber-100 text-amber-700" },
  { type: "caterer", icon: "🍽️", color: "bg-orange-100 text-orange-700" },
  { type: "photographer", icon: "📸", color: "bg-pink-100 text-pink-700" },
  { type: "dj", icon: "🎵", color: "bg-purple-100 text-purple-700" },
  { type: "decorator", icon: "✨", color: "bg-yellow-100 text-yellow-700" },
  { type: "florist", icon: "💐", color: "bg-green-100 text-green-700" },
  { type: "videographer", icon: "🎬", color: "bg-red-100 text-red-700" },
  { type: "makeup", icon: "💄", color: "bg-rose-100 text-rose-700" },
  { type: "planner", icon: "📋", color: "bg-blue-100 text-blue-700" },
  { type: "patisserie", icon: "🎂", color: "bg-pink-100 text-pink-700" },
  { type: "transport", icon: "🚗", color: "bg-slate-100 text-slate-700" },
  { type: "animator", icon: "🎭", color: "bg-indigo-100 text-indigo-700" },
];

interface ServiceCardProps {
  service: any;
  onFavorite?: (id: string) => void;
}

function ServiceCard({ service, onFavorite }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const category = serviceCategories.find((c) => c.type === service.serviceType);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavorite?.(service.id);
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `${min}€`;
    return `${min}€ - ${max}€`;
  };

  return (
    <Link href={`/dashboard/client/services/${service.serviceType}/${service.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={service.images?.[0] || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
          {service.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-white gap-1">
                <Sparkles className="h-3 w-3" />
                En vedette
              </Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <Badge className={`${category?.color || "bg-gray-100"}`}>
              {category?.icon} {serviceTypeLabels[service.serviceType as ServiceType]}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {service.name}
              </h3>
              {service.verified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span>{service.city}, {service.region}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{service.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">
                  ({service.reviewCount} avis)
                </span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Euro className="h-4 w-4" />
                <span>{formatPrice(service.priceMin, service.priceMax)}</span>
              </div>
            </div>
            {service.capacity && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Jusqu&apos;à {service.capacity} personnes</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface ServicesClientProps {
  initialServices: any[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userPreferences?: {
    preferredEventTypes?: string[];
    preferredRegion?: string | null;
    preferredBudget?: string | null;
    preferredCategories?: string[];
    preferredStyles?: string[];
  };
}

export default function ServicesClient({
  initialServices,
  initialPagination,
  userPreferences,
}: ServicesClientProps) {
  const searchParams = useSearchParams();

  // Get initial values from URL or preferences
  const initialServiceType = (searchParams.get("type") as ServiceType) || "venue";
  const initialRegion = searchParams.get("region") || userPreferences?.preferredRegion || "";
  const initialEventType = searchParams.get("eventType") || (userPreferences?.preferredEventTypes?.[0]) || "";
  const initialSearch = searchParams.get("search") || "";

  const [services, setServices] = useState(initialServices);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [region, setRegion] = useState(initialRegion);
  const [eventType, setEventType] = useState(initialEventType);
  const [priceRange, setPriceRange] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  // Fetch services when filters change
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getServices({
        serviceType,
        region: region || undefined,
        eventType: eventType || undefined,
        priceRange: priceRange as any || undefined,
        search: search || undefined,
        page,
        limit: 12,
      });

      if (result.success) {
        setServices(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  }, [serviceType, region, eventType, priceRange, search, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (serviceType !== "venue") params.set("type", serviceType);
    if (region) params.set("region", region);
    if (eventType) params.set("eventType", eventType);
    if (search) params.set("search", search);
    
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `/dashboard/client/services${newUrl}`);
  }, [serviceType, region, eventType, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const clearFilters = () => {
    setRegion("");
    setEventType("");
    setPriceRange("");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = region || eventType || priceRange || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Trouvez vos prestataires
          </h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} prestataires disponibles
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {serviceCategories.map((category) => (
            <button
              key={category.type}
              onClick={() => {
                setServiceType(category.type);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                serviceType === category.type
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {serviceTypeLabels[category.type]}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>
        <div className="flex gap-2">
          <Select value={region} onValueChange={(v) => { setRegion(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les régions</SelectItem>
              {frenchRegions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventType} onValueChange={(v) => { setEventType(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les événements</SelectItem>
              {eventTypes.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <Euro className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les prix</SelectItem>
              {budgetRanges.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Essayez de modifier vos filtres ou d&apos;élargir votre recherche
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Effacer tous les filtres
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
