import { prisma } from "./client";

// ── Taxonomy Data ──

export const SUBCATEGORIES_BY_CATEGORY: Record<
  string,
  Array<{ name: string; description: string }>
> = {
  fashion: [
    {
      name: "Elevated Essentials",
      description: "Shirts, tops, everyday basics",
    },
    {
      name: "Signature Silhouettes",
      description: "Dresses and statement pieces",
    },
    {
      name: "Tailored Staples",
      description: "Trousers and formal bottoms",
    },
    {
      name: "Everyday Icons",
      description: "Casual outfits",
    },
    {
      name: "The Denim Edit",
      description: "Jeans and denim pieces",
    },
    {
      name: "Soft Tailoring",
      description: "Blazers and officewear",
    },
    {
      name: "Modern Classics",
      description: "Timeless wardrobe staples",
    },
    {
      name: "Quiet Luxury",
      description: "Premium fashion pieces",
    },
    {
      name: "Weekend Uniform",
      description: "Lounge and weekend wear",
    },
    {
      name: "Resort Escape",
      description: "Vacation clothing",
    },
    {
      name: "Layering Luxe",
      description: "Jackets and outerwear",
    },
    {
      name: "Seasonal Statements",
      description: "Trend-driven pieces",
    },
    {
      name: "After-Dark Dressing",
      description: "Party and evening wear",
    },
    {
      name: "The Knit Studio",
      description: "Knitwear and sweaters",
    },
    {
      name: "Contemporary Fits",
      description: "Modern cuts and styles",
    },
    {
      name: "Street Society",
      description: "Streetwear",
    },
    {
      name: "City Dressing",
      description: "Urban fashion",
    },
    {
      name: "Finishing Touches",
      description: "Accessories and jewelry",
    },
    {
      name: "Carryall Culture",
      description: "Bags and wallets",
    },
    {
      name: "Sole Stories",
      description: "Footwear and sneakers",
    },
  ],
  beauty: [
    {
      name: "Glow Rituals",
      description: "Daily skincare routines",
    },
    {
      name: "Skin Science",
      description: "Serums and treatment products",
    },
    {
      name: "Complexion Lab",
      description: "Foundations and complexion products",
    },
    {
      name: "Fresh Face Edit",
      description: "Natural makeup products",
    },
    {
      name: "Beauty Atelier",
      description: "Premium beauty products",
    },
    {
      name: "Hydration Heroes",
      description: "Moisturizers and hydration products",
    },
    {
      name: "Clean Beauty Collective",
      description: "Organic and clean beauty",
    },
    {
      name: "Timeless Radiance",
      description: "Anti-aging products",
    },
    {
      name: "Luxe Self-Care",
      description: "Spa and self-care essentials",
    },
    {
      name: "Hair Revival",
      description: "Shampoos and haircare",
    },
    {
      name: "Scalp Society",
      description: "Scalp treatments and oils",
    },
    {
      name: "Color Studio",
      description: "Makeup products",
    },
    {
      name: "Signature Scents",
      description: "Perfumes and fragrances",
    },
    {
      name: "Beauty Tools Studio",
      description: "Beauty devices and tools",
    },
    {
      name: "The Nail Bar",
      description: "Nail care and nail art",
    },
    {
      name: "Daily Glam",
      description: "Everyday makeup essentials",
    },
    {
      name: "Beauty Essentials",
      description: "Must-have beauty products",
    },
    {
      name: "The Glow Guide",
      description: "Brightening products",
    },
    {
      name: "Radiance Reset",
      description: "Skin recovery products",
    },
    {
      name: "Age-Defying Favorites",
      description: "Mature skincare solutions",
    },
  ],
  "home-living": [
    {
      name: "Curated Interiors",
      description: "Home decor collections",
    },
    {
      name: "Living Spaces",
      description: "Living room furniture and essentials",
    },
    {
      name: "Cozy Corners",
      description: "Reading nooks and accent furniture",
    },
    {
      name: "Sleep Sanctuary",
      description: "Beds, bedding and mattresses",
    },
    {
      name: "Soft Living",
      description: "Blankets, cushions and soft furnishings",
    },
    {
      name: "Home Refresh",
      description: "Home improvement products",
    },
    {
      name: "Dining Moments",
      description: "Dining room essentials",
    },
    {
      name: "Kitchen Studio",
      description: "Cookware and kitchen tools",
    },
    {
      name: "Ambient Glow",
      description: "Lamps and lighting",
    },
    {
      name: "Statement Decor",
      description: "Decorative pieces and wall art",
    },
    {
      name: "Organized Living",
      description: "Storage and organization products",
    },
    {
      name: "Smart Living",
      description: "Smart home devices",
    },
    {
      name: "The Hosting Edit",
      description: "Entertaining essentials",
    },
    {
      name: "Outdoor Retreat",
      description: "Patio and garden products",
    },
    {
      name: "Bathroom Retreat",
      description: "Bathroom accessories",
    },
    {
      name: "Laundry Lounge",
      description: "Laundry and cleaning essentials",
    },
    {
      name: "Home Office Studio",
      description: "Desk and workspace products",
    },
    {
      name: "Pet-Friendly Living",
      description: "Pet beds and home accessories",
    },
    {
      name: "Seasonal Living",
      description: "Holiday and seasonal decor",
    },
    {
      name: "Everyday Comfort",
      description: "Daily-use home essentials",
    },
  ],
  travel: [
    {
      name: "Jetsetter Essentials",
      description: "Travel necessities",
    },
    {
      name: "The Carry-On Edit",
      description: "Suitcases and travel bags",
    },
    {
      name: "Weekend Escape",
      description: "Short-trip products",
    },
    {
      name: "Wanderlust Collection",
      description: "Travel accessories",
    },
    {
      name: "Adventure Ready",
      description: "Outdoor and adventure gear",
    },
    {
      name: "Travel Comfort",
      description: "Neck pillows and comfort products",
    },
    {
      name: "Destination Style",
      description: "Vacation fashion",
    },
    {
      name: "Smart Packing",
      description: "Packing cubes and organizers",
    },
    {
      name: "On-The-Go Essentials",
      description: "Portable products",
    },
    {
      name: "Road Trip Society",
      description: "Car travel accessories",
    },
    {
      name: "Frequent Flyer Picks",
      description: "Premium travel products",
    },
    {
      name: "Travel Tech",
      description: "Travel gadgets and electronics",
    },
    {
      name: "Resort Retreat",
      description: "Resort vacation essentials",
    },
    {
      name: "Outdoor Escape",
      description: "Camping gear",
    },
    {
      name: "Urban Explorer",
      description: "City travel products",
    },
    {
      name: "Beach Club",
      description: "Beach accessories",
    },
    {
      name: "Mountain Moments",
      description: "Hiking gear",
    },
    {
      name: "Global Finds",
      description: "International travel essentials",
    },
    {
      name: "Memory Makers",
      description: "Cameras and travel journals",
    },
    {
      name: "Vacation Mode",
      description: "All-purpose vacation products",
    },
  ],
  "health-wellness": [
    {
      name: "Daily Wellness",
      description: "Everyday health products",
    },
    {
      name: "Mindful Living",
      description: "Meditation and mindfulness products",
    },
    {
      name: "Inner Balance",
      description: "Mental wellness products",
    },
    {
      name: "Active Recovery",
      description: "Massage guns and recovery tools",
    },
    {
      name: "Energy Boosters",
      description: "Energy supplements",
    },
    {
      name: "Sleep Better",
      description: "Sleep aids and bedding products",
    },
    {
      name: "Women's Wellness",
      description: "Female health products",
    },
    {
      name: "Healthy Habits",
      description: "Habit-building tools",
    },
    {
      name: "Nutrition Edit",
      description: "Vitamins and supplements",
    },
    {
      name: "Fitness Essentials",
      description: "Exercise equipment",
    },
    {
      name: "Stress Less",
      description: "Relaxation products",
    },
    {
      name: "Self-Care Rituals",
      description: "Spa and wellness products",
    },
    {
      name: "Movement Studio",
      description: "Yoga and mobility products",
    },
    {
      name: "Immune Support",
      description: "Immune supplements",
    },
    {
      name: "Hydration Zone",
      description: "Water bottles and hydration products",
    },
    {
      name: "Wellness Reset",
      description: "Detox and cleanse products",
    },
    {
      name: "Healthy Aging",
      description: "Senior wellness products",
    },
    {
      name: "Body Basics",
      description: "Personal care products",
    },
    {
      name: "Better Living",
      description: "Lifestyle wellness products",
    },
    {
      name: "Holistic Living",
      description: "Natural wellness products",
    },
  ],
  "food-nutrition": [
    {
      name: "The Pantry Edit",
      description: "Pantry staples and grocery essentials",
    },
    {
      name: "Flavor Studio",
      description: "Sauces, spices and seasonings",
    },
    {
      name: "Better Bites",
      description: "Healthy snacks",
    },
    {
      name: "Everyday Nourishment",
      description: "Everyday food products",
    },
    {
      name: "Mindful Eating",
      description: "Portion control and healthy eating",
    },
    {
      name: "Superfood Society",
      description: "Superfoods and nutrient-rich products",
    },
    {
      name: "Protein Picks",
      description: "Protein powders and protein snacks",
    },
    {
      name: "Healthy Indulgence",
      description: "Guilt-free treats",
    },
    {
      name: "Snack Smart",
      description: "Snack collections",
    },
    {
      name: "Kitchen Creations",
      description: "Baking and cooking ingredients",
    },
    {
      name: "Fresh Finds",
      description: "Fresh and organic products",
    },
    {
      name: "Global Flavors",
      description: "International foods",
    },
    {
      name: "Morning Rituals",
      description: "Breakfast essentials",
    },
    {
      name: "Coffee Culture",
      description: "Coffee products and accessories",
    },
    {
      name: "Tea Time",
      description: "Tea and herbal beverages",
    },
    {
      name: "Sweet Escapes",
      description: "Desserts and sweet treats",
    },
    {
      name: "Functional Foods",
      description: "Foods with health benefits",
    },
    {
      name: "Wholesome Living",
      description: "Natural and whole foods",
    },
    {
      name: "Balanced Plates",
      description: "Meal kits and nutrition-focused products",
    },
    {
      name: "Gourmet Discoveries",
      description: "Premium and specialty foods",
    },
  ],
};

