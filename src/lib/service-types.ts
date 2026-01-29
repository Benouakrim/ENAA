import { PriceRange } from "@prisma/client";

// Service types mapping to database models
export type ServiceType = 
  | "venue"
  | "caterer"
  | "photographer"
  | "dj"
  | "decorator"
  | "florist"
  | "videographer"
  | "makeup"
  | "planner"
  | "patisserie"
  | "transport"
  | "animator";

// Map wizard service names to service types
export const serviceNameToType: Record<string, ServiceType> = {
  "Lieu/Salle": "venue",
  "Traiteur": "caterer",
  "Photographe": "photographer",
  "DJ/Musique": "dj",
  "Décoration": "decorator",
  "Fleuriste": "florist",
  "Vidéaste": "videographer",
  "Maquillage/Coiffure": "makeup",
  "Wedding Planner": "planner",
  "Pâtisserie": "patisserie",
  "Transport": "transport",
  "Animation": "animator",
};

// French labels for service types
export const serviceTypeLabels: Record<ServiceType, string> = {
  venue: "Lieu/Salle",
  caterer: "Traiteur",
  photographer: "Photographe",
  dj: "DJ/Musique",
  decorator: "Décoration",
  florist: "Fleuriste",
  videographer: "Vidéaste",
  makeup: "Maquillage/Coiffure",
  planner: "Wedding Planner",
  patisserie: "Pâtisserie",
  transport: "Transport",
  animator: "Animation",
};

// Budget ranges for filtering
export const budgetRanges = [
  { value: "BUDGET", label: "Budget (€)", min: 0, max: 500 },
  { value: "STANDARD", label: "Standard (€€)", min: 500, max: 1500 },
  { value: "PREMIUM", label: "Premium (€€€)", min: 1500, max: 4000 },
  { value: "LUXE", label: "Luxe (€€€€)", min: 4000, max: Infinity },
];

// French regions
export const frenchRegions = [
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Bretagne",
  "Hauts-de-France",
  "Grand Est",
  "Normandie",
  "Pays de la Loire",
];

export interface ServiceFilters {
  serviceType?: ServiceType;
  region?: string;
  city?: string;
  priceRange?: PriceRange;
  eventType?: string;
  minRating?: number;
  featured?: boolean;
  verified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceResult {
  id: string;
  name: string;
  description: string;
  city: string;
  region: string;
  priceMin: number;
  priceMax: number;
  priceRange: PriceRange;
  images: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  capacity?: number;
  style?: string;
  availableDates?: string[];
  eventTypes?: string[];
}
