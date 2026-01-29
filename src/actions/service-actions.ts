"use server";

import { prisma } from "@/lib/prisma";
import { PriceRange, ServiceCategory, Prisma } from "@prisma/client";
import { serviceNameToType, type ServiceType, type ServiceFilters } from "@/lib/service-types";

// Map service type strings to ServiceCategory enum
const serviceTypeToCategory: Record<ServiceType, ServiceCategory> = {
  venue: "VENUE",
  caterer: "CATERER",
  photographer: "PHOTOGRAPHER",
  dj: "DJ",
  decorator: "DECORATOR",
  florist: "FLORIST",
  videographer: "VIDEOGRAPHER",
  makeup: "MAKEUP",
  planner: "PLANNER",
  patisserie: "PATISSERIE",
  transport: "TRANSPORT",
  animator: "ANIMATOR",
};

// Map category to service type string
const categoryToServiceType: Record<ServiceCategory, ServiceType> = {
  VENUE: "venue",
  CATERER: "caterer",
  PHOTOGRAPHER: "photographer",
  DJ: "dj",
  DECORATOR: "decorator",
  FLORIST: "florist",
  VIDEOGRAPHER: "videographer",
  MAKEUP: "makeup",
  PLANNER: "planner",
  PATISSERIE: "patisserie",
  TRANSPORT: "transport",
  ANIMATOR: "animator",
};

/**
 * Get all services with filters - using unified ServiceListing model
 */
export async function getServices(filters: ServiceFilters) {
  const {
    serviceType,
    region,
    city,
    priceRange,
    eventType,
    minRating,
    featured,
    verified,
    search,
    page = 1,
    limit = 12,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ServiceListingWhereInput = {
    active: true,
  };

  // Handle category from serviceType
  if (serviceType && serviceTypeToCategory[serviceType]) {
    where.category = serviceTypeToCategory[serviceType];
  }

  if (region) where.region = region;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (priceRange) where.priceRange = priceRange;
  if (eventType) where.eventTypes = { has: eventType };
  if (minRating) where.rating = { gte: minRating };
  if (featured !== undefined) where.featured = featured;
  if (verified !== undefined) where.verified = verified;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.serviceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        include: {
          vendor: {
            select: {
              id: true,
              userId: true,
              companyName: true,
              verified: true,
              rating: true,
              reviewCount: true,
              logo: true,
              city: true,
            },
          },
        },
      }),
      prisma.serviceListing.count({ where }),
    ]);

    // Add serviceType to each result for backwards compatibility
    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      // Map title to name for backward compatibility
      name: item.title,
      priceMin: item.price,
      priceMax: item.priceMax ?? item.price,
    }));

    return {
      success: true,
      data: dataWithType,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des services",
      data: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(serviceTypeOrId: ServiceType | string, id?: string) {
  try {
    // Handle both old signature (serviceType, id) and new signature (just id)
    const serviceId = id ?? serviceTypeOrId;

    const data = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        availability: {
          where: {
            date: { gte: new Date() },
            available: true,
          },
          take: 30,
          orderBy: { date: "asc" },
        },
      },
    });

    if (!data) {
      return { success: false, error: "Service non trouvé", data: null };
    }

    return {
      success: true,
      data: {
        ...data,
        serviceType: categoryToServiceType[data.category],
        name: data.title,
        priceMin: data.price,
        priceMax: data.priceMax ?? data.price,
      },
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return { success: false, error: "Erreur lors de la récupération du service", data: null };
  }
}

/**
 * Get featured services
 */
export async function getFeaturedServices(limit: number = 8) {
  try {
    const data = await prisma.serviceListing.findMany({
      where: {
        active: true,
        featured: true,
      },
      take: limit,
      orderBy: { rating: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            verified: true,
            city: true,
          },
        },
      },
    });

    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      name: item.title,
      priceMin: item.price,
      priceMax: item.priceMax ?? item.price,
    }));

    return { success: true, data: dataWithType };
  } catch (error) {
    console.error("Error fetching featured services:", error);
    return { success: false, error: "Erreur", data: [] };
  }
}

/**
 * Get services recommended based on user preferences
 */
