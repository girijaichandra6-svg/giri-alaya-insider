import { prisma } from "@alaya/db/client";
import {
  indexProduct,
  deleteProduct,
  indexPost,
  deletePost,
} from "./typesense-index";

const PRODUCT_INCLUDE = {
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
  _count: { select: { reviews: true } },
} as const;

const POST_INCLUDE = {
  category: true,
  tags: { include: { tag: true } },
  author: true,
} as const;

// ---- Chunked batch processor ----

const DEFAULT_BATCH_SIZE = 50;

function resolveBatchSize(override?: number): number {
  if (override !== undefined && override > 0) return override;
  const fromEnv = process.env.TYPESENSE_BATCH_SIZE;
  if (fromEnv) {
    const parsed = Number(fromEnv);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_BATCH_SIZE;
}

async function batchProcess<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  onError: (item: T, err: unknown) => void = (_item, err) =>
    console.error(err),
  batchSize?: number
): Promise<void> {
  const size = resolveBatchSize(batchSize);
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const results = await Promise.allSettled(chunk.map((item) => fn(item)));
    results.forEach((result, j) => {
      if (result.status === "rejected") {
        onError(chunk[j] as T, result.reason);
      }
    });
  }
}

async function getAffectedProductIds(
  where: Record<string, unknown> | undefined
): Promise<string[] | null> {
  if (!where || Object.keys(where).length === 0) return null;
  const records = await prisma.product.findMany({
    where: where as any,
    select: { id: true },
  });
  return records.map((r) => r.id);
}

async function getAffectedPostIds(
  where: Record<string, unknown> | undefined
): Promise<string[] | null> {
  if (!where || Object.keys(where).length === 0) return null;
  const records = await prisma.post.findMany({
    where: where as any,
    select: { id: true },
  });
  return records.map((r) => r.id);
}

async function reindexProduct(id: string): Promise<void> {
  const full = await prisma.product.findUnique({
    where: { id },
    include: PRODUCT_INCLUDE,
  });
  if (full) await indexProduct(full);
}

async function reindexPost(id: string): Promise<void> {
  const full = await prisma.post.findUnique({
    where: { id },
    include: POST_INCLUDE,
  });
  if (full) await indexPost(full);
}

export { resolveBatchSize, batchProcess };

export const xprisma = prisma.$extends({
  name: "typesense-sync",
  query: {
    product: {
      async create({ args, query }) {
        const result = await query(args);
        if (result.id) reindexProduct(result.id).catch(console.error);
        return result;
      },
      async update({ args, query }) {
        const result = await query(args);
        if (result.id) reindexProduct(result.id).catch(console.error);
        return result;
      },
      async delete({ args, query }) {
        const result = await query(args);
        if (result.id) deleteProduct(result.id).catch(console.error);
        return result;
      },
      async upsert({ args, query }) {
        const result = await query(args);
        if (result.id) reindexProduct(result.id).catch(console.error);
        return result;
      },
      async updateMany({ args, query }) {
        const ids = await getAffectedProductIds(args.where);
        const result = await query(args);
        if (ids && ids.length > 0) {
          await batchProcess(ids, reindexProduct, (id, err) =>
            console.error("[Typesense] Failed to reindex product " + id + ":", err)
          );
        }
        return result;
      },
      async deleteMany({ args, query }) {
        const ids = await getAffectedProductIds(args.where);
        const result = await query(args);
        if (ids && ids.length > 0) {
          await batchProcess(ids, deleteProduct, (id, err) =>
            console.error("[Typesense] Failed to delete product " + id + ":", err)
          );
        }
        return result;
      },
    },
    post: {
      async create({ args, query }) {
        const result = await query(args);
        if (result.id) reindexPost(result.id).catch(console.error);
        return result;
      },
      async update({ args, query }) {
        const result = await query(args);
        if (result.id) reindexPost(result.id).catch(console.error);
        return result;
      },
      async delete({ args, query }) {
        const result = await query(args);
        if (result.id) deletePost(result.id).catch(console.error);
        return result;
      },
      async upsert({ args, query }) {
        const result = await query(args);
        if (result.id) reindexPost(result.id).catch(console.error);
        return result;
      },
      async updateMany({ args, query }) {
        const ids = await getAffectedPostIds(args.where);
        const result = await query(args);
        if (ids && ids.length > 0) {
          await batchProcess(ids, reindexPost, (id, err) =>
            console.error("[Typesense] Failed to reindex post " + id + ":", err)
          );
        }
        return result;
      },
      async deleteMany({ args, query }) {
        const ids = await getAffectedPostIds(args.where);
        const result = await query(args);
        if (ids && ids.length > 0) {
          await batchProcess(ids, deletePost, (id, err) =>
            console.error("[Typesense] Failed to delete post " + id + ":", err)
          );
        }
        return result;
      },
    },
  },
});
