/**
 * Shared seed data definitions used by both the main seed script and test fixtures.
 * Uses slug/email references instead of DB IDs so the same definitions work
 * with upsert (seed.ts) and create (test-db.ts).
 */

export interface SeedUser {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  language: string;
  country: string;
  currency: string;
  theme: string;
}

export const SEED_USERS: SeedUser[] = [
  { clerkId: "clerk_admin_001", email: "admin@alaya.test", name: "Admin User", role: "ADMIN", language: "en", country: "US", currency: "USD", theme: "dark" },
  { clerkId: "clerk_editor_001", email: "editor@alaya.test", name: "Editor User", role: "EDITOR", language: "en", country: "US", currency: "USD", theme: "dark" },
  { clerkId: "clerk_user_001", email: "user@alaya.test", name: "Regular User", role: "USER", language: "en", country: "US", currency: "USD", theme: "light" },
];

export interface SeedCategory {
  slug: string;
  name: string;
  description: string;
  accentColor: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: "electronics", name: "Electronics", description: "Electronic devices and accessories", accentColor: "#0070F3" },
  { slug: "home-garden", name: "Home and Garden", description: "Home improvement and garden supplies", accentColor: "#00A86B" },
];

export interface SeedSubcategory {
  slug: string;
  name: string;
  categorySlug: string;
}

export const SEED_SUBCATEGORIES: SeedSubcategory[] = [
  { slug: "headphones", name: "Headphones", categorySlug: "electronics" },
  { slug: "laptops", name: "Laptops", categorySlug: "electronics" },
  { slug: "gardening-tools", name: "Gardening Tools", categorySlug: "home-garden" },
  { slug: "outdoor-furniture", name: "Outdoor Furniture", categorySlug: "home-garden" },
];

export const SEED_BRANDS: string[] = ["SoundWave", "GreenThumb"];

export const SEED_TAG_NAMES: string[] = [
  "wireless", "bluetooth", "noise-cancelling", "eco-friendly", "bamboo", "organic",
];

export interface SeedRetailer {
  name: string;
  website: string;
  trustScore: number;
}

export const SEED_RETAILERS: SeedRetailer[] = [
  { name: "TechWorld", website: "https://techworld.example.com", trustScore: 4.5 },
  { name: "GardenSupply", website: "https://gardensupply.example.com", trustScore: 4.2 },
];

export interface SeedAffiliateNetwork {
  name: string;
  identifier: string;
  config: Record<string, string>;
}

export const SEED_AFFILIATE_NETWORK: SeedAffiliateNetwork = {
  name: "Partnerize",
  identifier: "partnerize",
  config: { apiKey: "test_key" },
};

export interface SeedProduct {
  slug: string;
  title: string;
  brand: string;
  description: string;
  basePrice: number;
  currency: string;
  categorySlug: string;
  isActive: boolean;
  imageUrls: string[];
  tagNames: string[];
}

export const SEED_PRODUCTS: SeedProduct[] = [
  { slug: "soundwave-pro-headphones", title: "SoundWave Pro Headphones", brand: "SoundWave", description: "Premium wireless headphones with ANC.", basePrice: 299.99, currency: "USD", categorySlug: "electronics", isActive: true, imageUrls: [], tagNames: ["wireless", "bluetooth", "noise-cancelling"] },
  { slug: "soundwave-buds", title: "SoundWave Buds Pro", brand: "SoundWave", description: "Compact wireless earbuds.", basePrice: 179.99, currency: "USD", categorySlug: "electronics", isActive: true, imageUrls: [], tagNames: ["wireless", "bluetooth"] },
  { slug: "greenthumb-planter", title: "GreenThumb Bamboo Planter", brand: "GreenThumb", description: "Sustainable bamboo planter.", basePrice: 49.99, currency: "USD", categorySlug: "home-garden", isActive: true, imageUrls: [], tagNames: ["eco-friendly", "bamboo"] },
  { slug: "greenthumb-trowel", title: "GreenThumb Ergonomic Trowel", brand: "GreenThumb", description: "Ergonomic garden trowel.", basePrice: 19.99, currency: "USD", categorySlug: "home-garden", isActive: true, imageUrls: [], tagNames: ["eco-friendly"] },
];

export interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  type: string;
  status: string;
  categorySlug: string;
  authorEmail: string;
}

export const SEED_POSTS: SeedPost[] = [
  { slug: "top-headphones-2025", title: "Top Headphones of 2025", excerpt: "Best headphones guide.", content: "Full article.", type: "ARTICLE", status: "PUBLISHED", categorySlug: "electronics", authorEmail: "editor@alaya.test" },
  { slug: "sustainable-gardening", title: "Sustainable Gardening Tips", excerpt: "Eco-friendly practices.", content: "Full article.", type: "GUIDE", status: "PUBLISHED", categorySlug: "home-garden", authorEmail: "editor@alaya.test" },
];

export interface SeedReview {
  id: string;
  productSlug: string;
  userEmail: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
}

export const SEED_REVIEWS: SeedReview[] = [
  { id: "review_hp_001", productSlug: "soundwave-pro-headphones", userEmail: "user@alaya.test", rating: 5, title: "Best headphones", body: "Amazing sound quality.", isVerifiedPurchase: true },
  { id: "review_bp_001", productSlug: "greenthumb-planter", userEmail: "user@alaya.test", rating: 4, title: "Great planter", body: "Love the design.", isVerifiedPurchase: true },
];
