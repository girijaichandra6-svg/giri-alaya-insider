export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Suspense } from "react";
import { HeroSection } from "./_components/hero-section";
import { TrendingSection } from "./_components/trending-section";
import { EditorsPicks } from "./_components/editors-picks";
import { CategoryShowcase } from "./_components/category-showcase";
import { DealCountdownBar } from "./_components/deal-countdown-bar";
import { BestsellersSection } from "./_components/bestsellers-section";
import { NewArrivalsSection } from "./_components/new-arrivals-section";
import { RecentlyViewedSection } from "./_components/recently-viewed-section";
import { NewsletterSection } from "./_components/newsletter-section";
import { TrustBar } from "./_components/trust-bar";

export default function HomePage() {
  return (
    <main>
      {/* 1. Dynamic Hero Carousel */}
      <HeroSection />

      {/* 2. Trending Now */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
              Trending Now
            </span>
            <h2 className="section-heading mt-2">Most Wanted</h2>
          </div>
          <Link
            href="/trending"
            className="text-sm text-muted hover:text-softWhite transition-colors font-ui"
          >
            View All &rarr;
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-64 h-96 rounded-xl bg-graphite animate-pulse"
                />
              ))}
            </div>
          }
        >
          <TrendingSection />
        </Suspense>
      </section>

      {/* 3. Editor's Picks */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-obsidian via-onyx/50 to-obsidian">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
                Editor&apos;s Choice
              </span>
              <h2 className="section-heading mt-2">Curated for You</h2>
            </div>
            <Link
              href="/collections/editors-picks"
              className="text-sm text-muted hover:text-softWhite transition-colors font-ui"
            >
              View All &rarr;
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="aspect-[4/3] rounded-2xl bg-graphite animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl bg-graphite animate-pulse"
                    />
                  ))}
                </div>
              </div>
            }
          >
            <EditorsPicks />
          </Suspense>
        </div>
      </section>

      {/* 4. Category Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-muted">
            Explore
          </span>
          <h2 className="section-heading mt-2">Shop by Category</h2>
        </div>
        <CategoryShowcase />
      </section>

      {/* 5. Deal Countdown Bar */}
      <Suspense fallback={null}>
        <DealCountdownBar />
      </Suspense>

      {/* 6. Best Sellers */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-muted">
              Best Sellers
            </span>
            <h2 className="section-heading mt-2">Top Rated</h2>
          </div>
          <Link
            href="/deals"
            className="text-sm text-muted hover:text-softWhite transition-colors font-ui"
          >
            View All &rarr;
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-xl bg-graphite animate-pulse"
                />
              ))}
            </div>
          }
        >
          <BestsellersSection />
        </Suspense>
      </section>

      {/* 7. New Arrivals */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-obsidian via-onyx/30 to-obsidian">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
                Just In
              </span>
              <h2 className="section-heading mt-2">New Arrivals</h2>
            </div>
            <Link
              href="/new"
              className="text-sm text-muted hover:text-softWhite transition-colors font-ui"
            >
              View All &rarr;
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] rounded-xl bg-graphite animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <NewArrivalsSection />
          </Suspense>
        </div>
      </section>

      {/* 8. Recently Viewed */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Suspense fallback={null}>
          <RecentlyViewedSection />
        </Suspense>
      </section>

      {/* 9. Trust Bar */}
      <TrustBar />

      {/* 10. Newsletter */}
      <NewsletterSection />
    </main>
  );
}