export async function getRecommendedServices(preferences: {
  eventType?: string;
  eventTypes?: string[];
  region?: string;
  budget?: string;
  services?: string[];
  categories?: string[];
}) {
  try {
    const { eventType, eventTypes, region, budget, services = [], categories = [] } = preferences;

    // Map budget preference to price range
    let priceRange: PriceRange | undefined;
    if (budget) {
      if (budget.includes("1000") && budget.includes("Moins")) priceRange = "BUDGET";
      else if (budget.includes("3000")) priceRange = "STANDARD";
      else if (budget.includes("10000")) priceRange = "PREMIUM";
      else if (budget.includes("50000") || budget.includes("Plus")) priceRange = "LUXE";
    }

    // Build category filter from services or categories
    const categoryFilters: ServiceCategory[] = [];

    // From service names
    services.forEach((s) => {
      const serviceType = serviceNameToType[s];
      if (serviceType && serviceTypeToCategory[serviceType]) {
        categoryFilters.push(serviceTypeToCategory[serviceType]);
      }
    });

    // From direct categories
    categories.forEach((c) => {
      if (Object.values(serviceTypeToCategory).includes(c as ServiceCategory)) {
        categoryFilters.push(c as ServiceCategory);
      }
    });

    // Build where clause
    const where: Prisma.ServiceListingWhereInput = {
      active: true,
    };

    if (categoryFilters.length > 0) {
      where.category = { in: categoryFilters };
    }

    if (region) where.region = region;
    if (priceRange) where.priceRange = priceRange;
    
    // Handle event type filter
    const eventTypeFilter = eventType || (eventTypes && eventTypes[0]);
    if (eventTypeFilter) where.eventTypes = { has: eventTypeFilter };

    const data = await prisma.serviceListing.findMany({
      where,
      take: 16,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      include: {
        vendor: {
          select: {
            companyName: true,
            verified: true,
          },
        },
      },
    });

    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      name: item.title,
      priceMin: item.price,
      priceMax: item.priceMax ?? item.price,
    }));

    return { success: true, data: dataWithType };
  } catch (error) {
    console.error("Error fetching recommended services:", error);
    return { success: false, error: "Erreur", data: [] };
  }
}

/**
 * Get service counts by category
 */
export async function getServiceCounts() {
  try {
    const counts = await prisma.serviceListing.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
    });

    const countMap: Record<string, number> = {};
    let total = 0;

    counts.forEach((c) => {
      const serviceType = categoryToServiceType[c.category];
      countMap[serviceType] = c._count._all;
      total += c._count._all;
    });

    // Ensure all service types have a count (even if 0)
    Object.keys(serviceTypeToCategory).forEach((type) => {
      if (!(type in countMap)) {
        countMap[type] = 0;
      }
    });

    return {
      success: true,
      data: {
        ...countMap,
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching service counts:", error);
    return { success: false, error: "Erreur", data: {} };
  }
}

/**
 * Get services by vendor
 */
export async function getVendorServices(vendorId: string) {
  try {
    const data = await prisma.serviceListing.findMany({
      where: {
        vendorId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          take: 5,
        },
      },
    });

    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      name: item.title,
    }));

    return { success: true, data: dataWithType };
  } catch (error) {
    console.error("Error fetching vendor services:", error);
    return { success: false, error: "Erreur lors de la récupération", data: [] };
  }
}

/**
 * Get similar services
 */
export async function getSimilarServices(serviceId: string, limit: number = 4) {
  try {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      select: { category: true, region: true, priceRange: true },
    });

    if (!service) {
      return { success: false, error: "Service non trouvé", data: [] };
    }

    const data = await prisma.serviceListing.findMany({
      where: {
        active: true,
        category: service.category,
        id: { not: serviceId },
      },
      take: limit,
      orderBy: { rating: "desc" },
      include: {
        vendor: {
          select: {
            companyName: true,
            verified: true,
          },
        },
      },
    });

    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      name: item.title,
    }));

    return { success: true, data: dataWithType };
  } catch (error) {
    console.error("Error fetching similar services:", error);
    return { success: false, error: "Erreur lors de la récupération", data: [] };
  }
}

/**
 * Get service categories with counts
 */
export async function getServiceCategories() {
  try {
    const categories = await prisma.serviceListing.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
    });

    return {
      success: true,
      data: categories.map((c) => ({
        category: c.category,
        serviceType: categoryToServiceType[c.category],
        count: c._count._all,
      })),
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Erreur", data: [] };
  }
}

/**
 * Get regions with service counts
 */
export async function getServiceRegions() {
  try {
    const regions = await prisma.serviceListing.groupBy({
      by: ["region"],
      where: { active: true },
      _count: { _all: true },
    });

    return {
      success: true,
      data: regions.map((r) => ({
        region: r.region,
        count: r._count._all,
      })),
    };
  } catch (error) {
    console.error("Error fetching regions:", error);
    return { success: false, error: "Erreur", data: [] };
  }
}

/**
 * Search services across all categories
 */
export async function searchServices(query: string, limit: number = 20) {
  try {
    const data = await prisma.serviceListing.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { region: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      include: {
        vendor: {
          select: {
            companyName: true,
            verified: true,
          },
        },
      },
    });

    const dataWithType = data.map((item) => ({
      ...item,
      serviceType: categoryToServiceType[item.category],
      name: item.title,
    }));

    return { success: true, data: dataWithType };
  } catch (error) {
    console.error("Error searching services:", error);
    return { success: false, error: "Erreur lors de la recherche", data: [] };
  }
}
