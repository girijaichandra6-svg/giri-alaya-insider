export const siteConfig = {
  name: "ALAYA INSIDER",
  tagline: "Curated Insight for the Affluent Shopper",
  description: "Premium global affiliate media platform for luxury shopping.",
  url: "https://alayainsider.com",
  ogImage: "/images/og-default.jpg",
  links: {
    twitter: "https://twitter.com/alayainsider",
    instagram: "https://instagram.com/alayainsider",
    pinterest: "https://pinterest.com/alayainsider",
    youtube: "https://youtube.com/@alayainsider",
  },
  locale: "en_US",
} as const;

export type SiteConfig = typeof siteConfig;
