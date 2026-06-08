"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@alaya/ui";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Search,
  Link2,
  ScrollText,
  Tag,
  Percent,
  Building2,
  FolderTree,
  Layers,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "SEO Tools",
    href: "/admin/seo",
    icon: Search,
  },
  {
    label: "Affiliates",
    href: "/admin/affiliates",
    icon: Link2,
  },
  {
    label: "Deals",
    href: "/admin/deals",
    icon: Tag,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: BookOpen,
  },
  {
    label: "Subcategories",
    href: "/admin/subcategories",
    icon: Layers,
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: Building2,
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: Percent,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-graphite border border-white/10 text-softWhite"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-obsidian/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-obsidian border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link
            href="/admin/dashboard"
            className="font-heading text-lg font-medium tracking-tight text-softWhite"
          >
            ALAYA<span className="text-accent">.</span>
            <span className="text-xs text-muted font-ui ml-2">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui transition-all",
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-softWhite hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <Link
            href="http://localhost:3000"
            target="_blank"
            className="flex items-center gap-2 text-xs text-muted hover:text-softWhite transition-colors font-ui"
          >
            <span>← Back to Site</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
