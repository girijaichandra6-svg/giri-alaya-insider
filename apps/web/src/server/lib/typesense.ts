import { Client } from "typesense";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

// ---- Typesense Client Singleton ----
// Returns null if Typesense is not configured (graceful fallback)

let client: Client | null = null;

export function getTypesenseClient(): Client | null {
  if (client) return client;

  const apiKey = process.env.TYPESENSE_API_KEY;
  const host = process.env.TYPESENSE_HOST;

  if (!apiKey || !host) {
    console.warn(
      "Typesense not configured — search features will fall back to PostgreSQL."
    );
    return null;
  }

  client = new Client({
    nodes: [
      {
        host,
        port: Number(process.env.TYPESENSE_PORT) || 443,
        protocol: process.env.TYPESENSE_PROTOCOL === "http" ? "http" : "https",
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 3,
    numRetries: 2,
    retryIntervalSeconds: 0.5,
  });

  return client;
}

// ---- Collection Schemas ----

export const PRODUCTS_SCHEMA: CollectionCreateSchema = {
  name: "products",
  enable_nested_fields: true,
  fields: [
    { name: "title", type: "string", optional: false, infix: true },
    { name: "description", type: "string", optional: true, infix: true },
    { name: "brand", type: "string", optional: true, facet: true, infix: true },
    { name: "category_slug", type: "string", facet: true },
    { name: "category_name", type: "string", facet: true },
    { name: "subcategory_slug", type: "string", facet: true, optional: true },
    { name: "currency", type: "string", facet: true },
    { name: "price", type: "float", facet: true, optional: true },
    { name: "base_price", type: "float", optional: true },
    { name: "avg_rating", type: "float", optional: true },
    { name: "review_count", type: "int32", optional: true },
    { name: "deal_discount", type: "float", optional: true },
    { name: "deal_end_date", type: "int64", optional: true },
    { name: "image_urls", type: "string[]", optional: true },
    { name: "tags", type: "string[]", optional: true, facet: true },
    { name: "is_active", type: "bool", facet: true },
    { name: "created_at", type: "int64" },
    { name: "updated_at", type: "int64", optional: true },
  ],
  default_sorting_field: "created_at",
  token_separators: [" ", "-", "_", "/"],
  symbols_to_index: ["+", "#", "&"],
};

export const POSTS_SCHEMA: CollectionCreateSchema = {
  name: "posts",
  fields: [
    { name: "title", type: "string", infix: true },
    { name: "excerpt", type: "string", optional: true, infix: true },
    { name: "content", type: "string", optional: true, infix: true },
    { name: "author_name", type: "string", optional: true, infix: true },
    { name: "type", type: "string", facet: true },
    { name: "category_slug", type: "string", facet: true },
    { name: "status", type: "string", facet: true },
    { name: "tags", type: "string[]", optional: true, facet: true },
    { name: "cover_image_url", type: "string", optional: true },
    { name: "published_at", type: "int64", optional: true },
    { name: "created_at", type: "int64" },
  ],
  default_sorting_field: "published_at",
};

// ---- Collection Initialization ----

export async function ensureCollection(
  schema: CollectionCreateSchema
): Promise<void> {
  const ts = getTypesenseClient();
  if (!ts) return;

  try {
    await ts.collections(schema.name).retrieve();
    console.log(`[Typesense] Collection "${schema.name}" already exists.`);
  } catch {
    await ts.collections().create(schema);
    console.log(`[Typesense] Collection "${schema.name}" created.`);
  }
}

export async function ensureAllCollections(): Promise<void> {
  await ensureCollection(PRODUCTS_SCHEMA);
  await ensureCollection(POSTS_SCHEMA);
}
