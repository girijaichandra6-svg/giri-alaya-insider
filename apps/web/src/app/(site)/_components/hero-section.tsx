"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@alaya/ui";

const slides = [
  {
    title: "Discover the Exceptional",
    subtitle: "Curated for the Discerning",
    description: "Expert reviews, curated collections, and intelligent recommendations for those who demand the best.",
    cta: "Explore Now",
    href: "/fashion",
    accentColor: "#FFB6C1",
    gradient: "from-rose-900/30 via-obsidian/60 to-obsidian",
  },
  {
    title: "Intelligence Meets Luxury",
    subtitle: "Smart Shopping, Elevated",
    description: "AI-powered insights and price predictions to find your perfect moment to buy.",
    cta: "Discover Deals",
    href: "/deals",
    accentColor: "#D4FF00",
    gradient: "from-accent/10 via-obsidian/60 to-obsidian",
  },
  {
    title: "The Art of Living Well",
    subtitle: "Home & Living",
    description: "From minimalist sanctuaries to statement pieces — curate a home that tells your story.",
    cta: "Browse Home",
    href: "/home-living",
    accentColor: "#B8860B",
    gradient: "from-amber-900/20 via-obsidian/60 to-obsidian",
  },
  {
    title: "Wellness, Redefined",
    subtitle: "Health & Nutrition",
    description: "Evidence-based wellness, premium nutrition, and mindful living for a balanced life.",
    cta: "Start Your Journey",
    href: "/health-wellness",
    accentColor: "#98FB98",
    gradient: "from-emerald-900/20 via-obsidian/60 to-obsidian",
  },
  {
    title: "Wander Without Compromise",
    subtitle: "Travel Essentials",
    description: "Curated travel gear and accessories for the modern jetsetter.",
    cta: "Explore Travel",
    href: "/travel",
    accentColor: "#87CEEB",
    gradient: "from-sky-900/20 via-obsidian/60 to-obsidian",
  },
];

export function HeroSection() {
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current] as (typeof slides)[number];

  function goTo(index: number) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }

  function next() {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }

  function prev() {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-1000",
          slide.gradient
        )}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-30 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${slide.accentColor}15 0%, transparent 70%)`,
        }}
      />

      {/* Slides */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="max-w-3xl"
          >
            <span
              className="text-sm font-ui font-semibold uppercase tracking-[0.25em]"
              style={{ color: slide.accentColor }}
            >
              {slide.subtitle}
            </span>
            <h1 className="mt-6 font-heading text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-none text-softWhite">
              {slide.title}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-softWhite/60 max-w-xl font-body leading-relaxed">
              {slide.description}
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-ui font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: slide.accentColor, color: "#0A0A0A" }}
              >
                {slide.cta}
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 text-softWhite px-8 py-4 font-ui font-semibold text-sm hover:bg-white/5 transition-all"
              >
                All Categories
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        type="button"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 text-muted hover:text-softWhite hover:border-white/20 transition-all bg-obsidian/30 backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        type="button"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/10 text-muted hover:text-softWhite hover:border-white/20 transition-all bg-obsidian/30 backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            type="button"
            className="transition-all duration-300"
          >
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                i === current
                  ? "h-2 w-8"
                  : "h-2 w-2 bg-white/20 hover:bg-white/40"
              )}
              style={{
                backgroundColor: i === current ? slide.accentColor : undefined,
              }}
            />
          </button>
        ))}
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-10 right-10 z-20 hidden md:block">
        <span className="text-xs font-ui text-muted tabular-nums">
          {String(current + 1).padStart(2, "0")}
          <span className="mx-1 text-white/20">/</span>
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
