/**
 * Integration tests for GET /api/subcategories
 *
 * Runs against a real PostgreSQL database with seeded test data.
 * Requires DATABASE_URL to be set and the test database to be migrated.
 *
 * Usage: npx tsx src/app/api/subcategories/__tests__/route.test.ts
 */
import { NextRequest } from "next/server";
import { prisma } from "@alaya/db/client";
import { GET } from "../route";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function seedTestData() {
  // Create categories
  const fashionCat = await prisma.category.create({
    data: {
      slug: "fashion",
      name: "Fashion",
      description: "Fashion products",
      accentColor: "#FFB6C1",
    },
  });

  const beautyCat = await prisma.category.create({
    data: {
      slug: "beauty",
      name: "Beauty",
      description: "Beauty products",
      accentColor: "#FFA07A",
    },
  });

  // Create subcategories for Fashion
  const elevatedEssentials = await prisma.subcategory.create({
    data: {
      slug: "elevated-essentials",
      name: "Elevated Essentials",
      description: "Shirts, tops, everyday basics",
      categoryId: fashionCat.id,
    },
  });

  const signatureSilhouettes = await prisma.subcategory.create({
    data: {
      slug: "signature-silhouettes",
      name: "Signature Silhouettes",
      description: "Dresses and statement pieces",
      categoryId: fashionCat.id,
    },
  });

  // Create subcategories for Beauty
  await prisma.subcategory.create({
    data: {
      slug: "glow-rituals",
      name: "Glow Rituals",
      description: "Daily skincare routines",
      categoryId: beautyCat.id,
    },
  });

  // Create products linked to subcategories
  // Fashion > Elevated Essentials (3 active + 1 inactive)
  await prisma.product.create({
    data: {
      slug: "classic-white-shirt",
      title: "Classic White Shirt",
      brand: "Alaya",
      description: "A timeless white shirt",
      basePrice: 89.99,
      currency: "USD",
      isActive: true,
      categoryId: fashionCat.id,
      subcategoryId: elevatedEssentials.id,
      imageUrls: [],
    },
  });

  await prisma.product.create({
    data: {
      slug: "linen-blend-top",
      title: "Linen Blend Top",
      brand: "Alaya",
      description: "Breathable linen top",
      basePrice: 69.99,
      currency: "USD",
      isActive: true,
      categoryId: fashionCat.id,
      subcategoryId: elevatedEssentials.id,
      imageUrls: [],
    },
  });

  await prisma.product.create({
    data: {
      slug: "silk-camisole",
      title: "Silk Camisole",
      brand: "Alaya",
      description: "Luxurious silk camisole",
      basePrice: 129.99,
      currency: "USD",
      isActive: true,
      categoryId: fashionCat.id,
      subcategoryId: elevatedEssentials.id,
      imageUrls: [],
    },
  });

  // Inactive product (should not be counted)
  await prisma.product.create({
    data: {
      slug: "discontinued-shirt",
      title: "Discontinued Shirt",
      brand: "Alaya",
      description: "No longer available",
      basePrice: 49.99,
      currency: "USD",
      isActive: false,
      categoryId: fashionCat.id,
      subcategoryId: elevatedEssentials.id,
      imageUrls: [],
    },
  });

  // Fashion > Signature Silhouettes (1 active)
  await prisma.product.create({
    data: {
      slug: "evening-gown",
      title: "Evening Gown",
      brand: "Alaya",
      description: "Stunning evening gown",
      basePrice: 299.99,
      currency: "USD",
      isActive: true,
      categoryId: fashionCat.id,
      subcategoryId: signatureSilhouettes.id,
      imageUrls: [],
    },
  });

  // Uncategorized product (no subcategoryId) — should appear in totalProductCount
  // but NOT in any subcategory's productCount
  await prisma.product.create({
    data: {
      slug: "fashion-accessory",
      title: "Fashion Accessory",
      brand: "Alaya",
      description: "A general fashion item without a subcategory",
      basePrice: 39.99,
      currency: "USD",
      isActive: true,
      categoryId: fashionCat.id,
      // subcategoryId intentionally omitted (null)
      imageUrls: [],
    },
  });

  // Beauty category (no products at all)
  // Beauty > Glow Rituals already created above, no products

  return { fashionCat, beautyCat };
}