// ── Helpers ──

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "") // Remove apostrophes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Main Seed Function ──

export async function seedSubcategories(): Promise<void> {
  const categorySlugs = Object.keys(SUBCATEGORIES_BY_CATEGORY);
  let totalSeeded = 0;

  for (const catSlug of categorySlugs) {
    const category = await prisma.category.findUnique({
      where: { slug: catSlug },
    });

    if (!category) {
      console.warn(
        `[seed] Category "${catSlug}" not found — skipping its subcategories.`
      );
      continue;
    }

    const subcategories = SUBCATEGORIES_BY_CATEGORY[catSlug]!;
    let count = 0;

    for (const sub of subcategories) {
      const slug = slugify(sub.name);
      await prisma.subcategory.upsert({
        where: { slug },
        update: {
          name: sub.name,
          description: sub.description,
          categoryId: category.id,
        },
        create: {
          slug,
          name: sub.name,
          description: sub.description,
          categoryId: category.id,
        },
      });
      count++;
    }

    console.log(`[seed] Seeded ${count} subcategories for ${catSlug}`);
    totalSeeded += count;
  }

  console.log(`All ${totalSeeded} subcategories seeded successfully.`);
}

// ── Run Directly (only executes when this file is the entry point) ──
const isMainModule = process.argv[1]?.includes("seed-subcategories");
if (isMainModule) {
  seedSubcategories()
    .catch((e) => {
      console.error("Seed subcategories failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
