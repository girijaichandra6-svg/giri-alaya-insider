import { prisma } from "../client";
import { ALL_TABLES } from "../seed-utils";
import {
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_SUBCATEGORIES,
  SEED_BRANDS,
  SEED_TAG_NAMES,
  SEED_RETAILERS,
  SEED_AFFILIATE_NETWORK,
  SEED_PRODUCTS,
  SEED_POSTS,
  SEED_REVIEWS,
} from "./seed-data";

/**
 * Delete all rows from all tables and reseed with deterministic test data.
 */
export async function resetDb(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `TRUNCATE TABLE ${ALL_TABLES.map((t) => `"${t}"`).join(", ")} CASCADE;`
    );
    await seedDb(tx);
  });
}

/**
 * Seed the database with deterministic test data.
 */
export async function seedDb(tx?: any): Promise<void> {
  const db = tx ?? prisma;

  // ── Users ──
  await db.user.create({
    data: { clerkId: SEED_USERS[0]!.clerkId, email: SEED_USERS[0]!.email, name: SEED_USERS[0]!.name, role: SEED_USERS[0]!.role as any, language: SEED_USERS[0]!.language, country: SEED_USERS[0]!.country, currency: SEED_USERS[0]!.currency, theme: SEED_USERS[0]!.theme },
  });
  const editorUser = await db.user.create({
    data: { clerkId: SEED_USERS[1]!.clerkId, email: SEED_USERS[1]!.email, name: SEED_USERS[1]!.name, role: SEED_USERS[1]!.role as any, language: SEED_USERS[1]!.language, country: SEED_USERS[1]!.country, currency: SEED_USERS[1]!.currency, theme: SEED_USERS[1]!.theme },
  });
  const regularUser = await db.user.create({
    data: { clerkId: SEED_USERS[2]!.clerkId, email: SEED_USERS[2]!.email, name: SEED_USERS[2]!.name, role: SEED_USERS[2]!.role as any, language: SEED_USERS[2]!.language, country: SEED_USERS[2]!.country, currency: SEED_USERS[2]!.currency, theme: SEED_USERS[2]!.theme },
  });

  // ── Categories & Subcategories ──
  const categoryResults = await Promise.all(
    SEED_CATEGORIES.map((c) =>
      db.category.create({
        data: { slug: c.slug, name: c.name, description: c.description, accentColor: c.accentColor },
      })
    )
  );
  const electronicsCat = categoryResults[0]!;
  const homeGardenCat = categoryResults[1]!;
  const catMap = new Map<string, string>();
  catMap.set("electronics", electronicsCat.id);
  catMap.set("home-garden", homeGardenCat.id);

  await Promise.all(
    SEED_SUBCATEGORIES.map((sc) =>
      db.subcategory.create({
        data: { slug: sc.slug, name: sc.name, categoryId: catMap.get(sc.categorySlug)! },
      })
    )
  );

  // ── Brands & Tags ──
  await Promise.all(
    SEED_BRANDS.map((name) => db.brand.create({ data: { name } }))
  );

  const createdTags = await Promise.all(
    SEED_TAG_NAMES.map((name) => db.tag.create({ data: { name } }))
  );

  // ── Retailers & Affiliate Network ──
  const [techWorld, gardenSupply] = await Promise.all(
    SEED_RETAILERS.map((r) =>
      db.retailer.create({
        data: { name: r.name, website: r.website, trustScore: r.trustScore },
      })
    )
  );
  const partnerize = await db.affiliateNetwork.create({
    data: { name: SEED_AFFILIATE_NETWORK.name, identifier: SEED_AFFILIATE_NETWORK.identifier, config: SEED_AFFILIATE_NETWORK.config as any },
  });

  // ── Products ──
  const tagMap = new Map(createdTags.map((t) => [t.name, t.id]));
  for (const pd of SEED_PRODUCTS) {
    const { tagNames, categorySlug, ...data } = pd;
    const product = await db.product.create({
      data: { ...data, categoryId: catMap.get(categorySlug)! },
    });
    for (const tn of tagNames) {
      const tagId = tagMap.get(tn);
      if (tagId) {
        await db.productTag.create({ data: { productId: product.id, tagId } });
      }
    }
    const retailer = product.categoryId === catMap.get("electronics")! ? techWorld : gardenSupply;
    await db.affiliateLink.create({
      data: {
        productId: product.id, retailerId: retailer.id, networkId: partnerize.id,
        url: "https://example.com/p/" + product.slug,
        isActive: true,
      },
    });
  }

  // ── Posts ──
  await Promise.all(
    SEED_POSTS.map((p) =>
      db.post.create({
        data: {
          slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
          type: p.type as any, status: p.status as any, publishedAt: new Date(),
          categoryId: catMap.get(p.categorySlug)!, authorId: editorUser.id,
        },
      })
    )
  );

  // ── Reviews ──
  const [hp, bp] = await Promise.all([
    db.product.findUniqueOrThrow({ where: { slug: "soundwave-pro-headphones" } }),
    db.product.findUniqueOrThrow({ where: { slug: "greenthumb-planter" } }),
  ]);

  await Promise.all(
    SEED_REVIEWS.map((r) => {
      const productId = r.productSlug === "soundwave-pro-headphones" ? hp.id : bp.id;
      return db.review.create({
        data: {
          id: r.id, productId, userId: regularUser.id,
          rating: r.rating, title: r.title, body: r.body,
          isVerifiedPurchase: r.isVerifiedPurchase,
        },
      });
    })
  );
}

/**
 * Convenience: reset the database and run a callback with clean data.
 */
export async function withFreshDb<T>(fn: () => Promise<T>): Promise<T> {
  await resetDb();
  return fn();
}
