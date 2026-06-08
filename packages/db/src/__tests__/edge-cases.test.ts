import { prisma, Prisma } from "../client";
import { withFreshDb } from "./test-db";

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

async function main() {
  console.log("Edge case tests...");

  // ──────────────────────────────────────
  // 1. Empty database after fresh reset
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    // resetDb truncates + reseeds. Clear key tables to verify empty state.
    await prisma.$transaction([
      prisma.productTag.deleteMany(),
      prisma.affiliateLink.deleteMany(),
      prisma.review.deleteMany(),
      prisma.post.deleteMany(),
      prisma.product.deleteMany(),
      prisma.subcategory.deleteMany(),
      prisma.category.deleteMany(),
      prisma.user.deleteMany(),
      prisma.tag.deleteMany(),
      prisma.brand.deleteMany(),
      prisma.retailer.deleteMany(),
      prisma.affiliateNetwork.deleteMany(),
    ]);
    assert((await prisma.user.count()) === 0, "empty: 0 users");
    assert((await prisma.product.count()) === 0, "empty: 0 products");
    assert((await prisma.category.count()) === 0, "empty: 0 categories");
    assert((await prisma.review.count()) === 0, "empty: 0 reviews");
    assert((await prisma.tag.count()) === 0, "empty: 0 tags");
  });

  // ──────────────────────────────────────
  // 2. Duplicate unique fields
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    // Duplicate email
    try {
      await prisma.user.create({
        data: { clerkId: "dup_email", email: "admin@alaya.test", name: "Dup", role: "USER", language: "en" },
      });
      assert(false, "dup email: should have thrown");
    } catch (e: any) {
      assert(e.code === "P2002", `dup email: P2002 error (got ${e.code})`);
      assert(String(e.meta?.target ?? []).includes("email"), "dup email: targets email constraint");
    }

    // Duplicate slug
    try {
      await prisma.product.create({
        data: {
          slug: "soundwave-pro-headphones", title: "Fake", brand: "Fake",
          description: "Fake", basePrice: 10, currency: "USD",
          categoryId: (await prisma.category.findFirstOrThrow()).id,
        },
      });
      assert(false, "dup slug: should have thrown");
    } catch (e: any) {
      assert(e.code === "P2002", `dup slug: P2002 error (got ${e.code})`);
    }

    // Duplicate tag name
    try {
      await prisma.tag.create({ data: { name: "wireless" } });
      assert(false, "dup tag: should have thrown");
    } catch (e: any) {
      assert(e.code === "P2002", `dup tag: P2002 error (got ${e.code})`);
    }
  });

  // ──────────────────────────────────────
  // 3. Composite unique violations
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    const existing = await prisma.productTag.findFirst();
    assert(existing !== null, "composite dup: seeded product-tag exists");
    try {
      await prisma.productTag.create({ data: { productId: existing!.productId, tagId: existing!.tagId } });
      assert(false, "composite dup: should have thrown");
    } catch (e: any) {
      assert(e.code === "P2002", `composite dup: P2002 error (got ${e.code})`);
    }
  });

  // ──────────────────────────────────────
  // 4. Missing required relations
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    // Product without categoryId (required)
    try {
      await prisma.product.create({
        data: { slug: "no-cat", title: "No Cat", brand: "X", description: "Missing category", basePrice: 10, currency: "USD" } as any,
      });
      assert(false, "missing rel: product without category should throw");
    } catch {
      assert(true, "missing rel product: threw as expected");
    }

    // Review with non-existent productId
    try {
      await prisma.review.create({
        data: {
          id: "review_bad_fk", productId: "nonexistent-id-12345",
          userId: (await prisma.user.findFirstOrThrow()).id,
          rating: 3, title: "Bad", body: "Test body",
        } as any,
      });
      assert(false, "missing rel: review with bad productId should throw");
    } catch (e: any) {
      assert(e.code === "P2003", `missing rel review: P2003 error (got ${e.code})`);
    }
  });

  // ──────────────────────────────────────
  // 5. Optional / null fields
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    // User with only required fields
    const minimalUser = await prisma.user.create({
      data: { clerkId: "minimal_user", email: "minimal@alaya.test", role: "USER", language: "en" },
    });
    assert(minimalUser.name === null, "null field: name is null when omitted");
    assert(minimalUser.avatarUrl === null, "null field: avatarUrl is null when omitted");
    assert(minimalUser.deletedAt === null, "null field: deletedAt is null by default");

    // Product with explicit null Json fields
    const minimalProduct = await prisma.product.create({
      data: {
        slug: "minimal-product", title: "Minimal", brand: "X",
        description: "Null optional fields", currency: "USD",
        categoryId: (await prisma.category.findFirstOrThrow()).id,
        specs: Prisma.DbNull, metadata: Prisma.DbNull, videoUrls: [],
      },
    });
    assert(minimalProduct.specs === null, "null field: specs explicitly null");
    assert(minimalProduct.metadata === null, "null field: metadata explicitly null");
    assert(minimalProduct.subcategoryId === null, "null field: subcategoryId null when omitted");
  });

  // ──────────────────────────────────────
  // 6. Boundary values
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    const catId = (await prisma.category.findFirstOrThrow()).id;

    // Zero price
    const free = await prisma.product.create({
      data: { slug: "free-product", title: "Free", brand: "X", description: "Zero price", basePrice: 0, currency: "USD", categoryId: catId },
    });
    assert(Number(free.basePrice) === 0, "boundary: zero price accepted");

    // Very long title (200 chars, well within varchar limits)
    const longTitle = "A".repeat(200);
    const longProduct = await prisma.product.create({
      data: { slug: "long-title", title: longTitle, brand: "X", description: "Long title test", basePrice: 99.99, currency: "USD", categoryId: catId },
    });
    assert(longProduct.title.length === 200, `boundary: 200-char title accepted (got ${longProduct.title.length})`);

    // Empty slug — PostgreSQL treats '' as a valid unique value (only NULL is excluded),
    // so this create should succeed (documenting the constraint boundary).
    const emptySlug = await prisma.product.create({
      data: { slug: "", title: "Empty Slug", brand: "X", description: "Empty string slug", basePrice: 10, currency: "USD", categoryId: catId },
    });
    assert(emptySlug.slug === "", "boundary: empty string accepted as slug (no NOT NULL violation)");

    // Negative price — allowed at DB level (no CHECK constraint)
    const neg = await prisma.product.create({
      data: { slug: "negative-price", title: "Negative Price", brand: "X", description: "Negative price", basePrice: -10.50, currency: "USD", categoryId: catId },
    });
    assert(Number(neg.basePrice) === -10.5, "boundary: negative price accepted by DB");
  });

  // ──────────────────────────────────────
  // 7. Seeded data integrity
  // ──────────────────────────────────────
  await withFreshDb(async () => {
    // No soft-deleted users
    const users = await prisma.user.findMany({ select: { deletedAt: true } });
    assert(users.every((u) => u.deletedAt === null), "integrity: no seeded users are soft-deleted");

    // Valid timestamps on products
    const products = await prisma.product.findMany({ select: { createdAt: true, updatedAt: true } });
    assert(products.every((p) => p.createdAt instanceof Date && p.updatedAt instanceof Date), "integrity: all products have valid timestamps");

    // Published posts have publishedAt
    const post = await prisma.post.findFirst({ where: { status: "PUBLISHED" } });
    assert(post !== null, "integrity: at least one published post exists");
    if (post) {
      assert(post.publishedAt !== null, "integrity: published post has publishedAt");
    }
    });
}

main()
    .catch((e) => {
      console.error("Edge case tests failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
