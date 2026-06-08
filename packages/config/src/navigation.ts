export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  { label: "Electronics", href: "/electronics" },
  { label: "Fashion", href: "/fashion" },
  { label: "Beauty", href: "/beauty" },
  { label: "Home & Living", href: "/home-living" },
  { label: "Travel", href: "/travel" },
  { label: "Health & Wellness", href: "/health-wellness" },
  { label: "Food & Nutrition", href: "/food-nutrition" },
  { label: "Deals", href: "/deals" },
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
];

export const footerNavigation = {
  shopping: {
    title: "Shop",
    items: [
      { label: "All Categories", href: "/categories" },
      { label: "Deals", href: "/deals" },
      { label: "Gift Guides", href: "/collections/gift-guides" },
      { label: "New Arrivals", href: "/new" },
      { label: "Trending", href: "/trending" },
    ],
  },
  resources: {
    title: "Resources",
    items: [
      { label: "Buying Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/community" },
      { label: "Newsletter", href: "/newsletter" },
      { label: "About Us", href: "/about" },
    ],
  },
  support: {
    title: "Support",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Affiliate Disclosure", href: "/disclosure" },
    ],
  },
} as const;
