import { SitemapPanel } from "./_components/sitemap-panel";
import { RobotsPanel } from "./_components/robots-panel";
import { JsonLdPanel } from "./_components/jsonld-panel";

export const metadata = {
  title: "SEO Tools | ALAYA INSIDER Admin",
};

export default function SeoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-medium">SEO Tools</h1>
        <p className="text-sm text-muted font-body mt-1">
          Manage sitemaps, robots.txt, and validate structured data
        </p>
      </div>

      <div className="space-y-6">
        <SitemapPanel />
        <RobotsPanel />
        <JsonLdPanel />
      </div>
    </div>
  );
}
