import { getTypesenseClient, PRODUCTS_SCHEMA, POSTS_SCHEMA } from "./typesense";
import { prisma } from "@alaya/db/client";

// ---- Product Indexing ----

interface IndexableProduct {
  id: string;
  title: string;
  description?: string | null;
  brand?: string | null;
  category_slug: string;
  category_name: string;
  subcategory_slug?: string | null;
  price?: number | null;
  base_price?: number | null;
  currency: string;
  avg_rating?: number | null;
  review_count?: number;
  deal_discount?: number | null;
  deal_end_date?: number | null;
  image_urls: string[];
  tags?: string[];
  is_active: boolean;
  created_at: number;
  updated_at?: number;
}

export function productToDocument(product: any): IndexableProduct {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    brand: product.brand,
    category_slug: product.category?.slug ?? "",
    category_name: product.category?.name ?? "",
    subcategory_slug: product.subcategory?.slug ?? null,
    price: product.basePrice ? Number(product.basePrice) : null,
    base_price: product.basePrice ? Number(product.basePrice) : null,
    currency: product.currency ?? "USD",
    avg_rating: product.productScores?.[0]?.score ?? null,
    review_count: product._count?.reviews ?? 0,
    deal_discount: product.deals?.[0]?.discount ?? null,
    deal_end_date: product.deals?.[0]?.endDate
      ? new Date(product.deals[0].endDate).getTime()
      : null,
    image_urls: product.imageUrls ?? [],
    tags:
      product.tags
        ?.map((t: any) => t.tag?.name)
        .filter(Boolean) ?? [],
    is_active: product.isActive,
    created_at: new Date(product.createdAt).getTime(),
    updated_at: product.updatedAt
      ? new Date(product.updatedAt).getTime()
      : undefined,
  };
}

export async function indexProduct(product: any): Promise<void> {
  const ts = getTypesenseClient();
  if (!ts) return;

  const doc = productToDocument(product);

  try {
    await ts
      .collections(PRODUCTS_SCHEMA.name)
      .documents()
      .upsert(doc);
  } catch (err) {
    console.error(`[Typesense] Failed to index product ${product.id}:`, err);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const ts = getTypesenseClient();
  if (!ts) return;

  try {
    await ts
      .collections(PRODUCTS_SCHEMA.name)
      .documents(productId)
      .delete();
  } catch (err) {
    if ((err as any)?.httpStatus !== 404) {
      console.error(`[Typesense] Failed to delete product ${productId}:`, err);
    }
  }
}

export async function indexAllProducts(): Promise<void> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      subcategory: true,
      tags: { include: { tag: true } },
      deals: {
        where: { isActive: true, endDate: { gte: new Date() } },
        take: 1,
      },
      productScores: {
        where: { type: "COMMUNITY" as const },
        take: 1,
      },
      _count: {
        select: { reviews: true },
      },
    },
  });

  const ts = getTypesenseClient();
  if (!ts) return;

  const documents = products.map(productToDocument);

  try {
    await ts
      .collections(PRODUCTS_SCHEMA.name)
      .documents()
      .import(documents, { action: "upsert" });
    console.log(`[Typesense] Indexed ${documents.length} products.`);
  } catch (err) {
    console.error("[Typesense] Bulk product import failed:", err);
  }
}

// ---- Post Indexing ----

interface IndexablePost {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  type: string;
  category_slug?: string;
  cover_image_url?: string | null;
  status: string;
  tags?: string[];
  author_name?: string;
  published_at?: number;
  created_at: number;
}

export function postToDocument(post: any): IndexablePost {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    type: post.type,
    category_slug: post.category?.slug ?? undefined,
    cover_image_url: post.coverImageUrl,
    status: post.status,
    tags:
      post.tags
        ?.map((t: any) => t.tag?.name)
        .filter(Boolean) ?? [],
    author_name: post.author?.name,
    published_at: post.publishedAt
      ? new Date(post.publishedAt).getTime()
      : undefined,
    created_at: new Date(post.createdAt).getTime(),
  };
}

export async function indexPost(post: any): Promise<void> {
  const ts = getTypesenseClient();
  if (!ts) return;

  const doc = postToDocument(post);

  try {
    await ts
      .collections(POSTS_SCHEMA.name)
      .documents()
      .upsert(doc);
  } catch (err) {
    console.error(`[Typesense] Failed to index post ${post.id}:`, err);
  }
}

export async function deletePost(postId: string): Promise<void> {
  const ts = getTypesenseClient();
  if (!ts) return;

  try {
    await ts
      .collections(POSTS_SCHEMA.name)
      .documents(postId)
      .delete();
  } catch (err) {
    if ((err as any)?.httpStatus !== 404) {
      console.error(`[Typesense] Failed to delete post ${postId}:`, err);
    }
  }
}

export async function indexAllPosts(): Promise<void> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" as const },
    include: {
      category: true,
      tags: { include: { tag: true } },
      author: true,
    },
  });

  const ts = getTypesenseClient();
  if (!ts) return;

  const documents = posts.map(postToDocument);

  try {
    await ts
      .collections(POSTS_SCHEMA.name)
      .documents()
      .import(documents, { action: "upsert" });
    console.log(`[Typesense] Indexed ${documents.length} posts.`);
  } catch (err) {
    console.error("[Typesense] Bulk post import failed:", err);
  }
}
