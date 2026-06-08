import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Heart, Bell, Star, User, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/user/dashboard", icon: User },
  { label: "Wishlists", href: "/user/wishlists", icon: Heart },
  { label: "Price Alerts", href: "/user/alerts", icon: Bell },
  { label: "Reviews", href: "/user/reviews", icon: Star },
  { label: "Settings", href: "/user/settings", icon: Settings },
];

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = await auth({
    acceptsToken: "api_key",
  });

  if (!isAuthenticated) {
    redirect("/?sign-in=true");
  }

  return (
    <main className="pt-24">
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui text-muted hover:text-softWhite hover:bg-white/5 transition-all"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
