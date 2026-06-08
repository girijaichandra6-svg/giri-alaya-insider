// ---- Server-side fetch helpers are in ./server-api.ts ----
// ---- Client-side fetch helpers ----

export async function clientFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ---- Typed API endpoints ----

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  description: string;
  imageUrls: string[];
  basePrice: number | null;
  currency: string;
  category: {
    slug: string;
    name: string;
    accentColor: string;
  };
  subcategory?: {
    slug: string;
    name: string;
  } | null;
  deals: Array<{
    id: string;
    discount: number | null;
    endDate: string;
  }>;
}

export interface ProductsResponse {
  products: ProductCardData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  description: string;
  specs: Record<string, string> | null;
  imageUrls: string[];
  basePrice: number | null;
  currency: string;
  category: { slug: string; name: string; accentColor: string };
  subcategory: { slug: string; name: string } | null;
  affiliateLinks: AffiliateLinkData[];
  reviews: ReviewData[];
  deals: DealData[];
  tags: { tag: { name: string } }[];
  productScores: { score: number; type: string }[];
}

export interface AffiliateLinkData {
  id: string;
  url: string;
  priority: number;
  retailer: { id: string; name: string; logoUrl: string | null; trustScore: number };
}

export interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  pros: string | null;
  cons: string | null;
  helpfulCount: number;
  createdAt: string;
  user: { name: string | null; avatarUrl: string | null };
}

export interface DealData {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount: number | null;
  endDate: string;
  isActive: boolean;
}

export interface CategoryData {
  slug: string;
  name: string;
  description: string | null;
  accentColor: string;
  imageUrl: string | null;
}

export interface SearchResults {
  products: { found: number; hits: any[] };
  posts: { found: number; hits: any[] };
  source: string;
}

export interface SubcategoryData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productCount?: number;
}

export interface SubcategoriesResponse {
  subcategories: SubcategoryData[];
}

export interface AutocompleteResult {
  products: any[];
  posts: any[];
}
