"use client";

import { motion } from "framer-motion";

const partners = [
  "Vogue",
  "GQ",
  "Architectural Digest",
  "WWD",
  "The Cut",
  "Harper's Bazaar",
  "Elle",
  "Wallpaper*",
];

export function TrustBar() {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-ui font-semibold uppercase tracking-[0.25em] text-muted text-center mb-8">
          As Seen In
        </p>
        <div className="relative overflow-hidden">
          <div className="flex gap-12 md:gap-20 items-center justify-center flex-wrap">
            {partners.map((partner, index) => (
              <motion.span
                key={partner}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="text-sm md:text-base text-muted/40 font-heading tracking-wider whitespace-nowrap"
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
