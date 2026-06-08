"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "zustand";
import {
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@alaya/ui";
import { categories } from "@alaya/config";
import { searchStore } from "@/stores/search";
import { useWishlist } from "@/stores/wishlist";
import { ThemeToggle } from "./theme-toggle";
import { CurrencySwitcher } from "./currency-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const mainCategories = Object.values(categories);

const subcategories: Record<string, string[]> = {
  fashion: [
    "Elevated Essentials",
    "Signature Silhouettes",
    "Tailored Staples",
    "The Denim Edit",
    "Quiet Luxury",
  ],
  beauty: [
    "Glow Rituals",
    "Skin Science",
    "Complexion Lab",
    "Beauty Atelier",
    "Signature Scents",
  ],
  "home-living": [
    "Curated Interiors",
    "Living Spaces",
    "Sleep Sanctuary",
    "Ambient Glow",
    "Kitchen Studio",
  ],
  travel: [
    "Jetsetter Essentials",
    "The Carry-On Edit",
    "Weekend Escape",
    "Travel Tech",
    "Wanderlust Collection",
  ],
  "health-wellness": [
    "Daily Wellness",
    "Mindful Living",
    "Active Recovery",
    "Sleep Better",
    "Fitness Essentials",
  ],
  "food-nutrition": [
    "The Pantry Edit",
    "Flavor Studio",
    "Coffee Culture",
    "Superfood Society",
    "Gourmet Discoveries",
  ],
};

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const searchState = useStore(searchStore, (state) => state);
  const { items: wishlistItems } = useWishlist();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-obsidian/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading text-xl md:text-2xl font-medium tracking-tight text-softWhite hover:text-accent transition-colors"
            >
              ALAYA
              <span className="text-accent">.</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainCategories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(cat.slug)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={`/${cat.slug}`}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-ui text-muted hover:text-softWhite transition-colors rounded-lg hover:bg-white/5"
                    )}
                  >
                    {cat.name}
                    <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {openDropdown === cat.slug && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-white/10 bg-obsidian/95 backdrop-blur-xl shadow-xl p-2"
                      >
                        <Link
                          href={`/${cat.slug}`}
                          className="block px-3 py-2 text-sm font-medium text-softWhite rounded-lg hover:bg-white/5 transition-colors"
                        >
                          All {cat.name}
                        </Link>
                        <Separator className="my-1" />
                        {subcategories[cat.slug]?.map((sub) => (
                          <Link
                            key={sub}
                            href={`/${cat.slug}/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                            className="block px-3 py-1.5 text-sm text-muted hover:text-softWhite rounded-lg hover:bg-white/5 transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {/* Content links */}
              <Link
                href="/blog"
                className="px-3 py-2 text-sm font-ui text-muted hover:text-softWhite transition-colors rounded-lg hover:bg-white/5"
              >
                Blog
              </Link>
              <Link
                href="/guides"
                className="px-3 py-2 text-sm font-ui text-muted hover:text-softWhite transition-colors rounded-lg hover:bg-white/5"
              >
                Guides
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <CurrencySwitcher />
              <ThemeToggle />

              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={searchState.openSearch}
                className="text-muted hover:text-softWhite"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Link
                href="/user/wishlists"
                className="relative p-2 text-muted hover:text-softWhite transition-colors"
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-coral text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "bg-obsidian border border-white/10",
                      userButtonPopoverActionItem: "text-softWhite hover:bg-white/5",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted hover:text-softWhite">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <SignInButton mode="modal">
                        <span className="w-full">Sign In</span>
                      </SignInButton>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <SignUpButton mode="modal">
                        <span className="w-full">Create Account</span>
                      </SignUpButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SignedOut>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-muted hover:text-softWhite"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-obsidian lg:hidden pt-20"
          >
            <nav className="overflow-y-auto h-full pb-20 px-6">
              <div className="space-y-1">
                {mainCategories.map((cat) => (
                  <div key={cat.slug}>
                    <Link
                      href={`/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-lg font-heading text-softWhite border-b border-white/5"
                      style={{ borderColor: `${cat.accentColor}20` }}
                    >
                      <span>{cat.name}</span>
                      <span
                        className="text-sm font-ui"
                        style={{ color: cat.accentColor }}
                      >
                        Browse
                      </span>
                    </Link>
                    <div className="ml-4 mt-1 mb-3 space-y-1">
                      {subcategories[cat.slug]?.slice(0, 4).map((sub) => (
                        <Link
                          key={sub}
                          href={`/${cat.slug}/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-1.5 text-sm text-muted hover:text-softWhite transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/deals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-muted hover:text-softWhite transition-colors font-ui"
                >
                  Deals
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-muted hover:text-softWhite transition-colors font-ui"
                >
                  Blog
                </Link>
                <Link
                  href="/guides"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm text-muted hover:text-softWhite transition-colors font-ui"
                >
                  Guides
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
