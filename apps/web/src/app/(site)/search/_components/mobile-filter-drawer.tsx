"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchFilters } from "./search-filters";
import { Button } from "@/components/ui/button";

interface MobileFilterDrawerProps {
  currentCategory?: string;
  currentSubcategory?: string;
  currentQuery: string;
  currentTab: string;
}

export function MobileFilterDrawer({
  currentCategory,
  currentSubcategory,
  currentQuery,
  currentTab,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = React.useState(false);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Filters trigger button — visible below lg breakpoint */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Drawer overlay and panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel — slides in from the left */}
            <motion.div
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-obsidian border-r border-white/10 lg:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
                <h3 className="font-ui text-sm font-semibold text-softWhite uppercase tracking-wider">
                  Filters
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-muted hover:text-softWhite transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto h-[calc(100%-4rem)] px-6 py-6">
                <SearchFilters
                  currentCategory={currentCategory}
                  currentSubcategory={currentSubcategory}
                  currentQuery={currentQuery}
                  currentTab={currentTab}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
