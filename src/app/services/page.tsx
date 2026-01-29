import ServicesPageClient from "./ServicesPageClient";
import { prisma } from "@/lib/prisma";

interface SearchParams {
  category?: string;
  q?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  priceRange?: string;
  featured?: string;
  sort?: string;
  page?: string;
}

async function getServices(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10);
  const perPage = 12;
  const skip = (page - 1) * perPage;

  // Build where clause
  const where: Record<string, unknown> = { active: true };

  if (searchParams.category) {
    where.category = searchParams.category.toUpperCase();
  }

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  if (searchParams.city) {
    where.city = { contains: searchParams.city, mode: 'insensitive' };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      (where.price as Record<string, number>).gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      (where.price as Record<string, number>).lte = parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.priceRange) {
    where.priceRange = searchParams.priceRange.toUpperCase();
  }

  if (searchParams.featured === 'true') {
    where.featured = true;
  }

  // Build orderBy
  type OrderByType = Record<string, 'asc' | 'desc'>;
  let orderBy: OrderByType = { rating: 'desc' };
  switch (searchParams.sort) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    default:
      orderBy = { rating: 'desc' };
  }

  const [services, total] = await Promise.all([
    prisma.serviceListing.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        vendor: {
          select: { companyName: true, verified: true }
        }
      }
    }),
    prisma.serviceListing.count({ where })
  ]);

  return {
    services,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
    perPage
  };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { services, total, page, totalPages } = await getServices(params);

  return (
    <ServicesPageClient 
      services={services}
      total={total}
      page={page}
      totalPages={totalPages}
      currentCategory={params.category}
    />
  );
}

