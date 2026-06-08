import { siteConfig } from "@alaya/config/site";
import { JsonLd } from "@/components/shared/json-ld";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MessageCircle, Users, Newspaper, Star, Sparkles, ArrowRight } from "lucide-react";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Community",
      item: `${siteConfig.url}/community`,
    },
  ],
};

export const metadata = {
  title: "Community | ALAYA INSIDER",
  description:
    "Join the ALAYA INSIDER community — connect with fellow connoisseurs, share discoveries, and get early access to exclusive deals.",
};

const perks = [
  {
    icon: Star,
    title: "Early Access",
    description: "Be the first to know about new arrivals, exclusive deals, and limited-edition drops before the general public.",
    accent: "#D4FF00",
  },
  {
    icon: MessageCircle,
    title: "Insider Discussions",
    description: "Join curated conversations about luxury fashion, travel, beauty, and lifestyle with like-minded connoisseurs.",
    accent: "#FFB6C1",
  },
  {
    icon: Newspaper,
    title: "Weekly Digest",
    description: "Get a hand-picked roundup of the best products, guides, and stories delivered to your inbox every week.",
    accent: "#87CEEB",
  },
  {
    icon: Users,
    title: "Member Spotlights",
    description: "Share your curated collections and get featured in our community spotlights across social media.",
    accent: "#FFA07A",
  },
];

const channels = [
  {
    name: "Twitter / X",
    href: siteConfig.links.twitter,
    description: "Follow for daily curation, deals, and community highlights.",
  },
  {
    name: "Instagram",
    href: siteConfig.links.instagram,
    description: "Visual inspiration and behind-the-scenes from our editors.",
  },
  {
    name: "Pinterest",
    href: siteConfig.links.pinterest,
    description: "Curated mood boards and style inspiration across categories.",
  },
  {
    name: "YouTube",
    href: siteConfig.links.youtube,
    description: "In-depth reviews, unboxings, and category deep dives.",
  },
];

export default function CommunityPage() {
  return (
    <main className="pt-24">
      <JsonLd schema={breadcrumbSchema} />

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Breadcrumbs items={[{ label: "Community" }]} />
      </div>

      {/* Hero */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-ui font-semibold text-accent uppercase tracking-wider">
              Join the Inner Circle
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight">
            The ALAYA Community
          </h1>
          <p className="mt-6 text-lg text-muted font-body max-w-xl mx-auto leading-relaxed">
            Connect with a global network of discerning shoppers, share your
            discoveries, and elevate your lifestyle with insider access.
          </p>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl font-medium text-center mb-12">
            Why Join?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="group relative rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300"
                style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ backgroundColor: perk.accent }}
                />
                <div className="relative">
                  <perk.icon
                    className="h-8 w-8 mb-4"
                    style={{ color: perk.accent }}
                  />
                  <h3 className="font-heading text-xl font-medium mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-muted font-body leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
            <h2 className="font-heading text-3xl font-medium mb-4">
              Stay Connected
            </h2>
            <p className="text-muted font-body mb-8 max-w-md mx-auto">
              Join our newsletter for weekly curated picks, exclusive deals, and
              community highlights.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg bg-onyx border border-white/10 px-4 py-3 text-sm text-softWhite placeholder:text-muted focus:outline-none focus:border-accent transition-colors font-body"
                required
              />
              <button
                type="submit"
                className="rounded-lg bg-accent text-obsidian px-6 py-3 font-ui font-semibold text-sm hover:opacity-90 transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Social Channels */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-2xl font-medium text-center mb-12">
            Follow Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {channels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 bg-graphite/30"
              >
                <div>
                  <h3 className="font-ui font-semibold text-softWhite group-hover:text-accent transition-colors">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-muted mt-1 font-body">
                    {channel.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-accent transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