async function main() {
  console.log("Subcategories API tests...\n");

  // ── Test: Missing category param ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/subcategories")
    );
    const res = await GET(req);
    const body = await res.json();
    assert(res.status === 400, "missing category: returns 400");
    assert(body.error === "category query parameter is required", "missing category: correct error message");
  }

  // ── Test: Non-existent category ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/subcategories?category=nonexistent")
    );
    const res = await GET(req);
    const body = await res.json();
    assert(res.status === 404, "nonexistent category: returns 404");
    assert(body.error === "Category not found", "nonexistent category: correct error message");
  }

  // ── Seed data and test counts ──
  await seedTestData();

  // ── Test: Fashion category (2 subcategories, 5 active products total)
  //         One product has no subcategoryId, so it's in totalProductCount
  //         but not in any subcategory's productCount
  {
    const req = new NextRequest(
      new URL("http://localhost/api/subcategories?category=fashion")
    );
    const res = await GET(req);
    const body = await res.json();
    assert(res.status === 200, "fashion: returns 200");
    assert(body.subcategories.length === 2, "fashion: 2 subcategories");
    assert(body.totalProductCount === 5, "fashion: 5 active products total (incl. uncategorized)");

    // Sum of per-subcategory counts should be LESS than totalProductCount
    // because the uncategorized product is included in total but not in subcategory counts
    const sumOfSubCounts = body.subcategories.reduce(
      (sum: number, s: any) => sum + s.productCount, 0
    );
    assert(
      sumOfSubCounts < body.totalProductCount,
      "fashion: sum of per-subcategory counts is less than totalProductCount (uncategorized product)"
    );

    // Elevated Essentials should have 3 active products
    const elevated = body.subcategories.find(
      (s: any) => s.slug === "elevated-essentials"
    );
    assert(elevated !== undefined, "fashion: elevated-essentials exists");
    assert(elevated.productCount === 3, "fashion: elevated-essentials has 3 active products");

    // Signature Silhouettes should have 1 active product
    const signatures = body.subcategories.find(
      (s: any) => s.slug === "signature-silhouettes"
    );
    assert(signatures !== undefined, "fashion: signature-silhouettes exists");
    assert(signatures.productCount === 1, "fashion: signature-silhouettes has 1 active product");
  }

  // ── Test: Beauty category (1 subcategory, 0 active products) ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/subcategories?category=beauty")
    );
    const res = await GET(req);
    const body = await res.json();
    assert(res.status === 200, "beauty: returns 200");
    assert(body.subcategories.length === 1, "beauty: 1 subcategory");
    assert(body.totalProductCount === 0, "beauty: 0 active products total");

    const glow = body.subcategories.find(
      (s: any) => s.slug === "glow-rituals"
    );
    assert(glow !== undefined, "beauty: glow-rituals exists");
    assert(glow.productCount === 0, "beauty: glow-rituals has 0 products");
  }

  // ── Test: Subcategory returned with correct shape ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/subcategories?category=fashion")
    );
    const res = await GET(req);
    const body = await res.json();
    const sub = body.subcategories[0];
    assert(
      sub.id && typeof sub.id === "string",
      "response shape: subcategory has string id"
    );
    assert(
      sub.slug && typeof sub.slug === "string",
      "response shape: subcategory has string slug"
    );
    assert(
      sub.name && typeof sub.name === "string",
      "response shape: subcategory has string name"
    );
    assert(
      typeof sub.productCount === "number",
      "response shape: subcategory has numeric productCount"
    );
    assert(
      typeof body.totalProductCount === "number",
      "response shape: totalProductCount is a number"
    );
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

// Clean and reseed before running
async function cleanup() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Product", "Subcategory", "Category" CASCADE;`
  );
}

cleanup()
  .then(main)
  .catch((e) => {
    console.error("Tests failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
