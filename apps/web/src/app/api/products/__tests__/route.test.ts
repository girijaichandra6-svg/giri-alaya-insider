/**
 * Integration tests for GET /api/products — subcategory filtering
 *
 * Runs against a real PostgreSQL database with seeded test data.
 * Requires DATABASE_URL to be set and the test database to be migrated.
 *
 * Usage: npx tsx src/app/api/products/__tests__/route.test.ts
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
  const glowRituals = await prisma.subcategory.create({
    data: {
      slug: "glow-rituals",
      name: "Glow Rituals",
      description: "Daily skincare routines",
      categoryId: beautyCat.id,
    },
  });

  // Helper to create dates relative to now
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  // Create products
  // Fashion > Elevated Essentials (3 active, staggered createdAt for sort tests)
  await prisma.product.createMany({
    data: [
      {
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
        createdAt: daysAgo(3),
      },
      {
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
        createdAt: daysAgo(2),
      },
      {
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
        createdAt: daysAgo(1),
      },
      // Fashion > Signature Silhouettes (2 active)
      {
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
        createdAt: daysAgo(4),
      },
      {
        slug: "cocktail-dress",
        title: "Cocktail Dress",
        brand: "Alaya",
        description: "Elegant cocktail dress",
        basePrice: 199.99,
        currency: "USD",
        isActive: true,
        categoryId: fashionCat.id,
        subcategoryId: signatureSilhouettes.id,
        imageUrls: [],
        createdAt: daysAgo(5),
      },
      // Fashion > Uncategorized (1 active)
      {
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
        createdAt: daysAgo(6),
      },
      // Fashion > Inactive (should not appear)
      {
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
        createdAt: daysAgo(7),
      },
      // Beauty > Glow Rituals (2 active)
      {
        slug: "moisturizer",
        title: "Daily Moisturizer",
        brand: "Alaya",
        description: "Hydrating moisturizer",
        basePrice: 34.99,
        currency: "USD",
        isActive: true,
        categoryId: beautyCat.id,
        subcategoryId: glowRituals.id,
        imageUrls: [],
        createdAt: daysAgo(8),
      },
      {
        slug: "face-serum",
        title: "Vitamin C Serum",
        brand: "Alaya",
        description: "Brightening serum",
        basePrice: 44.99,
        currency: "USD",
        isActive: true,
        categoryId: beautyCat.id,
        subcategoryId: glowRituals.id,
        imageUrls: [],
        createdAt: daysAgo(9),
      },
    ],
  });
}

async function main() {
  console.log("Products API — subcategory filtering tests...\n");

  // ── Seed data ──
  await seedTestData();

  // ── Test 1: No filters — returns all active products across categories ──
  {
    const req = new NextRequest(new URL("http://localhost/api/products"));
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "no filters: returns 200");
    assert(body.total !== undefined, "no filters: response has total");
    // 6 active fashion (3 elevated + 2 signatures + 1 uncategorized) + 2 beauty = 8
    assert(body.total === 8, "no filters: 8 active products total");
    assert(body.products.length === 8, "no filters: all 8 products returned");
    // Verify inactive products are excluded
    assert(
      body.products.every((p: any) => p.slug !== "discontinued-shirt"),
      "no filters: inactive product is excluded"
    );
  }

  // ── Test 2: Filter by category only ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "category filter: returns 200");
    assert(body.total === 6, "category filter: 6 active fashion products");
    assert(
      body.products.every((p: any) => p.category.slug === "fashion"),
      "category filter: all returned products are in fashion"
    );
  }

  // ── Test 3: Filter by subcategory only (returns cross-category) ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?subcategory=elevated-essentials")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "subcategory filter: returns 200");
    assert(body.total === 3, "subcategory filter: 3 products in elevated-essentials");
    assert(
      body.products.every((p: any) => p.subcategory?.slug === "elevated-essentials"),
      "subcategory filter: all returned products have correct subcategory"
    );
  }

  // ── Test 4: Category + subcategory combined ──
  {
    const req = new NextRequest(
      new URL(
        "http://localhost/api/products?category=fashion&subcategory=signature-silhouettes"
      )
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "combined filter: returns 200");
    assert(body.total === 2, "combined filter: 2 products in fashion > signature-silhouettes");
    assert(
      body.products.every(
        (p: any) =>
          p.category.slug === "fashion" &&
          p.subcategory?.slug === "signature-silhouettes"
      ),
      "combined filter: all returned products match both filters"
    );
  }

  // ── Test 5: Subcategory with no matching products ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?subcategory=nonexistent-subcat")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "no match: returns 200");
    assert(body.total === 0, "no match: 0 products returned");
    assert(body.products.length === 0, "no match: empty products array");
  }

  // ── Test 6: Subcategory filter excludes uncategorized products ──
  {
    // The 'fashion-accessory' product has no subcategoryId
    // A subcategory filter should not return it
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "excludes uncategorized: returns 200");
    assert(body.total === 3, "excludes uncategorized: 3 products (no uncategorized)");
    assert(
      body.products.every((p: any) => p.subcategory !== null),
      "excludes uncategorized: no product has null subcategory"
    );
  }

  // ── Test 7: Response shape includes subcategory data ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?subcategory=elevated-essentials")
    );
    const res = await GET(req);
    const body = await res.json();
    const product = body.products[0];

    assert(product.subcategory !== null, "shape: subcategory is not null for categorized products");
    assert(
      typeof product.subcategory.slug === "string",
      "shape: subcategory has string slug"
    );
    assert(
      typeof product.subcategory.name === "string",
      "shape: subcategory has string name"
    );
    assert(
      typeof body.total === "number",
      "shape: total is a number at the top level"
    );
  }

  // ── Test 8: Limit with subcategory filter (first page) ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&limit=2")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "limit: returns 200");
    assert(body.total === 6, "limit: 6 total fashion products");
    assert(body.products.length === 2, "limit: 2 products on page (limit=2)");
    assert(body.page === 1, "limit: page defaults to 1");
    assert(body.totalPages === 3, "limit: 3 total pages (6 / 2)");
  }

  // ── Test 9: Page + limit with subcategory filter (middle page) ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&limit=2&page=2")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "pagination middle: returns 200");
    assert(body.total === 3, "pagination middle: 3 products in elevated-essentials");
    assert(body.products.length === 1, "pagination middle: 1 product on page 2 (last of 3)");
    assert(body.page === 2, "pagination middle: page is 2");
    assert(body.totalPages === 2, "pagination middle: 2 total pages (3 / 2, ceil)");
    assert(
      body.products.every((p: any) => p.subcategory?.slug === "elevated-essentials"),
      "pagination middle: all returned products have correct subcategory"
    );
  }

  // ── Test 10: Page beyond last with subcategory filter ──
  // The API does not clamp page to totalPages — it calculates
  // skip = (page-1)*limit, which skips past all results.
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=signature-silhouettes&limit=2&page=5")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "page beyond last: returns 200");
    assert(body.total === 2, "page beyond last: 2 products in signature-silhouettes");
    // skip = (5-1)*2 = 8, which exceeds total (2) — returns 0 products
    assert(body.products.length === 0, "page beyond last: 0 products returned (skip past end)");
    assert(body.page === 5, "page beyond last: page is 5 as requested");
    assert(body.totalPages === 1, "page beyond last: 1 total page (2 / 2)");
  }

  // ── Test 11: limit=1 with subcategory filter returns correct totalPages ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&limit=1&page=1")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "limit=1: returns 200");
    assert(body.total === 3, "limit=1: 3 products in elevated-essentials");
    assert(body.products.length === 1, "limit=1: 1 product on page 1");
    assert(body.totalPages === 3, "limit=1: 3 total pages (3 / 1)");
  }

  // ── Test 12: sort=price_asc with subcategory filter ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=price_asc")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "price_asc: returns 200");
    assert(body.total === 3, "price_asc: 3 products in elevated-essentials");
    assert(body.products.length === 3, "price_asc: all 3 products returned");
    assert(
      body.products[0].slug === "linen-blend-top",
      "price_asc: first is linen-blend-top ($69.99)"
    );
    assert(
      body.products[1].slug === "classic-white-shirt",
      "price_asc: second is classic-white-shirt ($89.99)"
    );
    assert(
      body.products[2].slug === "silk-camisole",
      "price_asc: third is silk-camisole ($129.99)"
    );
    assert(
      body.products.every((p: any) => p.subcategory?.slug === "elevated-essentials"),
      "price_asc: all returned products have correct subcategory"
    );
  }

  // ── Test 13: sort=price_desc with subcategory filter ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=price_desc")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "price_desc: returns 200");
    assert(body.total === 3, "price_desc: 3 products in elevated-essentials");
    assert(body.products.length === 3, "price_desc: all 3 products returned");
    assert(
      body.products[0].slug === "silk-camisole",
      "price_desc: first is silk-camisole ($129.99)"
    );
    assert(
      body.products[1].slug === "classic-white-shirt",
      "price_desc: second is classic-white-shirt ($89.99)"
    );
    assert(
      body.products[2].slug === "linen-blend-top",
      "price_desc: third is linen-blend-top ($69.99)"
    );
  }

  // ── Test 14: sort=newest with subcategory filter ──
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=newest")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "newest: returns 200");
    assert(body.total === 3, "newest: 3 products in elevated-essentials");
    assert(body.products.length === 3, "newest: all 3 products returned");
    // silk-camisole created 1 day ago, linen-blend-top 2 days ago, classic-white-shirt 3 days ago
    assert(
      body.products[0].slug === "silk-camisole",
      "newest: first is silk-camisole (created 1 day ago)"
    );
    assert(
      body.products[1].slug === "linen-blend-top",
      "newest: second is linen-blend-top (created 2 days ago)"
    );
    assert(
      body.products[2].slug === "classic-white-shirt",
      "newest: third is classic-white-shirt (created 3 days ago)"
    );
  }

  // ── Test 15: sort=bestseller with subcategory filter ──
  // Currently maps to basePrice desc (same as price_desc)
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=bestseller")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "bestseller: returns 200");
    assert(body.total === 3, "bestseller: 3 products in elevated-essentials");
    assert(body.products.length === 3, "bestseller: all 3 products returned");
    // bestseller maps to basePrice: "desc" — same ordering as price_desc
    assert(
      body.products[0].slug === "silk-camisole",
      "bestseller: first is silk-camisole ($129.99)"
    );
    assert(
      body.products[1].slug === "classic-white-shirt",
      "bestseller: second is classic-white-shirt ($89.99)"
    );
    assert(
      body.products[2].slug === "linen-blend-top",
      "bestseller: third is linen-blend-top ($69.99)"
    );
  }

  // ── Test 16: sort=price_asc + pagination (page 2 of ascending) ──
  // 3 products in elevated-essentials sorted by price asc:
  //   Page 1 (limit=2): linen-blend-top ($69.99), classic-white-shirt ($89.99)
  //   Page 2 (limit=2): silk-camisole ($129.99)
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=price_asc&limit=2&page=2")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "price_asc+page: returns 200");
    assert(body.total === 3, "price_asc+page: 3 products in elevated-essentials");
    assert(body.products.length === 1, "price_asc+page: 1 product on page 2");
    assert(body.page === 2, "price_asc+page: page is 2");
    assert(body.totalPages === 2, "price_asc+page: 2 total pages (3 / 2, ceil)");
    assert(
      body.products[0].slug === "silk-camisole",
      "price_asc+page: page 2 is silk-camisole ($129.99, most expensive)"
    );
    assert(
      body.products.every((p: any) => p.subcategory?.slug === "elevated-essentials"),
      "price_asc+page: all returned products have correct subcategory"
    );
  }

  // ── Test 17: sort=price_desc + pagination (page 2 of descending) ──
  // 3 products sorted by price desc:
  //   Page 1 (limit=2): silk-camisole ($129.99), classic-white-shirt ($89.99)
  //   Page 2 (limit=2): linen-blend-top ($69.99)
  {
    const req = new NextRequest(
      new URL("http://localhost/api/products?category=fashion&subcategory=elevated-essentials&sort=price_desc&limit=2&page=2")
    );
    const res = await GET(req);
    const body = await res.json();

    assert(res.status === 200, "price_desc+page: returns 200");
    assert(body.total === 3, "price_desc+page: 3 products in elevated-essentials");
    assert(body.products.length === 1, "price_desc+page: 1 product on page 2");
    assert(body.page === 2, "price_desc+page: page is 2");
    assert(body.totalPages === 2, "price_desc+page: 2 total pages (3 / 2, ceil)");
    assert(
      body.products[0].slug === "linen-blend-top",
      "price_desc+page: page 2 is linen-blend-top ($69.99, cheapest)"
    );
    assert(
      body.products.every((p: any) => p.subcategory?.slug === "elevated-essentials"),
      "price_desc+page: all returned products have correct subcategory"
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
