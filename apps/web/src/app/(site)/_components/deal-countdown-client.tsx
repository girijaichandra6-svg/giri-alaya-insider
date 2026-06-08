"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { CountdownTimer } from "@/components/shared/countdown-timer";

interface Deal {
  id: string;
  title: string;
  discount: number | null;
  endDate: string;
}

interface DealCountdownClientProps {
  deal: Deal;
}

export function DealCountdownClient({ deal }: DealCountdownClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden"
    >
      <div className="bg-gradient-to-r from-coral/20 via-coral/10 to-transparent border-y border-coral/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-full bg-coral/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-coral" />
            </span>
            <div>
              <p className="text-sm font-ui font-semibold text-softWhite">
                {deal.title}
              </p>
              {deal.discount && (
                <p className="text-xs text-coral font-ui">
                  Save up to {deal.discount}%
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <CountdownTimer endDate={deal.endDate} size="sm" />
            <Link
              href="/deals"
              className="text-sm font-ui font-semibold text-coral hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Shop Deal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
