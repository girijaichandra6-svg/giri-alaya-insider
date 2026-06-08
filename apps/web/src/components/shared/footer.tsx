import Link from "next/link";
import { siteConfig, categories, footerNavigation } from "@alaya/config";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-obsidian">
      {/* Newsletter Section */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-xl">
            <h3 className="font-heading text-2xl font-medium mb-2">
              The Insider Edit
            </h3>
            <p className="text-muted text-sm font-body mb-6">
              Curated picks, exclusive deals, and intelligence for the
              discerning shopper.
            </p>
            <NewsletterForm variant="inline" className="max-w-md" />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="font-heading text-xl font-medium text-softWhite hover:text-accent transition-colors"
            >
              ALAYA<span className="text-accent">.</span>
            </Link>
            <p className="mt-3 text-sm text-muted font-body max-w-xs">
              {siteConfig.tagline}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { label: "Twitter", href: siteConfig.links.twitter },
                { label: "Instagram", href: siteConfig.links.instagram },
                { label: "Pinterest", href: siteConfig.links.pinterest },
                { label: "YouTube", href: siteConfig.links.youtube },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-softWhite hover:border-white/20 transition-all text-xs font-ui"
                  aria-label={social.label}
                >
                  {social.label[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {Object.values(categories).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-sm text-softWhite/70 hover:text-accent transition-colors font-body"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
              {footerNavigation.shopping.title}
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.shopping.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-softWhite/70 hover:text-accent transition-colors font-body"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
              {footerNavigation.resources.title}
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.resources.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-softWhite/70 hover:text-accent transition-colors font-body"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-ui font-semibold uppercase tracking-widest text-muted mb-4">
              {footerNavigation.support.title}
            </h4>
            <ul className="space-y-2.5">
              {footerNavigation.support.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-softWhite/70 hover:text-accent transition-colors font-body"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted font-body">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted font-body">
            <Link href="/privacy" className="hover:text-softWhite transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-softWhite transition-colors">
              Terms
            </Link>
            <Link href="/disclosure" className="hover:text-softWhite transition-colors">
              Disclosure
            </Link>
            <Link href="/editorial-policy" className="hover:text-softWhite transition-colors">
              Editorial Policy
            </Link>
            <Link href="/accessibility" className="hover:text-softWhite transition-colors">
              Accessibility
            </Link>
            <Link href="/contact" className="hover:text-softWhite transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-[10px] text-muted/50 font-body">
            As an affiliate partner, we may earn commissions on purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
