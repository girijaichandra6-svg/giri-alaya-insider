"use client";

import { motion } from "framer-motion";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-cyan/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-10"
            style={{
              background: "radial-gradient(circle, #D4FF00 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 p-8 md:p-16 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-medium tracking-tight mb-4">
              Join the Inner Circle
            </h2>
            <p className="text-muted text-lg font-body max-w-xl mx-auto mb-8">
              Early access to deals, exclusive editor reviews, and curated
              intelligence — delivered weekly.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm variant="inline" />
              <p className="text-xs text-muted/50 mt-4 font-body">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
