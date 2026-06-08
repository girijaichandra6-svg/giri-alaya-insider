/**
 * Shared seed utility constants and helpers.
 * Used by both prisma/seed.ts and src/__tests__/test-db.ts.
 */

// All Prisma model table names for truncation.
// Listed in child-first order so CASCADE handles FK dependencies.
export const ALL_TABLES = [
  "ProductTag", "PostTag", "CollectionProduct", "WishlistItem",
  "SavedProduct", "Click", "Conversion", "Comment", "QA", "Review",
  "Deal", "Coupon", "PriceSnapshot", "LocalizedLink", "AffiliateLink",
  "ProductScore", "Embedding", "ProductRelation", "TrendingProduct",
  "Follow", "Referral", "UserAchievement", "LoyaltyPoint", "PushToken",
  "EmailSubscription", "Session", "Notification", "RecentlyViewed",
  "SearchHistory", "AuditLog", "ABTestUser", "PriceAlert", "Wishlist",
  "Collection", "Product", "Subcategory", "Post", "Tag", "Brand",
  "Retailer", "AffiliateNetwork", "Category", "User", "Badge",
  "ABTest", "FeatureFlag", "Translation", "CountrySetting", "CurrencyRate",
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ALAYA categories with brand metadata
export const ALAYA_CATEGORIES = [
  { slug: "fashion", name: "Fashion", description: "Curated fashion and style essentials for the discerning wardrobe", accentColor: "#FFB6C1" },
  { slug: "beauty", name: "Beauty", description: "Premium skincare, makeup, and fragrance discoveries", accentColor: "#FFA07A" },
  { slug: "home-living", name: "Home & Living", description: "Warm, tactile, architectural home curation", accentColor: "#B8860B" },
  { slug: "travel", name: "Travel", description: "Evocative wanderlust and travel essentials", accentColor: "#87CEEB" },
  { slug: "health-wellness", name: "Health & Wellness", description: "Holistic health and mindful living products", accentColor: "#98FB98" },
  { slug: "food-nutrition", name: "Food & Nutrition", description: "Premium culinary ingredients and nutrition essentials", accentColor: "#FFD700" },
];

export const ALAYA_BRANDS: Record<string, string[]> = {
  fashion: ["Maison Élégance", "Vanguard Atelier", "Sartorial House", "Luminara", "Noir & Co"],
  beauty: ["Glow Science", "Pure Botanics", "Lumière Cosmetics", "Essence Lab", "Velvet Skin Co"],
  "home-living": ["Artisan Living", "Modern Rustic", "Haven Home", "Architectural Edit", "Cozy & Co"],
  travel: ["Wanderlust Gear", "Nomad Supply Co", "JetSet Pro", "Explorer's Trunk", "Global Companion"],
  "health-wellness": ["Vitality Labs", "Zen Essentials", "Pure Life", "Harmonix", "Wellness Hub"],
  "food-nutrition": ["Artisan Pantry", "Flavor Farm", "Pure Harvest", "Gourmet Finds", "NutriCraft"],
};

export interface DemoProductTemplate {
  name: string;
  description: string;
  brand: string;
  basePrice: number;
  tags: string[];
}

// Generate 10 products per subcategory (20 subcategories per category × 6 = 120 subcategories × 10 = 1200 products)
// We'll pick 3 per subcategory for ~360 products
export const DEMO_PRODUCTS_BY_SUBCATEGORY: Record<string, DemoProductTemplate[]> = {
  // ---- FASHION ----
  "elevated-essentials": [
    { name: "Signature Oxford Shirt", description: "Crisp, tailored cotton oxford with mother-of-pearl buttons. The cornerstone of a refined wardrobe.", brand: "Sartorial House", basePrice: 245, tags: ["cotton", "tailored", "classic"] },
    { name: "The Essential Crewneck", description: "Heavyweight Japanese jersey cotton crewneck with ribbed cuffs and hem.", brand: "Maison Élégance", basePrice: 185, tags: ["cotton", "casual", "japanese-denim"] },
    { name: "Linen Relaxed Tee", description: "Premium French linen tee with a lived-in softness. Perfect for effortless layering.", brand: "Vanguard Atelier", basePrice: 145, tags: ["linen", "summer", "minimal"] },
  ],
  "signature-silhouettes": [
    { name: "The Column Dress", description: "Sculptural midi dress cut from heavyweight crepe. A study in architectural elegance.", brand: "Luminara", basePrice: 690, tags: ["dress", "evening", "crepe"] },
    { name: "Asymmetric Silk Slip", description: "Liquid silk charmeuse slip dress with an asymmetric hemline.", brand: "Noir & Co", basePrice: 520, tags: ["silk", "evening", "luxury"] },
    { name: "Wrap Maxi Dress", description: "Flowing viscose maxi with a flattering wrap silhouette and subtle side slit.", brand: "Maison Élégance", basePrice: 380, tags: ["dress", "viscose", "maxi"] },
  ],
  "tailored-staples": [
    { name: "Wool Trousers", description: "Italian wool-blend trousers with a precise cut and subtle front pleats.", brand: "Sartorial House", basePrice: 450, tags: ["wool", "tailored", "formal"] },
    { name: "High-Rise Wide Leg", description: "Crepe wide-leg trousers with a high-rise waist and fluid drape.", brand: "Vanguard Atelier", basePrice: 340, tags: ["crepe", "wide-leg", "workwear"] },
    { name: "Cropped Cigarette Pant", description: "Cropped stretch-cotton trousers with a clean, tapered line.", brand: "Maison Élégance", basePrice: 290, tags: ["cotton", "cropped", "tailored"] },
  ],
  "everyday-icons": [
    { name: "Relaxed Blazer", description: "Unstructured linen-blend blazer with a soft, forgiving silhouette.", brand: "Sartorial House", basePrice: 495, tags: ["linen", "blazer", "casual-chic"] },
    { name: "Denim Jacket", description: "Classic trucker jacket in premium Japanese selvedge denim.", brand: "Vanguard Atelier", basePrice: 325, tags: ["denim", "jacket", "casual"] },
    { name: "Utility Shirt", description: "Oversized cotton poplin shirt with utility pockets and a relaxed collar.", brand: "Maison Élégance", basePrice: 220, tags: ["cotton", "utility", "oversized"] },
  ],
  "the-denim-edit": [
    { name: "Straight-Leg Jeans", description: "Raw selvedge denim straight-leg jeans. Unwashed, unsanforized, perfectly rigid.", brand: "Vanguard Atelier", basePrice: 295, tags: ["denim", "selvedge", "raw"] },
    { name: "Wide-Leg Crop Jeans", description: "Cropped wide-leg jeans in mid-wash stretch denim.", brand: "Maison Élégance", basePrice: 260, tags: ["denim", "wide-leg", "cropped"] },
    { name: "Slim Bootcut Jeans", description: "Modern slim bootcut in dark rinse stretch denim with a subtle flare.", brand: "Noir & Co", basePrice: 275, tags: ["denim", "bootcut", "stretch"] },
  ],
  "soft-tailoring": [
    { name: "Unstructured Wool Blazer", description: "Soft-shouldered blazer in lightweight Italian wool with patch pockets.", brand: "Sartorial House", basePrice: 650, tags: ["wool", "blazer", "soft-shoulder"] },
    { name: "Linen Double-Breasted", description: "Double-breasted linen blazer with a relaxed fit and natural texture.", brand: "Vanguard Atelier", basePrice: 580, tags: ["linen", "double-breasted", "summer"] },
    { name: "Tweed Blazer", description: "Classic herringbone tweed blazer with suede elbow patches.", brand: "Maison Élégance", basePrice: 720, tags: ["tweed", "herringbone", "classic"] },
  ],
  "modern-classics": [
    { name: "Cashmere Turtleneck", description: "Pure Mongolian cashmere turtleneck with a relaxed ribbed finish.", brand: "Maison Élégance", basePrice: 395, tags: ["cashmere", "turtleneck", "winter"] },
    { name: "Merino Rollneck", description: "Extra-fine Australian merino wool rollneck in a lightweight gauge.", brand: "Sartorial House", basePrice: 250, tags: ["merino", "rollneck", "layering"] },
    { name: "Silk Blouse", description: "Crepe de chine silk blouse with a timeless self-tie neck.", brand: "Luminara", basePrice: 380, tags: ["silk", "blouse", "classic"] },
  ],
  "quiet-luxury": [
    { name: "Vicuna Coat", description: "Rare vicuna wool overcoat with silk lining and horn buttons.", brand: "Sartorial House", basePrice: 4800, tags: ["vicuna", "coat", "ultra-luxury"] },
    { name: "Cashmere Wrap", description: "Oversized cashmere wrap blanket with hand-fringed edges.", brand: "Maison Élégance", basePrice: 890, tags: ["cashmere", "wrap", "loungewear"] },
    { name: "Silk Pyjama Set", description: "Two-piece silk satin pyjama set with piped trim.", brand: "Luminara", basePrice: 620, tags: ["silk", "pyjamas", "luxury"] },
  ],
  "weekend-uniform": [
    { name: "French Terry Hoodie", description: "Heavyweight organic French terry hoodie with dropped shoulders.", brand: "Vanguard Atelier", basePrice: 195, tags: ["french-terry", "hoodie", "organic"] },
    { name: "Jogger Sweatpants", description: "Brushe-back loop terry joggers with elastic cuffs and drawstring waist.", brand: "Maison Élégance", basePrice: 165, tags: ["terry", "joggers", "loungewear"] },
    { name: "Cotton Slub Tee", description: "Slub-knit organic cotton t-shirt with a lived-in softness.", brand: "Noir & Co", basePrice: 85, tags: ["cotton", "slub", "organic"] },
  ],
  "resort-escape": [
    { name: "Linen Shirt", description: "Relaxed-fit linen camp shirt with a resort collar.", brand: "Vanguard Atelier", basePrice: 195, tags: ["linen", "camp-shirt", "resort"] },
    { name: "Cotton Shorts", description: "Tailored cotton twill shorts with an elasticated waist.", brand: "Maison Élégance", basePrice: 145, tags: ["cotton", "shorts", "summer"] },
    { name: "Kaftan Cover-Up", description: "Sheer embroidered kaftan in lightweight viscose.", brand: "Luminara", basePrice: 280, tags: ["kaftan", "cover-up", "beach"] },
  ],
  "layering-luxe": [
    { name: "Trench Coat", description: "Classic double-breasted trench coat in water-resistant cotton gabardine.", brand: "Sartorial House", basePrice: 980, tags: ["trench", "cotton", "classic"] },
    { name: "Leather Biker Jacket", description: "Lambskin leather biker jacket with asymmetric zip and quilted shoulders.", brand: "Noir & Co", basePrice: 1500, tags: ["leather", "biker", "lambskin"] },
    { name: "Puffer Vest", description: "Ripstop nylon puffer vest with recycled down fill.", brand: "Vanguard Atelier", basePrice: 320, tags: ["puffer", "nylon", "down"] },
  ],
  "seasonal-statements": [
    { name: "Printed Midi Dress", description: "Statement floral-print midi dress in flowing viscose crepe.", brand: "Luminara", basePrice: 420, tags: ["floral", "dress", "print"] },
    { name: "Embellished Top", description: "Silk top with hand-beaded embellishment at the neckline.", brand: "Maison Élégance", basePrice: 580, tags: ["silk", "beaded", "evening"] },
    { name: "Plaid Blazer", description: "Bold plaid wool blazer with peak lapels.", brand: "Sartorial House", basePrice: 680, tags: ["plaid", "wool", "statement"] },
  ],
  "after-dark-dressing": [
    { name: "Sequinned Mini Dress", description: "fully sequinned mini dress with a concealed back zip.", brand: "Luminara", basePrice: 780, tags: ["sequin", "mini", "party"] },
    { name: "Velvet Tuxedo", description: "Black velvet tuxedo jacket with satin lapels.", brand: "Sartorial House", basePrice: 1200, tags: ["velvet", "tuxedo", "formal"] },
    { name: "Slip Midi Dress", description: "Cow-print slip midi in silk charmeuse with delicate spaghetti straps.", brand: "Noir & Co", basePrice: 450, tags: ["silk", "slip", "evening"] },
  ],
  "the-knit-studio": [
    { name: "Cable Knit Sweater", description: "Chunky cable-knit sweater in pure lambswool.", brand: "Maison Élégance", basePrice: 295, tags: ["cable-knit", "lambswool", "winter"] },
    { name: "Fine Gauge Cardigan", description: "Lightweight merino cardigan with shell buttons and ribbed trim.", brand: "Sartorial House", basePrice: 265, tags: ["merino", "cardigan", "layering"] },
    { name: "Chunky Mohair Jumper", description: "Fluffy kid mohair and wool blend jumper with a balloon sleeve.", brand: "Vanguard Atelier", basePrice: 350, tags: ["mohair", "chunky", "textured"] },
  ],
  "contemporary-fits": [
    { name: "Slim Fit Chinos", description: "Stretch cotton chinos with a modern slim fit and zip fly.", brand: "Maison Élégance", basePrice: 195, tags: ["cotton", "chinos", "slim"] },
    { name: "Drop Shoulder Tee", description: "Oversized drop-shoulder tee in heavyweight organic cotton.", brand: "Vanguard Atelier", basePrice: 95, tags: ["cotton", "drop-shoulder", "oversized"] },
    { name: "Cargo Pants", description: "Contemporary cotton ripstop cargo pants with a tapered leg.", brand: "Noir & Co", basePrice: 220, tags: ["cargo", "cotton", "tapered"] },
  ],
  "street-society": [
    { name: "Graphic Hoodie", description: "Oversized hoodie with abstract screen-printed graphic on heavyweight cotton.", brand: "Vanguard Atelier", basePrice: 220, tags: ["graphic", "hoodie", "streetwear"] },
    { name: "Track Pants", description: "Nylon track pants with contrast stripe detail and elastic cuffs.", brand: "Noir & Co", basePrice: 180, tags: ["nylon", "track", "striped"] },
    { name: "Bomber Jacket", description: "Satin bomber jacket with embroidered back motif.", brand: "Vanguard Atelier", basePrice: 450, tags: ["satin", "bomber", "embroidered"] },
  ],
  "city-dressing": [
    { name: "Smart Trench", description: "Lightweight urban trench coat in technical cotton twill.", brand: "Sartorial House", basePrice: 720, tags: ["trench", "technical", "urban"] },
    { name: "Tailored Midi Skirt", description: "Pencil midi skirt in stretch wool crepe with back vent.", brand: "Maison Élégance", basePrice: 280, tags: ["crepe", "pencil", "workwear"] },
    { name: "Silk Shirt", description: "Pure silk crepe de chine shirt with hidden button placket.", brand: "Luminara", basePrice: 350, tags: ["silk", "shirt", "luxury"] },
  ],
  "finishing-touches": [
    { name: "Gold Hoop Earrings", description: "18ct gold vermeil hoops with a brushed matte finish.", brand: "Maison Élégance", basePrice: 180, tags: ["gold", "earrings", "vermeil"] },
    { name: "Leather Belt", description: "Italian calfskin leather belt with a brushed buckle.", brand: "Sartorial House", basePrice: 195, tags: ["leather", "belt", "calfskin"] },
    { name: "Silk Scarf", description: "Hand-rolled silk scarf with a custom abstract print.", brand: "Luminara", basePrice: 160, tags: ["silk", "scarf", "print"] },
  ],
  "carryall-culture": [
    { name: "Tote Bag", description: "Grained leather tote with a spacious interior and detachable pouch.", brand: "Noir & Co", basePrice: 980, tags: ["leather", "tote", "everyday"] },
    { name: "Crossbody Bag", description: "Compact crossbody bag in pebbled leather with adjustable strap.", brand: "Maison Élégance", basePrice: 650, tags: ["leather", "crossbody", "compact"] },
    { name: "Weekender Duffle", description: "Waxed canvas duffle with leather trim and brass hardware.", brand: "Sartorial House", basePrice: 520, tags: ["canvas", "duffle", "travel"] },
  ],
  "sole-stories": [
    { name: "Leather Loafers", description: "Italian burnished leather loafers with a horsebit detail.", brand: "Sartorial House", basePrice: 450, tags: ["leather", "loafers", "formal"] },
    { name: "White Trainers", description: "Minimalist white leather trainers with a gum sole.", brand: "Maison Élégance", basePrice: 320, tags: ["leather", "trainers", "minimal"] },
    { name: "Chelsea Boots", description: "Suede Chelsea boots with elastic side panels and pull tab.", brand: "Noir & Co", basePrice: 490, tags: ["suede", "boots", "chelsea"] },
  ],

  // ---- BEAUTY ----
  "glow-rituals": [
    { name: "Vitamin C Serum", description: "Stabilized 15% vitamin C serum with ferulic acid and vitamin E.", brand: "Glow Science", basePrice: 68, tags: ["vitamin-c", "brightening", "antioxidant"] },
    { name: "Gentle Cleansing Balm", description: "Oil-based cleansing balm that melts away makeup and impurities.", brand: "Pure Botanics", basePrice: 42, tags: ["cleanser", "balm", "gentle"] },
    { name: "Hyaluronic Acid Toner", description: "Hydrating toner with triple-weight hyaluronic acid and rose water.", brand: "Glow Science", basePrice: 36, tags: ["toner", "hyaluronic", "hydrating"] },
  ],
  "skin-science": [
    { name: "Retinol Night Treatment", description: "Encapsulated 0.3% retinol with peptides and ceramides.", brand: "Glow Science", basePrice: 88, tags: ["retinol", "night", "anti-aging"] },
    { name: "Niacinamide 10% Serum", description: "High-potency niacinamide serum with zinc and licorice root.", brand: "Essence Lab", basePrice: 48, tags: ["niacinamide", "serum", "brightening"] },
    { name: "Peptide Eye Cream", description: "Multi-peptide eye cream with caffeine and cold-pressed oils.", brand: "Pure Botanics", basePrice: 62, tags: ["peptide", "eye", "firming"] },
  ],
  "complexion-lab": [
    { name: "Luminous Foundation", description: "Buildable coverage foundation with a radiant, skin-like finish.", brand: "Lumière Cosmetics", basePrice: 54, tags: ["foundation", "luminous", "buildable"] },
    { name: "Concealer Wand", description: "Full-coverage concealer with a precision applicator and hydrating formula.", brand: "Velvet Skin Co", basePrice: 32, tags: ["concealer", "full-coverage", "hydrating"] },
    { name: "Setting Powder", description: "Micro-fine translucent setting powder with a silky texture.", brand: "Lumière Cosmetics", basePrice: 40, tags: ["powder", "translucent", "setting"] },
  ],
  "fresh-face-edit": [
    { name: "Tinted Moisturizer", description: "Lightweight tinted moisturizer with SPF 30 and a dewy finish.", brand: "Pure Botanics", basePrice: 46, tags: ["tinted", "moisturizer", "spf"] },
    { name: "Cream Blush", description: "Sheer cream blush in a universal peachy-pink shade.", brand: "Velvet Skin Co", basePrice: 28, tags: ["blush", "cream", "sheer"] },
    { name: "Brow Gel", description: "Clear brow gel with a flexible hold and conditioning formula.", brand: "Essence Lab", basePrice: 24, tags: ["brow", "gel", "clear"] },
  ],
  "beauty-atelier": [
    { name: "Gold Face Oil", description: "24k gold-infused face oil with rosehip and argan oils.", brand: "Pure Botanics", basePrice: 120, tags: ["gold", "face-oil", "luxury"] },
    { name: "Caviar Eye Cream", description: "Caviar extract eye cream with firming peptides and shea butter.", brand: "Essence Lab", basePrice: 180, tags: ["caviar", "eye-cream", "ultra-luxury"] },
    { name: "Diamond Dust Highlighter", description: "Micro-fine diamond dust highlighter with a wet-look finish.", brand: "Lumière Cosmetics", basePrice: 65, tags: ["highlighter", "diamond", "luminous"] },
  ],
  "hydration-heroes": [
    { name: "Moisture Surge Mask", description: "Overnight hydration mask with squalane and glycerin.", brand: "Glow Science", basePrice: 56, tags: ["mask", "hydration", "overnight"] },
    { name: "Water Cream Moisturizer", description: "Oil-free water cream with hyaluronic acid and green tea.", brand: "Pure Botanics", basePrice: 44, tags: ["moisturizer", "water-cream", "oil-free"] },
    { name: "Hydrating Mist", description: "Facial mist with rose water, aloe, and glycerin.", brand: "Essence Lab", basePrice: 28, tags: ["mist", "facial", "refreshing"] },
  ],
  "clean-beauty-collective": [
    { name: "Organic Face Serum", description: "Certified organic face serum with cold-pressed botanicals.", brand: "Pure Botanics", basePrice: 72, tags: ["organic", "serum", "clean"] },
    { name: "Natural Lip Balm", description: "Beeswax and shea butter lip balm in compostable packaging.", brand: "Pure Botanics", basePrice: 14, tags: ["lip-balm", "natural", "beeswax"] },
    { name: "Bamboo Cotton Pads", description: "Reusable bamboo cotton face pads in organic muslin bag.", brand: "Pure Botanics", basePrice: 18, tags: ["bamboo", "cotton", "reusable"] },
  ],
  "timeless-radiance": [
    { name: "Anti-Aging Night Cream", description: "Rich night cream with bakuchiol, peptides, and shea butter.", brand: "Glow Science", basePrice: 85, tags: ["anti-aging", "night-cream", "bakuchiol"] },
    { name: "Collagen Boosting Serum", description: "Marine collagen peptide serum with vitamin C.", brand: "Essence Lab", basePrice: 78, tags: ["collagen", "serum", "firming"] },
    { name: "Eye Contour Cream", description: "Anti-aging eye contour cream with matrixyl and caffeine.", brand: "Glow Science", basePrice: 58, tags: ["eye", "anti-aging", "matrixyl"] },
  ],
  "luxe-self-care": [
    { name: "Aromatherapy Candle", description: "Soy wax candle with lavender and sandalwood essential oils.", brand: "Pure Botanics", basePrice: 48, tags: ["candle", "aromatherapy", "soy-wax"] },
    { name: "Bath Oil Set", description: "Set of three pure essential oil bath treatments.", brand: "Essence Lab", basePrice: 62, tags: ["bath", "oil", "essential-oils"] },
    { name: "Silk Sleep Mask", description: "Mulberry silk sleep mask with adjustable strap.", brand: "Velvet Skin Co", basePrice: 38, tags: ["silk", "sleep-mask", "mulberry"] },
  ],
  "hair-revival": [
    { name: "Protein Hair Mask", description: "Deep conditioning hair mask with keratin and argan oil.", brand: "Pure Botanics", basePrice: 36, tags: ["hair-mask", "protein", "keratin"] },
    { name: "Sulfate-Free Shampoo", description: "Gentle sulfate-free shampoo with biotin and coconut oil.", brand: "Pure Botanics", basePrice: 28, tags: ["shampoo", "sulfate-free", "biotin"] },
    { name: "Leave-In Conditioner", description: "Lightweight leave-in conditioner with silk proteins.", brand: "Essence Lab", basePrice: 32, tags: ["conditioner", "leave-in", "silk-proteins"] },
  ],
  "scalp-society": [
    { name: "Scalp Scrub", description: "Exfoliating scalp scrub with salicylic acid and tea tree oil.", brand: "Essence Lab", basePrice: 34, tags: ["scalp", "scrub", "salicylic"] },
    { name: "Hair Growth Serum", description: "Peptide-rich hair growth serum with rosemary and biotin.", brand: "Glow Science", basePrice: 58, tags: ["hair-growth", "serum", "peptide"] },
    { name: "Scalp Massager", description: "Silicone scalp massager for stimulating circulation.", brand: "Velvet Skin Co", basePrice: 16, tags: ["scalp", "massager", "silicone"] },
  ],
  "color-studio": [
    { name: "Matte Lipstick", description: "Long-wearing matte lipstick in a universal red shade.", brand: "Lumière Cosmetics", basePrice: 32, tags: ["lipstick", "matte", "red"] },
    { name: "Eyeshadow Palette", description: "12-shade neutral eyeshadow palette with mattes and shimmers.", brand: "Lumière Cosmetics", basePrice: 56, tags: ["eyeshadow", "palette", "neutral"] },
    { name: "Gel Eyeliner", description: "Waterproof gel eyeliner pot with an ultra-black pigment.", brand: "Velvet Skin Co", basePrice: 24, tags: ["eyeliner", "gel", "waterproof"] },
  ],
  "signature-scents": [
    { name: "Eau de Parfum", description: "A sophisticated blend of bergamot, jasmine, and sandalwood.", brand: "Essence Lab", basePrice: 128, tags: ["perfume", "floral", "woody"] },
    { name: "Rollerball Perfume Oil", description: "Concentrated perfume oil in a portable rollerball format.", brand: "Pure Botanics", basePrice: 38, tags: ["perfume-oil", "rollerball", "concentrated"] },
    { name: "Home Fragrance Diffuser", description: "Reed diffuser with a signature white tea and bamboo scent.", brand: "Essence Lab", basePrice: 56, tags: ["diffuser", "home-fragrance", "reed"] },
  ],
  "beauty-tools-studio": [
    { name: "Jade Roller", description: "Natural jade facial roller for lymphatic drainage.", brand: "Glow Science", basePrice: 32, tags: ["jade", "roller", "facial"] },
    { name: "LED Face Mask", description: "LED light therapy mask with red and blue light modes.", brand: "Glow Science", basePrice: 280, tags: ["led", "light-therapy", "mask"] },
    { name: "Microcurrent Device", description: "Professional microcurrent facial toning device.", brand: "Essence Lab", basePrice: 350, tags: ["microcurrent", "toning", "facial"] },
  ],
  "the-nail-bar": [
    { name: "Strengthening Base Coat", description: "Nail-strengthening base coat with keratin and calcium.", brand: "Lumière Cosmetics", basePrice: 18, tags: ["base-coat", "strengthening", "keratin"] },
    { name: "Gel Effect Polish", description: "High-shine gel effect nail polish in a neutral shade.", brand: "Lumière Cosmetics", basePrice: 16, tags: ["nail-polish", "gel", "shade"] },
    { name: "Cuticle Oil Pen", description: "Precision cuticle oil pen with jojoba and vitamin E.", brand: "Essence Lab", basePrice: 14, tags: ["cuticle", "oil", "jojoba"] },
  ],
  "daily-glam": [
    { name: "BB Cream", description: "Multi-benefit BB cream with SPF 35 and light coverage.", brand: "Pure Botanics", basePrice: 38, tags: ["bb-cream", "spf", "daily"] },
    { name: "Mascara", description: "Volumizing mascara with a curved wand and conditioning formula.", brand: "Lumière Cosmetics", basePrice: 28, tags: ["mascara", "volumizing", "curved-wand"] },
    { name: "Lip Gloss", description: "High-shine lip gloss with hyaluronic acid for a plumping effect.", brand: "Velvet Skin Co", basePrice: 22, tags: ["lip-gloss", "plumping", "hyaluronic"] },
  ],
  "beauty-essentials": [
    { name: "Makeup Sponge Set", description: "Set of 3 non-latex makeup sponges with varying shapes.", brand: "Velvet Skin Co", basePrice: 18, tags: ["sponge", "makeup", "non-latex"] },
    { name: "Brush Cleaning Spray", description: "Quick-drying brush cleaning spray with antibacterial agents.", brand: "Lumière Cosmetics", basePrice: 14, tags: ["brush-cleaner", "spray", "antibacterial"] },
    { name: "Cotton Rounds", description: "Organic cotton rounds in a recyclable dispenser.", brand: "Pure Botanics", basePrice: 8, tags: ["cotton", "rounds", "organic"] },
  ],
  "the-glow-guide": [
    { name: "AHA Glow Mask", description: "Glycolic acid 10% resurfacing mask with aloe vera.", brand: "Glow Science", basePrice: 45, tags: ["aha", "glycolic", "mask"] },
    { name: "Brightening Eye Patches", description: "Hydrogel eye patches with vitamin C and caffeine.", brand: "Glow Science", basePrice: 32, tags: ["eye-patches", "brightening", "hydrogel"] },
    { name: "Exfoliating Toner", description: "PHA and lactic acid toner for gentle daily exfoliation.", brand: "Essence Lab", basePrice: 38, tags: ["toner", "exfoliating", "pha"] },
  ],
  "radiance-reset": [
    { name: "Recovery Sleeping Mask", description: "Overnight recovery mask with ceramides and panthenol.", brand: "Glow Science", basePrice: 52, tags: ["sleeping-mask", "recovery", "ceramide"] },
    { name: "Barrier Repair Cream", description: "Intensive barrier repair cream with niacinamide and shea.", brand: "Pure Botanics", basePrice: 48, tags: ["barrier", "repair", "niacinamide"] },
    { name: "Soothing Face Mist", description: "Calming face mist with centella asiatica and panthenol.", brand: "Essence Lab", basePrice: 26, tags: ["mist", "soothing", "centella"] },
  ],
  "age-defying-favorites": [
    { name: "SPF 50 Day Cream", description: "Anti-aging day cream with broad-spectrum SPF 50 and Q10.", brand: "Glow Science", basePrice: 65, tags: ["spf", "day-cream", "q10"] },
    { name: "Firming Neck Cream", description: "Lifting neck and décolletage cream with peptides.", brand: "Essence Lab", basePrice: 72, tags: ["neck", "firming", "peptide"] },
    { name: "Replenishing Body Lotion", description: "Anti-aging body lotion with retinol and shea butter.", brand: "Pure Botanics", basePrice: 44, tags: ["body-lotion", "retinol", "shea"] },
  ],

  // ---- HOME & LIVING ----
  "curated-interiors": [
    { name: "Minimalist Vase Set", description: "Set of three matte ceramic vases in graduated sizes.", brand: "Artisan Living", basePrice: 120, tags: ["ceramic", "vase", "minimal"] },
    { name: "Sculptural Centerpiece", description: "Contemporary brass and marble tabletop sculpture.", brand: "Modern Rustic", basePrice: 280, tags: ["brass", "marble", "sculpture"] },
    { name: "Woven Wall Hanging", description: "Hand-woven macramé wall hanging in natural cotton.", brand: "Artisan Living", basePrice: 95, tags: ["woven", "macrame", "wall-art"] },
  ],
  "living-spaces": [
    { name: "Modular Sofa", description: "Sectional modular sofa in Belgian linen with reversible cushions.", brand: "Haven Home", basePrice: 2800, tags: ["sofa", "modular", "linen"] },
    { name: "Coffee Table", description: "Solid oak coffee table with a live edge and hairpin legs.", brand: "Modern Rustic", basePrice: 650, tags: ["oak", "coffee-table", "live-edge"] },
    { name: "Floor Lamp", description: "Arc floor lamp in brushed brass with a linen shade.", brand: "Architectural Edit", basePrice: 340, tags: ["lamp", "brass", "arc"] },
  ],
  "cozy-corners": [
    { name: "Reading Chair", description: "Mid-century inspired armchair in velvet with turned legs.", brand: "Haven Home", basePrice: 780, tags: ["armchair", "velvet", "mid-century"] },
    { name: "Side Table", description: "Two-tier side table in bamboo and tempered glass.", brand: "Artisan Living", basePrice: 180, tags: ["side-table", "bamboo", "glass"] },
    { name: "Throw Blanket", description: "Chunky knit throw blanket in pure merino wool.", brand: "Cozy & Co", basePrice: 145, tags: ["throw", "knit", "merino"] },
  ],
  "sleep-sanctuary": [
    { name: "Organic Mattress Topper", description: "Organic latex mattress topper with a cotton cover.", brand: "Haven Home", basePrice: 350, tags: ["mattress-topper", "latex", "organic"] },
    { name: "Egyptian Cotton Sheets", description: "1000-thread count Egyptian cotton sateen sheet set.", brand: "Cozy & Co", basePrice: 220, tags: ["sheets", "cotton", "egytian"] },
    { name: "Down Pillow Set", description: "Hungarian goose down pillows with a 700 fill power.", brand: "Haven Home", basePrice: 180, tags: ["pillow", "down", "goose"] },
  ],
  "soft-living": [
    { name: "Velvet Cushion Set", description: "Set of two embroidered velvet cushions with feather inserts.", brand: "Cozy & Co", basePrice: 85, tags: ["cushion", "velvet", "embroidered"] },
    { name: "Sheepskin Rug", description: "Natural sheepskin rug with a silky texture.", brand: "Modern Rustic", basePrice: 195, tags: ["sheepskin", "rug", "natural"] },
    { name: "Linen Curtains", description: "Pure linen curtains in oatmeal with a subtle slub texture.", brand: "Haven Home", basePrice: 160, tags: ["curtains", "linen", "oatmeal"] },
  ],
  "home-refresh": [
    { name: "Paint Set", description: "Set of 5 premium interior paint samples in neutral tones.", brand: "Architectural Edit", basePrice: 45, tags: ["paint", "samples", "neutral"] },
    { name: "Wallpaper Roll", description: "Grasscloth wallpaper roll in a natural seagrass texture.", brand: "Artisan Living", basePrice: 95, tags: ["wallpaper", "grasscloth", "natural"] },
    { name: "DIY Shelving Kit", description: "Modular wall shelving kit in powder-coated steel.", brand: "Architectural Edit", basePrice: 120, tags: ["shelving", "steel", "modular"] },
  ],
  "dining-moments": [
    { name: "Porcelain Dinner Set", description: "12-piece porcelain dinner set with a minimalist rim.", brand: "Artisan Living", basePrice: 240, tags: ["porcelain", "dinner-set", "minimal"] },
    { name: "Crystal Wine Glasses", description: "Set of 4 hand-blown crystal wine glasses.", brand: "Modern Rustic", basePrice: 150, tags: ["crystal", "wine-glasses", "hand-blown"] },
    { name: "Linen Tablecloth", description: "Stonewashed linen tablecloth with fringed edges.", brand: "Artisan Living", basePrice: 85, tags: ["linen", "tablecloth", "stonewashed"] },
  ],
  "kitchen-studio": [
    { name: "Cast Iron Dutch Oven", description: "Enameled cast iron dutch oven in matte black.", brand: "Modern Rustic", basePrice: 180, tags: ["cast-iron", "dutch-oven", "enameled"] },
    { name: "Chef's Knife Set", description: "Japanese stainless steel chef's knife set with walnut handles.", brand: "Artisan Living", basePrice: 210, tags: ["knife", "japanese", "walnut"] },
    { name: "Smoked Glass Jar Set", description: "Set of 3 smoked glass storage jars with bamboo lids.", brand: "Cozy & Co", basePrice: 45, tags: ["glass-jars", "storage", "bamboo-lid"] },
  ],
  "ambient-glow": [
    { name: "Table Lamp", description: "Ceramic table lamp with a pleated silk shade.", brand: "Architectural Edit", basePrice: 195, tags: ["lamp", "ceramic", "silk-shade"] },
    { name: "String Lights", description: "Vintage-style LED string lights in brass and amber glass.", brand: "Artisan Living", basePrice: 55, tags: ["string-lights", "led", "amber"] },
    { name: "Salt Lamp", description: "Himalayan salt lamp with a dimmable cord and wooden base.", brand: "Cozy & Co", basePrice: 42, tags: ["salt-lamp", "himalayan", "dimmable"] },
  ],
  "statement-decor": [
    { name: "Abstract Canvas Art", description: "Large abstract oil painting on stretched canvas.", brand: "Artisan Living", basePrice: 450, tags: ["art", "abstract", "oil-painting"] },
    { name: "Decorative Mirror", description: "Sunburst mirror with gold leaf detailing.", brand: "Architectural Edit", basePrice: 280, tags: ["mirror", "sunburst", "gold-leaf"] },
    { name: "Sculptural Bookend Set", description: "Set of 2 marble bookends in a geometric design.", brand: "Modern Rustic", basePrice: 75, tags: ["bookends", "marble", "geometric"] },
  ],
  "organized-living": [
    { name: "Woven Storage Baskets", description: "Set of 3 seagrass storage baskets with lids.", brand: "Artisan Living", basePrice: 65, tags: ["baskets", "seagrass", "storage"] },
    { name: "Velvet Hangers", description: "Set of 20 velvet hangers in charcoal with chrome hooks.", brand: "Cozy & Co", basePrice: 35, tags: ["hangers", "velvet", "set"] },
    { name: "Drawer Dividers", description: "Adjustable bamboo drawer dividers in a set of 6.", brand: "Modern Rustic", basePrice: 28, tags: ["dividers", "bamboo", "adjustable"] },
  ],
  "smart-living": [
    { name: "Smart Thermostat", description: "Programmable smart thermostat with app control and geofencing.", brand: "Architectural Edit", basePrice: 180, tags: ["thermostat", "smart", "app"] },
    { name: "Robot Vacuum", description: "LiDAR navigation robot vacuum with mopping function.", brand: "Haven Home", basePrice: 420, tags: ["vacuum", "robot", "lidar"] },
    { name: "Smart Speaker", description: "Premium smart speaker with room-calibrated sound.", brand: "Architectural Edit", basePrice: 250, tags: ["speaker", "smart", "voice"] },
  ],
  "the-hosting-edit": [
    { name: "Cheese Board Set", description: "Slate cheese board with 4 cheese knives and labels.", brand: "Modern Rustic", basePrice: 48, tags: ["cheese-board", "slate", "set"] },
    { name: "Cocktail Shaker", description: "Copper cocktail shaker with jigger and strainer.", brand: "Artisan Living", basePrice: 42, tags: ["cocktail", "copper", "shaker"] },
    { name: "Pitcher Set", description: "Hand-blown glass pitcher with matching tumblers (set of 4).", brand: "Modern Rustic", basePrice: 65, tags: ["pitcher", "glass", "tumblers"] },
  ],
  "outdoor-retreat": [
    { name: "Teak Adirondack Chair", description: "Solid teak Adirondack chair with curved seat and armrests.", brand: "Haven Home", basePrice: 320, tags: ["teak", "adirondack", "outdoor"] },
    { name: "Outdoor Rug", description: "Weather-resistant outdoor rug in a geometric pattern.", brand: "Cozy & Co", basePrice: 95, tags: ["rug", "outdoor", "weather-resistant"] },
    { name: "Fire Pit", description: "Tabletop propane fire pit with lava rocks.", brand: "Modern Rustic", basePrice: 150, tags: ["fire-pit", "propane", "tabletop"] },
  ],
  "bathroom-retreat": [
    { name: "Bamboo Bath Caddy", description: "Expandable bamboo bathtub caddy with book/tablet stand.", brand: "Artisan Living", basePrice: 38, tags: ["bath-caddy", "bamboo", "expandable"] },
    { name: "Turkish Towel Set", description: "Set of 2 organic Turkish cotton bath towels.", brand: "Cozy & Co", basePrice: 65, tags: ["towel", "turkish", "organic"] },
    { name: "Soap Dispenser Set", description: "Ceramic soap dispenser with matching toothbrush holder.", brand: "Modern Rustic", basePrice: 32, tags: ["soap-dispenser", "ceramic", "set"] },
  ],
  "laundry-lounge": [
    { name: "Laundry Basket", description: "Woven seagrass laundry basket with a cotton liner.", brand: "Artisan Living", basePrice: 48, tags: ["laundry", "seagrass", "woven"] },
    { name: "Clothes Drying Rack", description: "Retractable wall-mounted drying rack in aluminum.", brand: "Modern Rustic", basePrice: 55, tags: ["drying-rack", "retractable", "wall"] },
    { name: "Linen Spray", description: "Linen spray in lavender and eucalyptus on a glass bottle.", brand: "Cozy & Co", basePrice: 22, tags: ["linen-spray", "lavender", "eucalyptus"] },
  ],
  "home-office-studio": [
    { name: "Standing Desk", description: "Electric height-adjustable standing desk in bamboo.", brand: "Architectural Edit", basePrice: 650, tags: ["desk", "standing", "adjustable"] },
    { name: "Ergonomic Chair", description: "Mesh back ergonomic office chair with lumbar support.", brand: "Haven Home", basePrice: 480, tags: ["chair", "ergonomic", "mesh"] },
    { name: "Desk Organizer", description: "Walnut desk organizer with multiple compartments.", brand: "Artisan Living", basePrice: 55, tags: ["organizer", "walnut", "desk"] },
  ],
  "pet-friendly-living": [
    { name: "Pet Bed", description: "Memory foam pet bed in washable linen with a bolster edge.", brand: "Cozy & Co", basePrice: 85, tags: ["pet-bed", "memory-foam", "linen"] },
    { name: "Pet Feeding Station", description: "Elevated bamboo pet feeder with stainless steel bowls.", brand: "Modern Rustic", basePrice: 68, tags: ["feeder", "bamboo", "elevated"] },
    { name: "Cat Tree", description: "Modern cat tree with sisal-wrapped posts and hideaway.", brand: "Haven Home", basePrice: 140, tags: ["cat-tree", "sisal", "modern"] },
  ],
  "seasonal-living": [
    { name: "Wreath", description: "Dried eucalyptus and lavender wreath on a wire frame.", brand: "Artisan Living", basePrice: 55, tags: ["wreath", "eucalyptus", "dried"] },
    { name: "String Lights Set", description: "Copper wire fairy lights on a 48ft spool.", brand: "Cozy & Co", basePrice: 28, tags: ["fairy-lights", "copper", "outdoor"] },
    { name: "Advent Calendar", description: "Wooden advent calendar with reusable drawers.", brand: "Modern Rustic", basePrice: 42, tags: ["advent", "wooden", "reusable"] },
  ],
  "everyday-comfort": [
    { name: "Heated Throw Blanket", description: "Heated throw with 3 heat settings and auto-shutoff.", brand: "Cozy & Co", basePrice: 78, tags: ["heated", "throw", "auto-shutoff"] },
    { name: "Essential Oil Diffuser", description: "Ultrasonic essential oil diffuser with LED mood lighting.", brand: "Artisan Living", basePrice: 35, tags: ["diffuser", "ultrasonic", "led"] },
    { name: "Weighted Blanket", description: "Cotton weighted blanket with glass bead filling (15lbs).", brand: "Cozy & Co", basePrice: 120, tags: ["weighted", "blanket", "cotton"] },
  ],

  // ---- TRAVEL ----
  "jetsetter-essentials": [
    { name: "Travel Wallet", description: "RFID-blocking travel wallet with passport organizer.", brand: "Nomad Supply Co", basePrice: 68, tags: ["wallet", "rfid", "passport"] },
    { name: "Neck Pillow", description: "Memory foam neck pillow with a bamboo cover and snap closure.", brand: "Wanderlust Gear", basePrice: 35, tags: ["neck-pillow", "memory-foam", "bamboo"] },
    { name: "Universal Adapter", description: "Universal travel adapter with 4 USB ports and surge protection.", brand: "Global Companion", basePrice: 45, tags: ["adapter", "usb", "surge-protection"] },
  ],
  "the-carry-on-edit": [
    { name: "Carry-On Suitcase", description: "Polycarbonate carry-on with 360-degree spinner wheels.", brand: "JetSet Pro", basePrice: 280, tags: ["carry-on", "polycarbonate", "spinner"] },
    { name: "Garment Bag", description: "Foldable garment bag in wrinkle-resistant nylon.", brand: "Nomad Supply Co", basePrice: 55, tags: ["garment-bag", "nylon", "foldable"] },
    { name: "Travel Backpack", description: "40L travel backpack with TSA-friendly laptop compartment.", brand: "Explorer's Trunk", basePrice: 120, tags: ["backpack", "travel", "tsa"] },
  ],
  "weekend-escape": [
    { name: "Weekender Bag", description: "Waxed canvas weekender bag with leather trim.", brand: "Nomad Supply Co", basePrice: 180, tags: ["weekender", "canvas", "leather"] },
    { name: "Toiletry Bag", description: "Waterproof hanging toiletry bag with multiple compartments.", brand: "Global Companion", basePrice: 32, tags: ["toiletry", "waterproof", "hanging"] },
    { name: "Shoe Bag Set", description: "Set of 2 nylon shoe bags in different sizes.", brand: "JetSet Pro", basePrice: 22, tags: ["shoe-bag", "nylon", "set"] },
  ],
  "wanderlust-collection": [
    { name: "Travel Jewelry Case", description: "Compact jewelry case with multiple compartments in vegan leather.", brand: "Nomad Supply Co", basePrice: 38, tags: ["jewelry-case", "compact", "vegan-leather"] },
    { name: "Travel Blanket", description: "Ultra-soft travel blanket with integrated pillow pocket.", brand: "Wanderlust Gear", basePrice: 48, tags: ["blanket", "travel", "pillow-pocket"] },
    { name: "Snack Containers", description: "Set of 3 BPA-free silicone snack containers, collapsible.", brand: "Global Companion", basePrice: 18, tags: ["containers", "silicone", "bpa-free"] },
  ],
  "adventure-ready": [
    { name: "Hiking Boots", description: "Waterproof leather hiking boots with Vibram soles.", brand: "Explorer's Trunk", basePrice: 220, tags: ["boots", "hiking", "waterproof"] },
    { name: "Trekking Poles", description: "Lightweight carbon fiber trekking poles with cork grips.", brand: "Wanderlust Gear", basePrice: 95, tags: ["trekking-poles", "carbon-fiber", "cork"] },
    { name: "Hydration Pack", description: "2-liter hydration pack with insulated hose and bite valve.", brand: "Explorer's Trunk", basePrice: 65, tags: ["hydration-pack", "insulated", "bite-valve"] },
  ],
  "travel-comfort": [
    { name: "Eye Mask", description: "Molded memory foam eye mask with 100% light blockage.", brand: "Wanderlust Gear", basePrice: 28, tags: ["eye-mask", "memory-foam", "blackout"] },
    { name: "Compression Socks", description: "Graduated compression socks for long-haul flights.", brand: "Nomad Supply Co", basePrice: 22, tags: ["compression-socks", "flight", "graduated"] },
    { name: "Travel Slippers", description: "Quilted travel slippers with foldable design and carry pouch.", brand: "Global Companion", basePrice: 25, tags: ["slippers", "quilted", "foldable"] },
  ],
  "destination-style": [
    { name: "Straw Hat", description: "Wide-brimmed Panama straw hat with UPF 50+ rating.", brand: "Nomad Supply Co", basePrice: 48, tags: ["hat", "straw", "upf"] },
    { name: "Packable Puffer", description: "Down puffer jacket that packs into its own pocket.", brand: "Wanderlust Gear", basePrice: 120, tags: ["puffer", "packable", "down"] },
    { name: "Linen Shirt", description: "Wrinkle-resistant travel linen shirt in ivory.", brand: "JetSet Pro", basePrice: 88, tags: ["linen", "shirt", "travel"] },
  ],
  "smart-packing": [
    { name: "Packing Cubes Set", description: "Set of 4 packing cubes in assorted sizes with mesh tops.", brand: "Nomad Supply Co", basePrice: 32, tags: ["packing-cubes", "mesh", "set"] },
    { name: "Compression Bags", description: "Set of 3 travel compression bags, no pump required.", brand: "Global Companion", basePrice: 18, tags: ["compression-bags", "travel", "airtight"] },
    { name: "Toiletry Bottles", description: "Leak-proof silicone travel bottles in a TSA-friendly set of 4.", brand: "JetSet Pro", basePrice: 16, tags: ["travel-bottles", "silicone", "leak-proof"] },
  ],
  "on-the-go-essentials": [
    { name: "Portable Charger", description: "20000mAh portable power bank with fast charging.", brand: "Global Companion", basePrice: 55, tags: ["power-bank", "20000mah", "fast-charging"] },
    { name: "Travel Cutlery Set", description: "Bamboo travel cutlery set in a cotton carry pouch.", brand: "Nomad Supply Co", basePrice: 14, tags: ["cutlery", "bamboo", "reusable"] },
    { name: "Collapsible Water Bottle", description: "Silicone collapsible water bottle, 500ml.", brand: "Wanderlust Gear", basePrice: 18, tags: ["water-bottle", "silicone", "collapsible"] },
  ],
  "road-trip-society": [
    { name: "Car Phone Mount", description: "Magnetic car phone mount with adjustable arm.", brand: "Global Companion", basePrice: 28, tags: ["phone-mount", "magnetic", "car"] },
    { name: "Cooler Bag", description: "Insulated cooler bag with waterproof lining (12-can capacity).", brand: "Explorer's Trunk", basePrice: 45, tags: ["cooler", "insulated", "waterproof"] },
    { name: "Travel Pillow Set", description: "Inflatable travel pillow set with built-in pump.", brand: "Wanderlust Gear", basePrice: 25, tags: ["travel-pillow", "inflatable", "pump"] },
  ],
  "frequent-flyer-picks": [
    { name: "Noise-Cancelling Headphones", description: "Active noise-cancelling over-ear headphones with 30hr battery.", brand: "JetSet Pro", basePrice: 280, tags: ["headphones", "noise-cancelling", "wireless"] },
    { name: "Travel Router", description: "Portable Wi-Fi router with VPN support and WPA3 encryption.", brand: "Global Companion", basePrice: 85, tags: ["router", "wifi", "vpn"] },
    { name: "Laptop Stand", description: "Foldable aluminum laptop stand for ergonomic work on the go.", brand: "JetSet Pro", basePrice: 38, tags: ["laptop-stand", "aluminum", "foldable"] },
  ],
  "travel-tech": [
    { name: "E-Reader", description: "Waterproof e-reader with a 6.8-inch glare-free display.", brand: "JetSet Pro", basePrice: 140, tags: ["ereader", "waterproof", "display"] },
    { name: "Camera Cube Insert", description: "Padded camera cube divider for backpack organization.", brand: "Nomad Supply Co", basePrice: 35, tags: ["camera-cube", "padded", "divider"] },
    { name: "Multi-Cable Charger", description: "3-in-1 charging cable with USB-C, Lightning, and Micro-USB.", brand: "Global Companion", basePrice: 18, tags: ["cable", "3-in-1", "charging"] },
  ],
  "resort-retreat": [
    { name: "Beach Tote Bag", description: "Large straw beach tote with leather handles and interior zip pocket.", brand: "Nomad Supply Co", basePrice: 65, tags: ["beach-bag", "straw", "leather"] },
    { name: "Sun Hat", description: "UPF 50+ wide-brim sun hat in natural raffia.", brand: "Wanderlust Gear", basePrice: 42, tags: ["sun-hat", "raffia", "upf"] },
    { name: "Reef-Safe Sunscreen", description: "Mineral reef-safe SPF 50 sunscreen, 8oz.", brand: "Global Companion", basePrice: 28, tags: ["sunscreen", "reef-safe", "mineral"] },
  ],
  "outdoor-escape": [
    { name: "Camping Tent", description: "3-person waterproof tent with easy-setup poles.", brand: "Explorer's Trunk", basePrice: 220, tags: ["tent", "waterproof", "3-person"] },
    { name: "Sleeping Bag", description: "3-season sleeping bag rated to 20°F with compression sack.", brand: "Wanderlust Gear", basePrice: 95, tags: ["sleeping-bag", "3-season", "compression"] },
    { name: "Camping Stove", description: "Compact propane camping stove with wind protection.", brand: "Explorer's Trunk", basePrice: 45, tags: ["stove", "propane", "compact"] },
  ],
  "urban-explorer": [
    { name: "City Guide Book", description: "Curated city guide covering 25 global destinations.", brand: "Nomad Supply Co", basePrice: 28, tags: ["guidebook", "city", "destinations"] },
    { name: "Crossbody Sling Bag", description: "Anti-theft crossbody sling bag with RFID blocking.", brand: "Global Companion", basePrice: 55, tags: ["sling-bag", "anti-theft", "rfid"] },
    { name: "Comfortable Walking Shoes", description: "Arch-support sneakers with cushioned sole, travel-ready.", brand: "Explorer's Trunk", basePrice: 85, tags: ["sneakers", "arch-support", "travel"] },
  ],
  "beach-club": [
    { name: "Beach Towel", description: "Oversized Turkish cotton beach towel with fringe.", brand: "Nomad Supply Co", basePrice: 42, tags: ["beach-towel", "turkish-cotton", "oversized"] },
    { name: "Dry Bag", description: "10L waterproof dry bag for electronics and valuables.", brand: "Wanderlust Gear", basePrice: 28, tags: ["dry-bag", "waterproof", "10l"] },
    { name: "Snorkel Set", description: "Professional snorkel mask and tube set with anti-fog.", brand: "Explorer's Trunk", basePrice: 55, tags: ["snorkel", "mask", "anti-fog"] },
  ],
  "mountain-moments": [
    { name: "Insulated Jacket", description: "Down-insulated, water-resistant mountain jacket with hood.", brand: "Explorer's Trunk", basePrice: 180, tags: ["jacket", "insulated", "water-resistant"] },
    { name: "Base Layer Set", description: "Merino wool base layer top and bottom set.", brand: "Wanderlust Gear", basePrice: 95, tags: ["base-layer", "merino", "set"] },
    { name: "Trekking Backpack", description: "50L trekking backpack with hydration sleeve and rain cover.", brand: "Explorer's Trunk", basePrice: 140, tags: ["backpack", "trekking", "50l"] },
  ],
  "global-finds": [
    { name: "Money Belt", description: "Concealed travel money belt in breathable mesh.", brand: "Global Companion", basePrice: 18, tags: ["money-belt", "concealed", "mesh"] },
    { name: "Language Guide", description: "Pocket phrase book covering 10 languages.", brand: "Nomad Supply Co", basePrice: 14, tags: ["phrasebook", "languages", "pocket"] },
    { name: "Travel Insurance Card", description: "Digital travel insurance card with 24/7 assistance.", brand: "Global Companion", basePrice: 25, tags: ["insurance", "travel", "digital"] },
  ],
  "memory-makers": [
    { name: "Instant Camera", description: "Retro instant camera with built-in flash and selfie mirror.", brand: "JetSet Pro", basePrice: 85, tags: ["camera", "instant", "retro"] },
    { name: "Travel Journal", description: "Leather-bound travel journal with dot-grid and perforated pages.", brand: "Nomad Supply Co", basePrice: 28, tags: ["journal", "leather", "dot-grid"] },
    { name: "Photo Printer", description: "Portable pocket photo printer with Bluetooth connectivity.", brand: "JetSet Pro", basePrice: 120, tags: ["printer", "photo", "bluetooth"] },
  ],
  "vacation-mode": [
    { name: "Kindle Case", description: "Protective travel case for e-readers with hand strap.", brand: "Nomad Supply Co", basePrice: 22, tags: ["case", "ereader", "hand-strap"] },
    { name: "Passport Cover", description: "Luxury leather passport cover with RFID protection.", brand: "JetSet Pro", basePrice: 35, tags: ["passport-cover", "leather", "rfid"] },
    { name: "Travel Hat", description: "Packable travel hat with UPF 50+ and chin cord.", brand: "Wanderlust Gear", basePrice: 38, tags: ["hat", "packable", "upf"] },
  ],

  // ---- HEALTH & WELLNESS ----
  "daily-wellness": [
    { name: "Multivitamin Pack", description: "Daily multivitamin pack with 15 essential nutrients.", brand: "Vitality Labs", basePrice: 32, tags: ["multivitamin", "daily", "essential"] },
    { name: "Probiotic Gummies", description: "Probiotic gummies with 5 billion CFU per serving.", brand: "Pure Life", basePrice: 28, tags: ["probiotic", "gummies", "digestive"] },
    { name: "Omega-3 Supplement", description: "High-potency Omega-3 fish oil capsules, 1000mg.", brand: "Vitality Labs", basePrice: 35, tags: ["omega-3", "fish-oil", "heart-health"] },
  ],
  "mindful-living": [
    { name: "Meditation Cushion", description: "Round meditation cushion with a removable organic cotton cover.", brand: "Zen Essentials", basePrice: 55, tags: ["meditation", "cushion", "organic-cotton"] },
    { name: "Singing Bowl Set", description: "Hand-hammered Tibetan singing bowl with mallet.", brand: "Harmonix", basePrice: 65, tags: ["singing-bowl", "tibetan", "meditation"] },
    { name: "Essential Oil Diffuser", description: "Ultrasonic aromatherapy diffuser with wood grain finish.", brand: "Zen Essentials", basePrice: 42, tags: ["diffuser", "aromatherapy", "ultrasonic"] },
  ],
  "inner-balance": [
    { name: "Adaptogen Blend", description: "Adaptogenic mushroom powder blend with lion's mane and reishi.", brand: "Wellness Hub", basePrice: 48, tags: ["adaptogen", "mushroom", "lion's-mane"] },
    { name: "Magnesium Supplement", description: "High-absorption magnesium glycinate capsules, 120 count.", brand: "Vitality Labs", basePrice: 26, tags: ["magnesium", "glycinate", "calm"] },
    { name: "Ashwagandha Gummies", description: "Stress-reducing ashwagandha gummies with vitamin D.", brand: "Pure Life", basePrice: 32, tags: ["ashwagandha", "stress", "gummies"] },
  ],
  "active-recovery": [
    { name: "Massage Gun", description: "Percussion massage gun with 6 speed settings and 4 heads.", brand: "Vitality Labs", basePrice: 120, tags: ["massage-gun", "percussion", "recovery"] },
    { name: "Foam Roller", description: "High-density foam roller with a hollow core and textured surface.", brand: "Zen Essentials", basePrice: 32, tags: ["foam-roller", "high-density", "textured"] },
    { name: "Recovery Slides", description: "Recovery sandals with memory foam footbed and arch support.", brand: "Harmonix", basePrice: 45, tags: ["slides", "recovery", "memory-foam"] },
  ],
  "energy-boosters": [
    { name: "Green Superfood Powder", description: "Organic greens powder with wheatgrass, spirulina, and chlorella.", brand: "Pure Life", basePrice: 55, tags: ["greens", "superfood", "organic"] },
    { name: "Vitamin B12 Spray", description: "Methylcobalamin B12 sublingual spray, 2000mcg.", brand: "Vitality Labs", basePrice: 22, tags: ["b12", "spray", "energy"] },
    { name: "Matcha Green Tea Powder", description: "Ceremonial grade Japanese matcha powder, 100g tin.", brand: "Pure Life", basePrice: 35, tags: ["matcha", "green-tea", "ceremonial-grade"] },
  ],
  "sleep-better": [
    { name: "Melatonin Gummies", description: "Melatonin 5mg gummies with chamomile and passionflower.", brand: "Wellness Hub", basePrice: 24, tags: ["melatonin", "gummies", "sleep"] },
    { name: "Weighted Sleep Mask", description: "Weighted silk sleep mask with contoured eye cups.", brand: "Zen Essentials", basePrice: 32, tags: ["sleep-mask", "weighted", "silk"] },
    { name: "White Noise Machine", description: "White noise machine with 12 sounds and timer.", brand: "Harmonix", basePrice: 38, tags: ["white-noise", "sound-machine", "timer"] },
  ],
  "womens-wellness": [
    { name: "Prenatal Vitamin Pack", description: "Daily prenatal vitamin pack with DHA and folic acid.", brand: "Vitality Labs", basePrice: 38, tags: ["prenatal", "vitamin", "dha"] },
    { name: "Menstrual Relief Set", description: "Organic heating pad with herbal tea and aromatherapy balm.", brand: "Wellness Hub", basePrice: 48, tags: ["heating-pad", "menstrual", "herbal"] },
    { name: "Hormone Balance Supplement", description: "Hormone-balancing supplement with chasteberry and maca.", brand: "Pure Life", basePrice: 42, tags: ["hormone", "balance", "maca"] },
  ],
  "healthy-habits": [
    { name: "Water Bottle with Timer", description: "32oz insulated water bottle with hourly hydration markers.", brand: "Wellness Hub", basePrice: 28, tags: ["water-bottle", "insulated", "timed"] },
    { name: "Habit Tracker Journal", description: "Undated habit tracker journal with weekly layouts.", brand: "Zen Essentials", basePrice: 18, tags: ["journal", "habit-tracker", "undated"] },
    { name: "Smart Scale", description: "Wi-Fi smart scale that measures body fat, muscle, and bone mass.", brand: "Vitality Labs", basePrice: 45, tags: ["scale", "smart", "body-fat"] },
  ],
  "nutrition-edit": [
    { name: "Collagen Peptides", description: "Grass-fed collagen peptides in unflavored powder form.", brand: "Pure Life", basePrice: 35, tags: ["collagen", "peptides", "grass-fed"] },
    { name: "Plant Protein Powder", description: "Pea and rice protein blend, vanilla, 2lbs.", brand: "Vitality Labs", basePrice: 42, tags: ["protein", "plant-based", "vanilla"] },
    { name: "Vitamin D3 Drops", description: "Vitamin D3 liquid drops, 2000 IU per drop.", brand: "Wellness Hub", basePrice: 18, tags: ["vitamin-d", "drops", "immune"] },
  ],
  "fitness-essentials": [
    { name: "Yoga Mat", description: "Non-slip cork yoga mat with carrying strap.", brand: "Harmonix", basePrice: 68, tags: ["yoga-mat", "cork", "non-slip"] },
    { name: "Resistance Bands Set", description: "Set of 5 resistance bands with door anchor and carry bag.", brand: "Vitality Labs", basePrice: 28, tags: ["resistance-bands", "set", "portable"] },
    { name: "Kettlebell", description: "Cast iron kettlebell with a flat base and wide handle.", brand: "Harmonix", basePrice: 45, tags: ["kettlebell", "cast-iron", "flat-base"] },
  ],
  "stress-less": [
    { name: "Stress Relief Tea", description: "Organic chamomile and lavender herbal tea, 60 bags.", brand: "Pure Life", basePrice: 16, tags: ["tea", "chamomile", "herbal"] },
    { name: "Aromatherapy Rollerball", description: "Stress relief aromatherapy rollerball with lavender and cedarwood.", brand: "Zen Essentials", basePrice: 14, tags: ["rollerball", "aromatherapy", "stress"] },
    { name: "Stress Relief Gummies", description: "Calm gummies with L-theanine, ashwagandha, and lemon balm.", brand: "Wellness Hub", basePrice: 28, tags: ["gummies", "l-theanine", "calm"] },
  ],
  "self-care-rituals": [
    { name: "Gratitude Journal", description: "Leather-bound gratitude journal with daily prompts.", brand: "Zen Essentials", basePrice: 22, tags: ["journal", "gratitude", "leather"] },
    { name: "Bath Caddy Set", description: "Bamboo bath caddy with candle holder and phone stand.", brand: "Harmonix", basePrice: 38, tags: ["bath-caddy", "bamboo", "set"] },
    { name: "Body Oil", description: "Warming massage oil with ginger and sweet almond oil.", brand: "Wellness Hub", basePrice: 32, tags: ["body-oil", "massage", "ginger"] },
  ],
  "movement-studio": [
    { name: "Yoga Block Set", description: "Set of 2 cork yoga blocks with beveled edges.", brand: "Harmonix", basePrice: 24, tags: ["yoga-blocks", "cork", "beveled"] },
    { name: "Yoga Strap", description: "Cotton yoga strap with D-ring buckle, 8ft.", brand: "Zen Essentials", basePrice: 14, tags: ["yoga-strap", "cotton", "d-ring"] },
    { name: "Balance Board", description: "Wooden balance board with a non-slip surface.", brand: "Harmonix", basePrice: 55, tags: ["balance-board", "wooden", "non-slip"] },
  ],
  "immune-support": [
    { name: "Elderberry Syrup", description: "Organic elderberry syrup with vitamin C and zinc.", brand: "Pure Life", basePrice: 24, tags: ["elderberry", "vitamin-c", "zinc"] },
    { name: "Vitamin C Powder", description: "Pure ascorbic acid vitamin C powder, 500g.", brand: "Vitality Labs", basePrice: 28, tags: ["vitamin-c", "powder", "immune"] },
    { name: "Zinc Lozenges", description: "Zinc gluconate lozenges with echinacea, 60 count.", brand: "Wellness Hub", basePrice: 12, tags: ["zinc", "lozenges", "echinacea"] },
  ],
  "hydration-zone": [
    { name: "Insulated Water Bottle", description: "Double-wall vacuum insulated bottle, 32oz, in matte black.", brand: "Wellness Hub", basePrice: 35, tags: ["water-bottle", "insulated", "32oz"] },
    { name: "Electrolyte Packets", description: "Sugar-free electrolyte powder packets, 30 count.", brand: "Vitality Labs", basePrice: 22, tags: ["electrolytes", "powder", "sugar-free"] },
    { name: "Glass Water Bottle", description: "Borosilicate glass water bottle with silicone sleeve, 500ml.", brand: "Pure Life", basePrice: 24, tags: ["water-bottle", "glass", "silicone-sleeve"] },
  ],
  "wellness-reset": [
    { name: "Detox Tea Kit", description: "Organic 7-day detox tea kit with 3 herbal blends.", brand: "Pure Life", basePrice: 28, tags: ["detox", "tea", "herbal"] },
    { name: "Apple Cider Vinegar Gummies", description: "Apple cider vinegar gummies with 'the mother', 60 count.", brand: "Wellness Hub", basePrice: 18, tags: ["acv", "gummies", "digestive"] },
    { name: "Activated Charcoal", description: "Activated charcoal capsules for digestive health, 100 count.", brand: "Vitality Labs", basePrice: 16, tags: ["charcoal", "digestive", "capsules"] },
  ],
  "healthy-aging": [
    { name: "CoQ10 Supplement", description: "Ubiquinone CoQ10 200mg softgels for heart health.", brand: "Vitality Labs", basePrice: 38, tags: ["coq10", "heart-health", "anti-aging"] },
    { name: "Resveratrol Capsules", description: "Trans-resveratrol 500mg capsules with grape seed extract.", brand: "Pure Life", basePrice: 32, tags: ["resveratrol", "antioxidant", "longevity"] },
    { name: "Turmeric Curcumin", description: "Bioavailable curcumin with black pepper extract, 120 count.", brand: "Wellness Hub", basePrice: 28, tags: ["turmeric", "curcumin", "anti-inflammatory"] },
  ],
  "body-basics": [
    { name: "Natural Deodorant", description: "Aluminum-free natural deodorant in a compostable tube.", brand: "Pure Life", basePrice: 14, tags: ["deodorant", "natural", "aluminum-free"] },
    { name: "Body Brush", description: "Dry body brush with natural sisal bristles and wooden handle.", brand: "Harmonix", basePrice: 16, tags: ["body-brush", "dry-brushing", "sisal"] },
    { name: "Lip Balm Trio", description: "Set of 3 organic lip balms in different flavors.", brand: "Wellness Hub", basePrice: 12, tags: ["lip-balm", "organic", "set"] },
  ],
  "better-living": [
    { name: "Air Purifier", description: "HEPA air purifier with activated carbon filter, for rooms up to 500sqft.", brand: "Harmonix", basePrice: 160, tags: ["air-purifier", "hepa", "carbon"] },
    { name: "Humidifier", description: "Ultrasonic cool mist humidifier with essential oil tray.", brand: "Zen Essentials", basePrice: 42, tags: ["humidifier", "ultrasonic", "cool-mist"] },
    { name: "Sunrise Alarm Clock", description: "Sunrise simulation alarm clock with 7 natural sounds.", brand: "Wellness Hub", basePrice: 45, tags: ["alarm-clock", "sunrise", "simulation"] },
  ],
  "holistic-living": [
    { name: "Crystal Set", description: "Set of 7 healing crystals with a guidebook.", brand: "Zen Essentials", basePrice: 32, tags: ["crystals", "healing", "set"] },
    { name: "Smudge Kit", description: "White sage smudge stick with abalone shell and feather.", brand: "Harmonix", basePrice: 22, tags: ["smudge", "sage", "cleansing"] },
    { name: "Incense Variety Pack", description: "Set of 6 incense scents with a ceramic holder.", brand: "Zen Essentials", basePrice: 18, tags: ["incense", "variety", "holder"] },
  ],

  // ---- FOOD & NUTRITION ----
  "the-pantry-edit": [
    { name: "Extra Virgin Olive Oil", description: "Single-estate Italian extra virgin olive oil, 500ml.", brand: "Artisan Pantry", basePrice: 32, tags: ["olive-oil", "single-estate", "italian"] },
    { name: "Sea Salt Flakes", description: "Hand-harvested French sea salt flakes in a ceramic grinder.", brand: "Gourmet Finds", basePrice: 14, tags: ["sea-salt", "french", "grinder"] },
    { name: "Balsamic Vinegar", description: "Aged balsamic vinegar of Modena, 12-year, 250ml.", brand: "Flavor Farm", basePrice: 28, tags: ["balsamic", "aged", "modena"] },
  ],
  "flavor-studio": [
    { name: "Spice Gift Set", description: "Set of 6 premium spice blends in a gift box.", brand: "Flavor Farm", basePrice: 38, tags: ["spices", "blends", "gift"] },
    { name: "Saffron Threads", description: "Premium Spanish saffron threads, 1g in a glass jar.", brand: "Gourmet Finds", basePrice: 24, tags: ["saffron", "spanish", "premium"] },
    { name: "Vanilla Bean Paste", description: "Madagascar vanilla bean paste, 100ml.", brand: "Artisan Pantry", basePrice: 18, tags: ["vanilla", "madagascar", "paste"] },
  ],
  "better-bites": [
    { name: "Protein Balls", description: "Almond date protein balls, 12-pack in eco packaging.", brand: "NutriCraft", basePrice: 14, tags: ["protein-balls", "almond", "date"] },
    { name: "Kale Chips", description: "Organic kale chips in tangy chili flavor, 3-pack.", brand: "Pure Harvest", basePrice: 18, tags: ["kale-chips", "organic", "chili"] },
    { name: "Seaweed Snacks", description: "Roasted seaweed snack packs, 12-count variety pack.", brand: "NutriCraft", basePrice: 12, tags: ["seaweed", "roasted", "snack"] },
  ],
  "everyday-nourishment": [
    { name: "Overnight Oats Multipack", description: "Organic overnight oats in 4 flavors, 8-pack.", brand: "Pure Harvest", basePrice: 24, tags: ["oats", "overnight", "organic"] },
    { name: "Chia Seeds", description: "Organic black chia seeds, 2lb bag.", brand: "NutriCraft", basePrice: 16, tags: ["chia-seeds", "organic", "superfood"] },
    { name: "Almond Butter", description: "Creamy organic almond butter, 16oz jar.", brand: "Pure Harvest", basePrice: 18, tags: ["almond-butter", "creamy", "organic"] },
  ],
  "mindful-eating": [
    { name: "Portion Control Plate Set", description: "Set of 4 portion control dinner plates with guides.", brand: "NutriCraft", basePrice: 42, tags: ["plates", "portion-control", "set"] },
    { name: "Meal Prep Containers", description: "Glass meal prep containers in a set of 5, 2-compartment.", brand: "Artisan Pantry", basePrice: 32, tags: ["meal-prep", "glass", "containers"] },
    { name: "Food Scale", description: "Digital food scale with nutritional data, 11lb capacity.", brand: "NutriCraft", basePrice: 28, tags: ["food-scale", "digital", "nutritional"] },
  ],
  "superfood-society": [
    { name: "Açaí Bowl Kit", description: "Freeze-dried açaí powder pack with granola and seeds, 6-pack.", brand: "Pure Harvest", basePrice: 28, tags: ["acai", "bowl", "granola"] },
    { name: "Maca Powder", description: "Organic maca root powder, 1lb.", brand: "NutriCraft", basePrice: 22, tags: ["maca", "powder", "organic"] },
    { name: "Spirulina Tablets", description: "Organic spirulina tablets, 500 count.", brand: "Pure Harvest", basePrice: 24, tags: ["spirulina", "tablets", "organic"] },
  ],
  "protein-picks": [
    { name: "Whey Protein Isolate", description: "Grass-fed whey protein isolate in double chocolate, 2lbs.", brand: "NutriCraft", basePrice: 45, tags: ["whey-protein", "isolate", "chocolate"] },
    { name: "Pea Protein Powder", description: "Organic pea protein powder, unflavored, 1.5lbs.", brand: "Pure Harvest", basePrice: 32, tags: ["pea-protein", "organic", "unflavored"] },
    { name: "Collagen Protein Bars", description: "Collagen protein bars with dark chocolate, 12-pack.", brand: "NutriCraft", basePrice: 28, tags: ["protein-bars", "collagen", "chocolate"] },
  ],
  "healthy-indulgence": [
    { name: "Dark Chocolate Collection", description: "Set of 4 single-origin dark chocolate bars (70-85%).", brand: "Gourmet Finds", basePrice: 28, tags: ["chocolate", "dark", "single-origin"] },
    { name: "Frozen Yogurt Bark", description: "Mixed berry frozen yogurt bark with granola, 4-pack.", brand: "Pure Harvest", basePrice: 14, tags: ["frozen-yogurt", "bark", "berry"] },
    { name: "Date Caramel Sauce", description: "Clean-ingredient date caramel sauce, 8oz jar.", brand: "Artisan Pantry", basePrice: 12, tags: ["caramel", "date", "clean"] },
  ],
  "snack-smart": [
    { name: "Trail Mix", description: "Organic trail mix with nuts, seeds, and dark chocolate.", brand: "NutriCraft", basePrice: 16, tags: ["trail-mix", "organic", "nuts"] },
    { name: "Rice Cakes Variety", description: "Brown rice cakes in 3 flavors, 30-pack.", brand: "Pure Harvest", basePrice: 12, tags: ["rice-cakes", "brown-rice", "variety"] },
    { name: "Edamame Snack Packs", description: "Roasted edamame snack packs, 12-pack.", brand: "NutriCraft", basePrice: 18, tags: ["edamame", "roasted", "snack"] },
  ],
  "kitchen-creations": [
    { name: "Baking Gift Set", description: "Artisan baking set with flours, sugars, and mix-ins.", brand: "Artisan Pantry", basePrice: 42, tags: ["baking", "set", "artisan"] },
    { name: "Sourdough Starter Kit", description: "Sourdough starter kit with jar, scraper, and instructions.", brand: "Flavor Farm", basePrice: 28, tags: ["sourdough", "starter", "baking"] },
    { name: "Coconut Flour", description: "Organic coconut flour, 2lb bag.", brand: "Pure Harvest", basePrice: 14, tags: ["coconut-flour", "organic", "gluten-free"] },
  ],
  "fresh-finds": [
    { name: "Vegetable Seeds Set", description: "Organic heirloom vegetable seeds, 12 varieties.", brand: "Pure Harvest", basePrice: 18, tags: ["seeds", "vegetable", "heirloom"] },
    { name: "Microgreen Kit", description: "Indoor microgreen growing kit with seeds and trays.", brand: "Flavor Farm", basePrice: 32, tags: ["microgreens", "kit", "indoor"] },
    { name: "Herb Garden Kit", description: "Indoor herb garden starter kit with 5 herb pods.", brand: "Artisan Pantry", basePrice: 28, tags: ["herb-garden", "kit", "indoor"] },
  ],
  "global-flavors": [
    { name: "Japanese Curry Kit", description: "Authentic Japanese curry roux 10-pack with recipe card.", brand: "Flavor Farm", basePrice: 16, tags: ["curry", "japanese", "roux"] },
    { name: "Italian Pasta Collection", description: "Set of 3 artisanal Italian pastas in bronze-cut dies.", brand: "Artisan Pantry", basePrice: 22, tags: ["pasta", "italian", "bronze-cut"] },
    { name: "Mexican Mole Set", description: "Traditional Mexican mole sauce set with 3 varieties.", brand: "Flavor Farm", basePrice: 28, tags: ["mole", "mexican", "sauce"] },
  ],
  "morning-rituals": [
    { name: "Granola", description: "Artisan maple pecan granola, 16oz resealable bag.", brand: "NutriCraft", basePrice: 14, tags: ["granola", "maple", "pecan"] },
    { name: "Smoothie Pack", description: "Organic smoothie starter pack with 8 frozen fruit blends.", brand: "Pure Harvest", basePrice: 32, tags: ["smoothie", "organic", "frozen"] },
    { name: "Honey Set", description: "Set of 3 raw honey varieties: wildflower, manuka, acacia.", brand: "Gourmet Finds", basePrice: 28, tags: ["honey", "raw", "variety"] },
  ],
  "coffee-culture": [
    { name: "Whole Bean Coffee", description: "Single-origin Colombian coffee, medium roast, 12oz.", brand: "Flavor Farm", basePrice: 22, tags: ["coffee", "colombian", "single-origin"] },
    { name: "Pour Over Set", description: "Ceramic pour-over dripper with glass carafe and filters.", brand: "Artisan Pantry", basePrice: 42, tags: ["pour-over", "dripper", "carafe"] },
    { name: "Coffee Grinder", description: "Burr coffee grinder with 18 grind settings.", brand: "Gourmet Finds", basePrice: 65, tags: ["grinder", "burr", "adjustable"] },
  ],
  "tea-time": [
    { name: "Matcha Ceremonial Grade", description: "Japanese ceremonial grade matcha, 50g tin.", brand: "Pure Harvest", basePrice: 35, tags: ["matcha", "ceremonial", "japanese"] },
    { name: "Herbal Tea Collection", description: "Set of 8 herbal teas in a keepsake tin.", brand: "Artisan Pantry", basePrice: 28, tags: ["herbal-tea", "collection", "tin"] },
    { name: "Tea Infuser Bottle", description: "Glass tea bottle with stainless steel infuser for loose leaf.", brand: "NutriCraft", basePrice: 24, tags: ["tea-bottle", "infuser", "glass"] },
  ],
  "sweet-escapes": [
    { name: "French Macaron Kit", description: "DIY French macaron kit with all dry ingredients, 24 count.", brand: "Gourmet Finds", basePrice: 38, tags: ["macarons", "baking-kit", "french"] },
    { name: "Artisan Chocolate Truffles", description: "Handcrafted dark chocolate truffles, 12-piece box.", brand: "Gourmet Finds", basePrice: 32, tags: ["truffles", "chocolate", "handcrafted"] },
    { name: "Ice Cream Base Mix", description: "Artisan ice cream base mix in vanilla, 3-pack.", brand: "Flavor Farm", basePrice: 18, tags: ["ice-cream", "base-mix", "vanilla"] },
  ],
  "functional-foods": [
    { name: "Bone Broth Powder", description: "Grass-fed bone broth protein powder in chicken flavor.", brand: "NutriCraft", basePrice: 38, tags: ["bone-broth", "protein", "grass-fed"] },
    { name: "Kombucha Starter Kit", description: "Brew your own kombucha kit with SCOBY and flavors.", brand: "Pure Harvest", basePrice: 32, tags: ["kombucha", "starter", "scoby"] },
    { name: "Ginger Turmeric Shots", description: "Organic ginger and turmeric wellness shots, 12-pack.", brand: "NutriCraft", basePrice: 28, tags: ["shots", "ginger", "turmeric"] },
  ],
  "wholesome-living": [
    { name: "Grain Variety Pack", description: "Set of 6 ancient grains: quinoa, farro, barley, etc.", brand: "Pure Harvest", basePrice: 24, tags: ["grains", "ancient", "variety"] },
    { name: "Coconut Water", description: "Organic coconut water in BPA-free cans, 12-pack.", brand: "NutriCraft", basePrice: 22, tags: ["coconut-water", "organic", "bpa-free"] },
    { name: "Nut Myk", description: "Almond and cashew blend myk, unsweetened, 32oz.", brand: "Pure Harvest", basePrice: 8, tags: ["nut-milk", "almond", "unsweetened"] },
  ],
  "balanced-plates": [
    { name: "Meal Kit Delivery Gift Card", description: "Gift card for 6 meals from a premium meal kit service.", brand: "Gourmet Finds", basePrice: 80, tags: ["meal-kit", "gift-card", "premium"] },
    { name: "Bento Box", description: "Japanese bento box with compartments and chopsticks.", brand: "Artisan Pantry", basePrice: 28, tags: ["bento-box", "japanese", "compartment"] },
    { name: "Salad Dressing Set", description: "Set of 3 organic salad dressings in glass bottles.", brand: "Flavor Farm", basePrice: 22, tags: ["dressing", "salad", "organic"] },
  ],
  "gourmet-discoveries": [
    { name: "Truffle Oil", description: "White truffle-infused olive oil, 100ml.", brand: "Gourmet Finds", basePrice: 28, tags: ["truffle-oil", "italian", "gourmet"] },
    { name: "Caviar Tin", description: "Premium black caviar in a 50g tin with mother-of-pearl spoon.", brand: "Gourmet Finds", basePrice: 85, tags: ["caviar", "premium", "tin"] },
    { name: "Parmesan Wheel", description: "Aged 24-month Parmigiano Reggiano wheel, 1kg.", brand: "Gourmet Finds", basePrice: 35, tags: ["parmesan", "aged", "italian"] },
  ],
};
