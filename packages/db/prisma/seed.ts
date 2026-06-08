import { prisma } from "../src/client";
import { ALL_TABLES, ALAYA_CATEGORIES, slugify, DEMO_PRODUCTS_BY_SUBCATEGORY } from "../src/seed-utils";
import { SUBCATEGORIES_BY_CATEGORY } from "../src/seed-subcategories";

// Brand names for seed users
const RETAILER_NAMES = ["TechWorld", "GardenSupply", "LuxeRetail Co", "StyleHouse", "WellnessMarket"];
const TAG_NAMES = [
  "cotton", "linen", "silk", "wool", "cashmere", "leather", "denim",
  "organic", "sustainable", "luxury", "classic", "modern", "minimal",
  "handcrafted", "artisan", "premium", "essential", "seasonal",
  "vitamin-c", "retinol", "hyaluronic", "peptide", "spf", "antioxidant",
  "ceramic", "bamboo", "marble", "brass", "crystal", "porcelain",
  "waterproof", "portable", "travel", "durable", "lightweight",
  "protein", "superfood", "vegan", "gluten-free",
  "bluetooth", "wireless", "smart", "rechargeable", "ergonomic",
];

async function main() {
  console.log("Clearing database...");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${ALL_TABLES.map((t) => `"${t}"`).join(", ")} CASCADE;`
  );
  console.log("Seeding ALAYA INSIDER database...");

  // ── Users ──
  const [, alayaEditor, alayaMember] = await Promise.all([
    prisma.user.create({ data: { clerkId: "clerk_alaya_admin", email: "admin@alayainsider.com", name: "ALAYA Admin", role: "ADMIN" as any, language: "en", country: "US", currency: "USD", theme: "dark" } }),
    prisma.user.create({ data: { clerkId: "clerk_alaya_editor", email: "editor@alayainsider.com", name: "ALAYA Editor", role: "EDITOR" as any, language: "en", country: "US", currency: "USD", theme: "dark" } }),
    prisma.user.create({ data: { clerkId: "clerk_alaya_member", email: "member@alayainsider.com", name: "ALAYA Member", role: "USER" as any, language: "en", country: "US", currency: "USD", theme: "dark" } }),
  ]);
  console.log(`Users: ${3} created`);

  // ── Brands & Tags & Retailers ──
  const brandNames = [...new Set(
    Object.values(DEMO_PRODUCTS_BY_SUBCATEGORY).flatMap((prods) => prods.map((p) => p.brand))
  )];
  await Promise.all(
    brandNames.map((name) =>
      prisma.brand.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  console.log(`Brands: ${brandNames.length} upserted`);

  const tags = await Promise.all(
    TAG_NAMES.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  const tagMap = new Map(tags.map((t) => [t.name, t.id]));
  console.log(`Tags: ${tags.length} upserted`);

  // ── Retailers & Affiliate Network ──
  const retailers = await Promise.all(
    RETAILER_NAMES.map((name) =>
      prisma.retailer.upsert({
        where: { name },
        update: {},
        create: { name, website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`, trustScore: 4.0 + Math.random() },
      })
    )
  );
  const anet = await prisma.affiliateNetwork.upsert({
    where: { identifier: "alaya_partnerize" },
    update: {},
    create: { name: "ALAYA Affiliate Network", identifier: "alaya_partnerize", config: { apiKey: "alaya_prod_key" } },
  });
  console.log(`Retailers: ${retailers.length}, Affiliate Network: ${anet.id}`);

  // ── Categories ──
  const cats = await Promise.all(
    ALAYA_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug }, update: {},
        create: { slug: c.slug, name: c.name, description: c.description, accentColor: c.accentColor },
      })
    )
  );
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));
  console.log(`Categories: ${cats.length} upserted`);

  // Build subcategory maps from the single source of truth
  // slug -> { name, description, categorySlug }
  const subcatData = new Map<string, { name: string; description: string; categorySlug: string }>();
  for (const [catSlug, subs] of Object.entries(SUBCATEGORIES_BY_CATEGORY)) {
    for (const sub of subs) {
      const slug = slugify(sub.name);
      subcatData.set(slug, { ...sub, categorySlug: catSlug });
    }
  }

  let subcatCount = 0;
  for (const [subSlug, data] of subcatData) {
    const categoryId = catMap.get(data.categorySlug);
    if (!categoryId) continue;
    await prisma.subcategory.upsert({
      where: { slug: subSlug },
      update: { name: data.name, description: data.description, categoryId },
      create: { slug: subSlug, name: data.name, description: data.description, categoryId },
    });
    subcatCount++;
  }
  console.log(`Subcategories: ${subcatCount} upserted`);
  // Build subcatSlug -> { id, categoryId } map for products
  const allSubcats = await prisma.subcategory.findMany();
  const subcatMap = new Map(allSubcats.map((s) => [s.slug, s]));

  // ── Products ──
  let productCount = 0;
  let affLinkCount = 0;
  for (const [subSlug, products] of Object.entries(DEMO_PRODUCTS_BY_SUBCATEGORY)) {
    const subcatEntry = subcatMap.get(subSlug);
    if (!subcatEntry) {
      console.warn(`  Subcategory not found: ${subSlug}, skipping ${products.length} products`);
      continue;
    }
    const { id: subcatId, categoryId: catId } = subcatEntry;

    for (const prod of products) {
      const prodSlug = slugify(prod.name);
      const created = await prisma.product.upsert({
        where: { slug: prodSlug },
        update: {},
        create: {
          slug: prodSlug,
          title: prod.name,
          brand: prod.brand,
          description: prod.description,
          basePrice: prod.basePrice,
          currency: "USD",
          categoryId: catId,
          subcategoryId: subcatId,
          isActive: true,
          imageUrls: [],
        },
      });
      productCount++;

      // Tags
      for (const tn of prod.tags) {
        const tagId = tagMap.get(tn);
        if (tagId) {
          try {
            await prisma.productTag.upsert({
              where: { productId_tagId: { productId: created.id, tagId } },
              update: {}, create: { productId: created.id, tagId },
            });
          } catch { /* ignore duplicates */ }
        }
      }

      // Affiliate link (rotate through retailers)
      const retailer = retailers[productCount % retailers.length]!;
      await prisma.affiliateLink.upsert({
        where: { id: `aff_${prodSlug}` },
        update: {},
        create: {
          id: `aff_${prodSlug}`,
          productId: created.id,
          retailerId: retailer.id,
          networkId: anet.id,
          url: `https://alayainsider.com/go/${prodSlug}`,
          isActive: true,
        },
      });
      affLinkCount++;
    }
  }
  console.log(`Products: ${productCount} upserted`);
  console.log(`Affiliate links: ${affLinkCount} upserted`);

  // ── Posts ──
  const posts = [
    { slug: "ultimate-fashion-guide-2025", title: "The Ultimate Fashion Guide for 2025", excerpt: "Discover the season's must-have pieces and timeless classics.", type: "GUIDE" as const, status: "PUBLISHED" as const, categorySlug: "fashion" },
    { slug: "skincare-routine-essentials", title: "Building the Perfect Skincare Routine", excerpt: "Expert guide to building a routine that transforms your skin.", type: "GUIDE" as const, status: "PUBLISHED" as const, categorySlug: "beauty" },
    { slug: "home-decor-trends-2025", title: "Home Decor Trends Taking Over 2025", excerpt: "From warm minimalism to statement textures - what's new in interiors.", type: "ARTICLE" as const, status: "PUBLISHED" as const, categorySlug: "home-living" },
    { slug: "wellness-journey-guide", title: "Your Guide to a Mindful Wellness Journey", excerpt: "Holistic health practices for a balanced lifestyle.", type: "GUIDE" as const, status: "PUBLISHED" as const, categorySlug: "health-wellness" },
  ];
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: `Full article content for ${post.title}.`,
        type: post.type,
        status: post.status,
        publishedAt: new Date(),
        categoryId: catMap.get(post.categorySlug)!,
        authorId: alayaEditor.id,
      },
    });
  }
  console.log(`Posts: ${posts.length} created`);

  // ── Reviews (a few sample reviews) ──
  const sampleProducts = await prisma.product.findMany({ take: 5 });
  const reviews = [
    { productId: sampleProducts[0]?.id, rating: 5, title: "Exceptional Quality", body: "Exceeded all my expectations. The quality and craftsmanship are outstanding." },
    { productId: sampleProducts[1]?.id, rating: 4, title: "Great Purchase", body: "Really happy with this purchase. Would recommend to anyone looking for premium quality." },
    { productId: sampleProducts[2]?.id, rating: 5, title: "Worth Every Penny", body: "Premium product that delivers on its promises. The attention to detail is remarkable." },
  ];
  for (const rev of reviews) {
    if (!rev.productId) continue;
    await prisma.review.create({
      data: {
        productId: rev.productId,
        userId: alayaMember.id,
        rating: rev.rating,
        title: rev.title,
        body: rev.body,
        isVerifiedPurchase: true,
      },
    });
  }
  console.log(`Reviews: created`);

  console.log("\n✓ ALAYA INSIDER database seeded successfully!");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
