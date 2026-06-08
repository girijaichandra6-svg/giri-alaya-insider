import { getTypesenseClient, PRODUCTS_SCHEMA, POSTS_SCHEMA } from "../lib/typesense";
import { prisma } from "@alaya/db/client";
import type { Prisma } from "@alaya/db/client";

// ---- Typesense-powered Search ----

export interface SearchOptions {
  query: string;
  filter?: string;
  sort_by?: string;
  page?: number;
  per_page?: number;
  include?: "products" | "posts" | "both";
  category?: string;
  subcategory?: string;
}

export interface SearchResults {
  products: { found: number; hits: any[] };
  posts: { found: number; hits: any[] };
}

const SORT_MAP: Record<string, string> = {
  relevance: "_text_match:desc",
  newest: "created_at:desc",
  price_asc: "price:asc",
  price_desc: "price:desc",
  rating: "avg_rating:desc",
};

function buildFilterBy(options: SearchOptions): string | undefined {
  const filters: string[] = [];

  if (options.filter) {
    filters.push(options.filter);
  }

  if (options.category) {
    filters.push(`category_slug:=${options.category}`);
  }

  if (options.subcategory) {
    filters.push(`subcategory_slug:=${options.subcategory}`);
  }

  return filters.length > 0 ? filters.join(" && ") : undefined;
}

/**
 * Translate frontend sort values to Typesense sort_by format (field:order).
 * Falls back to undefined if the value isn't recognized, letting Typesense
 * use its default relevance-based sort.
 */
function buildSortBy(sort?: string): string | undefined {
  if (!sort) return undefined;
  return SORT_MAP[sort];
}

export async function searchAll(options: SearchOptions): Promise<SearchResults> {
  const ts = getTypesenseClient();

  if (!ts) {
    return {
      products: { found: 0, hits: [] },
      posts: { found: 0, hits: [] },
    };
  }

  const filterBy = buildFilterBy(options);
  const sortBy = buildSortBy(options.sort_by);

  const commonParams = {
    q: options.query || "*",
    filter_by: filterBy,
    sort_by: sortBy,
    page: options.page ?? 1,
    per_page: options.per_page ?? 20,
  };

  const includeProducts =
    options.include === "products" || options.include === "both" || !options.include;
  const includePosts =
    options.include === "posts" || options.include === "both" || !options.include;

  const [productResults, postResults] = await Promise.all([
    includeProducts
      ? ts
          .collections(PRODUCTS_SCHEMA.name)
          .documents()
          .search({
            ...commonParams,
            query_by: "title,description,brand",
            include_fields:
              "title,description,brand,price,currency,avg_rating,image_urls,category_slug,category_name,deal_discount",
            facet_by: "category_slug,brand,price",
            infix: "always",
          })
          .catch((err) => {
            console.error("[Typesense] Product search error:", err);
            return { found: 0, hits: [] };
          })
      : Promise.resolve({ found: 0, hits: [] }),

    includePosts
      ? ts
          .collections(POSTS_SCHEMA.name)
          .documents()
          .search({
            ...commonParams,
            query_by: "title,excerpt,content",
            include_fields:
              "title,excerpt,type,category_slug,cover_image_url,author_name,published_at",
            facet_by: "type,category_slug,tags",
            infix: "always",
          })
          .catch((err) => {
            console.error("[Typesense] Post search error:", err);
            return { found: 0, hits: [] };
          })
      : Promise.resolve({ found: 0, hits: [] }),
  ]);

  return {
    products: productResults as { found: number; hits: any[] },
    posts: postResults as { found: number; hits: any[] },
  };
}

export async function autocomplete(query: string): Promise<{
  products: any[];
  posts: any[];
}> {
  const ts = getTypesenseClient();

  if (!ts) {
    return { products: [], posts: [] };
  }

  const [products, posts] = await Promise.all([
    ts
      .collections(PRODUCTS_SCHEMA.name)
      .documents()
      .search({
        q: query,
        query_by: "title,brand",
        per_page: 5,
        include_fields: "title,brand,image_urls,category_slug",
      })
      .then((r) => r.hits ?? [])
      .catch(() => []),

    ts
      .collections(POSTS_SCHEMA.name)
      .documents()
      .search({
        q: query,
        query_by: "title",
        per_page: 3,
        include_fields: "title,type,category_slug",
      })
      .then((r) => r.hits ?? [])
      .catch(() => []),
  ]);

  return { products, posts };
}

// ---- Fallback: PostgreSQL Product Search (used when Typesense is unavailable) ----

export interface ProductSearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Array<{
    id: string;
    slug: string;
    title: string;
    brand: string | null;
    description: string;
    imageUrls: string[];
    basePrice: Prisma.Decimal | null;
    currency: string;
    categorySlug: string;
    categoryName: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export async function searchProducts(
  params: ProductSearchParams
): Promise<ProductSearchResult> {
  const {
    q,
    category,
    subcategory,
    minPrice,
    maxPrice,
    brand,
    sort = "relevance",
    page = 1,
    limit = 24,
  } = params;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (subcategory) {
    where.subcategory = { slug: subcategory };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) where.basePrice.gte = minPrice;
    if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
  }

  if (brand) {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        brand: true,
        description: true,
        imageUrls: true,
        basePrice: true,
        currency: true,
        category: { select: { slug: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      description: p.description,
      imageUrls: p.imageUrls,
      basePrice: p.basePrice,
      currency: p.currency,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
