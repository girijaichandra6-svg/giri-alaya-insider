import { prisma } from "../client";
import { resetDb } from "./test-db";

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
  console.log("Integration tests (seeded data)...");
  await resetDb();

  // ── Users ──
  {
    const count = await prisma.user.count();
    assert(count === 3, `seeded 3 users, got ${count}`);
  }
  {
    const admin = await prisma.user.findUnique({ where: { email: "admin@alaya.test" } });
    assert(admin !== null, "admin user exists");
    assert(admin!.role === "ADMIN", "admin has ADMIN role");
  }
  {
    const editor = await prisma.user.findUnique({ where: { email: "editor@alaya.test" } });
    assert(editor !== null, "editor user exists");
    assert(editor!.role === "EDITOR", "editor has EDITOR role");
  }
  {
    const regular = await prisma.user.findUnique({ where: { email: "user@alaya.test" } });
    assert(regular !== null, "regular user exists");
    assert(regular!.role === "USER", "regular has USER role");
  }

  // ── Categories & Subcategories ──
  {
    const count = await prisma.category.count();
    assert(count === 2, `seeded 2 categories, got ${count}`);
  }
  {
    const subCount = await prisma.subcategory.count();
    assert(subCount === 4, `seeded 4 subcategories, got ${subCount}`);
  }
  {
    const ec = await prisma.category.findUnique({ where: { slug: "electronics" } });
    assert(ec !== null, "electronics category exists");
    assert(ec!.name === "Electronics", "electronics category has correct name");
  }
  {
    const hg = await prisma.category.findUnique({ where: { slug: "home-garden" } });
    assert(hg !== null, "home-garden category exists");
    assert(hg!.name.includes("Home"), "home-garden has correct name");
  }
  {
    const subs = await prisma.subcategory.findMany({
      where: { category: { slug: "electronics" } },
      select: { slug: true },
    });
    const slugs = subs.map((s) => s.slug).sort();
    assert(slugs.join(",") === "headphones,laptops", "electronics has headphones and laptops subcategories");
  }

  // ── Brands & Tags ──
  {
    const count = await prisma.brand.count();
    assert(count === 2, `seeded 2 brands, got ${count}`);
  }
  {
    const tagCount = await prisma.tag.count();
    assert(tagCount === 6, `seeded 6 tags, got ${tagCount}`);
  }
  {
    const tags = await prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } });
    const names = tags.map((t) => t.name).join(",");
    assert(names === "bamboo,bluetooth,eco-friendly,noise-cancelling,organic,wireless", "all 6 tag names match");
  }

  // ── Retailers & Affiliate Network ──
  {
    const count = await prisma.retailer.count();
    assert(count === 2, `seeded 2 retailers, got ${count}`);
  }
  {
    const tw = await prisma.retailer.findUnique({ where: { name: "TechWorld" } });
    assert(tw !== null, "TechWorld retailer exists");
    assert(tw!.trustScore === 4.5, "TechWorld trust score is 4.5");
  }
  {
    const gs = await prisma.retailer.findUnique({ where: { name: "GardenSupply" } });
    assert(gs !== null, "GardenSupply retailer exists");
    assert(gs!.trustScore === 4.2, "GardenSupply trust score is 4.2");
  }
  {
    const anet = await prisma.affiliateNetwork.findUnique({ where: { identifier: "partnerize" } });
    assert(anet !== null, "Partnerize affiliate network exists");
  }

  // ── Products ──
  {
    const count = await prisma.product.count();
    assert(count === 4, `seeded 4 products, got ${count}`);
  }
  {
    const hp = await prisma.product.findUnique({ where: { slug: "soundwave-pro-headphones" } });
    assert(hp !== null, "SoundWave Pro Headphones exists");
    assert(hp!.brand === "SoundWave", "headphones brand is SoundWave");
    assert(hp!.isActive === true, "headphones is active");
  }
  {
    const trowel = await prisma.product.findUnique({ where: { slug: "greenthumb-trowel" } });
    assert(trowel !== null, "GreenThumb Trowel exists");
    assert(trowel!.brand === "GreenThumb", "trowel brand is GreenThumb");
    assert(Number(trowel!.basePrice) === 19.99, "trowel price is 19.99");
  }

  // ── Product-to-Category relationship ──
  {
    const ec = await prisma.category.findUnique({ where: { slug: "electronics" } });
    const ecProducts = await prisma.product.count({ where: { categoryId: ec!.id } });
    assert(ecProducts === 2, "2 products in electronics category");
  }
  {
    const hg = await prisma.category.findUnique({ where: { slug: "home-garden" } });
    const hgProducts = await prisma.product.count({ where: { categoryId: hg!.id } });
    assert(hgProducts === 2, "2 products in home-garden category");
  }

  // ── Product-Tag (many-to-many) ──
  {
    const ptCount = await prisma.productTag.count();
    assert(ptCount === 8, `seeded 8 product-tag associations, got ${ptCount}`);
  }
  {
    const hp = await prisma.product.findUnique({ where: { slug: "soundwave-pro-headphones" }, include: { tags: { include: { tag: true } } } });
    assert(hp !== null, "headphones with tags exists");
    const tagNames = hp!.tags.map((pt) => pt.tag.name).sort();
    assert(tagNames.join(",") === "bluetooth,noise-cancelling,wireless", "headphones has 3 correct tags");
  }

  // ── Affiliate Links ──
  {
    const count = await prisma.affiliateLink.count();
    assert(count === 4, `seeded 4 affiliate links, got ${count}`);
  }
  {
    const hp = await prisma.product.findUnique({ where: { slug: "soundwave-pro-headphones" } });
    const links = await prisma.affiliateLink.count({ where: { productId: hp!.id } });
    assert(links >= 1, "headphones has at least 1 affiliate link");
  }

  // ── Posts ──
  {
    const count = await prisma.post.count();
    assert(count === 2, `seeded 2 posts, got ${count}`);
  }
  {
    const post = await prisma.post.findUnique({
      where: { slug: "top-headphones-2025" },
      include: { author: true, category: true },
    });
    assert(post !== null, "Top Headphones post exists");
    assert(post!.type === "ARTICLE", "headphones post is ARTICLE type");
    assert(post!.status === "PUBLISHED", "headphones post is PUBLISHED");
    assert(post!.author!.email === "editor@alaya.test", "headphones post author is editor");
    assert(post!.category!.slug === "electronics", "headphones post in electronics category");
  }
  {
    const post = await prisma.post.findUnique({ where: { slug: "sustainable-gardening" } });
    assert(post !== null, "Sustainable Gardening post exists");
    assert(post!.type === "GUIDE", "gardening post is GUIDE type");
  }

  // ── Reviews ──
  {
    const count = await prisma.review.count();
    assert(count === 2, `seeded 2 reviews, got ${count}`);
  }
  {
    const hpReview = await prisma.review.findUnique({
      where: { id: "review_hp_001" },
      include: { product: { select: { slug: true } }, user: { select: { email: true } } },
    });
    assert(hpReview !== null, "headphones review exists");
    assert(hpReview!.rating === 5, "headphones review has 5 stars");
    assert(hpReview!.product.slug === "soundwave-pro-headphones", "review linked to correct product");
    assert(hpReview!.user.email === "user@alaya.test", "review author is regular user");
    assert((hpReview as any)!.isVerifiedPurchase === true, "review is verified purchase");
  }
  {
    const bpReview = await prisma.review.findUnique({
      where: { id: "review_bp_001" },
      include: { product: { select: { slug: true } } },
    });
    assert(bpReview !== null, "planter review exists");
    assert(bpReview!.rating === 4, "planter review has 4 stars");
    assert(bpReview!.product.slug === "greenthumb-planter", "planter review linked to correct product");
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("Integration tests failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
