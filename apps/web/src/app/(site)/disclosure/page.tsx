import type { Metadata } from "next";
import { LegalPageLayout } from "../_components/legal-page-layout";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How ALAYA INSIDER earns commissions through affiliate partnerships — FTC compliant disclosure.",
};

export default function DisclosurePage() {
  return (
    <LegalPageLayout
      title="Affiliate Disclosure"
      subtitle="Transparency in our partnerships"
    >
      <h2>Our Commitment to Transparency</h2>
      <p>
        At ALAYA INSIDER, we believe in full transparency with our readers.
        This Affiliate Disclosure explains how we generate revenue through
        affiliate partnerships while maintaining our editorial independence.
      </p>

      <h2>Affiliate Links</h2>
      <p>
        Some of the links on ALAYA INSIDER are affiliate links. This means that
        if you click on a link and make a purchase, we may earn a commission
        at no additional cost to you. These commissions help us keep our
        content free and fund our editorial operations.
      </p>
      <p>
        Affiliate links are identified by redirects through our{" "}
        <code className="text-accent text-xs bg-accent/10 px-1.5 py-0.5 rounded">/go/</code>{" "}
        URL path before reaching the retailer&apos;s site. You can identify
        these links by hovering over them — they will show a{" "}
        <code className="text-accent text-xs bg-accent/10 px-1.5 py-0.5 rounded">/go/</code>{" "}
        destination before redirecting to the retailer.
      </p>

      <h2>FTC Compliance</h2>
      <p>
        In accordance with the Federal Trade Commission (FTC) guidelines, we
        clearly disclose our affiliate relationships. This disclosure appears
        on pages containing affiliate links and in the footer of every page
        on our site.
      </p>
      <p>
        The FTC requires that affiliate relationships be disclosed clearly and
        conspicuously. We take this requirement seriously and have implemented
        multiple disclosure touchpoints throughout the site.
      </p>

      <h2>Editorial Independence</h2>
      <p>
        Our affiliate partnerships do not influence our editorial content.
        Our reviews, recommendations, and rankings are based on independent
        research, expert opinion, and editorial judgment. We only recommend
        products we genuinely believe will provide value to our readers.
      </p>
      <p>
        We do not accept payment for positive reviews. If a brand or retailer
        wants to be featured, they must earn that placement through the quality
        of their products and services.
      </p>

      <h2>Our Affiliate Partners</h2>
      <p>
        We work with a select group of affiliate networks and retailers
        including major brands and retailers across fashion, electronics, home
        &amp; living, beauty, travel, and health &amp; wellness categories.
        Our partnerships are reviewed regularly to ensure they align with our
        editorial standards.
      </p>

      <h2>Questions?</h2>
      <p>
        If you have any questions about our affiliate practices, please contact
        us at{" "}
        <a href="mailto:disclosure@alayainsider.com" className="text-accent hover:underline">
          disclosure@alayainsider.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
