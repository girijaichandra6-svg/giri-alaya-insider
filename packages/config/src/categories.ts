export interface CategoryConfig {
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  editorialVoice: string;
  heroStyle: string;
  imageUrl?: string;
}

export const categories: Record<string, CategoryConfig> = {
  electronics: {
    slug: "electronics",
    name: "Electronics",
    description: "Ultra-technical, precise, lab-grade product reviews",
    accentColor: "#00E5FF",
    editorialVoice: "Ultra-technical, precise, lab-grade",
    heroStyle: "Close-up product shots on dark matte surfaces",
  },
  fashion: {
    slug: "fashion",
    name: "Fashion",
    description: "Poetic, avant-garde, texture-rich fashion curation",
    accentColor: "#FFB6C1",
    editorialVoice: "Poetic, avant-garde, texture-rich",
    heroStyle: "Editorial-like model shots, fabric details",
  },
  beauty: {
    slug: "beauty",
    name: "Beauty",
    description: "Scientific yet sensual, ingredient-led beauty discoveries",
    accentColor: "#FFA07A",
    editorialVoice: "Scientific yet sensual, ingredient-led",
    heroStyle: "Macro textures, light reflections",
  },
  "home-living": {
    slug: "home-living",
    name: "Home & Living",
    description: "Warm, tactile, architectural home curation",
    accentColor: "#B8860B",
    editorialVoice: "Warm, tactile, architectural",
    heroStyle: "Interiors with soft shadows, furniture in situ",
  },
  travel: {
    slug: "travel",
    name: "Travel",
    description: "Evocative, wanderlust, immersive travel experiences",
    accentColor: "#87CEEB",
    editorialVoice: "Evocative, wanderlust, immersive",
    heroStyle: "Cinematic landscapes, destination details",
  },
  "health-wellness": {
    slug: "health-wellness",
    name: "Health & Wellness",
    description: "Calm, clinical yet holistic health insights",
    accentColor: "#98FB98",
    editorialVoice: "Calm, clinical yet holistic",
    heroStyle: "Clean product shots, natural light",
  },
  "food-nutrition": {
    slug: "food-nutrition",
    name: "Food & Nutrition",
    description: "Rich, appetising, rustic food and nutrition guides",
    accentColor: "#FFD700",
    editorialVoice: "Rich, appetising, rustic",
    heroStyle: "Ingredient flatlays, cooking stills",
  },
};

export type CategorySlug = keyof typeof categories;
