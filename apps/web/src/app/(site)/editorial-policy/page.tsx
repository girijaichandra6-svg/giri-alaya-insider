import type { Metadata } from "next";
import { LegalPageLayout } from "../_components/legal-page-layout";

export const metadata: Metadata = {
  title: "Editorial Policy & Review Methodology",
  description:
    "How ALAYA INSIDER researches, reviews, and recommends products — our editorial standards and review process.",
};

export default function EditorialPolicyPage() {
  return (
    <LegalPageLayout
      title="Editorial Policy &amp; Review Methodology"
      subtitle="How we research, test, and recommend"
    >
      <h2>Our Editorial Standards</h2>
      <p>
        ALAYA INSIDER is committed to providing accurate, trustworthy, and
        valuable content to our readers. Our editorial team follows strict
        guidelines to ensure every piece of content meets our quality
        standards. We prioritize factual accuracy, fairness, and transparency
        in all our content.
      </p>

      <h2>Product Selection</h2>
      <p>
        Products featured on ALAYA INSIDER are selected through a rigorous
        process that includes:
      </p>
      <ul>
        <li>Market research and trend analysis</li>
        <li>Expert consultation and industry knowledge</li>
        <li>User reviews and community feedback analysis</li>
        <li>Performance metrics and technical specifications evaluation</li>
        <li>Value assessment relative to price point</li>
      </ul>

      <h2>Review Methodology</h2>
      <p>
        Our reviews are based on a combination of hands-on testing, expert
        analysis, and aggregated user feedback. We evaluate products across
        multiple dimensions including quality, design, functionality,
        durability, and value.
      </p>
      <p>
        When hands-on testing is not possible, we rely on verified user
        reviews, expert opinions from trusted sources, and detailed
        specification analysis to inform our recommendations.
      </p>

      <h2>Scoring System</h2>
      <p>
        Products are scored on a 1&ndash;100 scale across several criteria,
        with the final score representing a weighted average. The weighting
        varies by category to reflect what matters most to consumers in each
        product category.
      </p>

      <h2>Corrections Policy</h2>
      <p>
        We take accuracy seriously. If an error is identified in our content,
        we correct it promptly and transparently. Corrections are noted at the
        bottom of the affected article with the date and nature of the change.
      </p>

      <h2>Editorial Independence</h2>
      <p>
        Our editorial team operates independently from our commercial
        partnerships. Affiliate relationships never influence our product
        rankings, reviews, or editorial decisions. We maintain a strict
        separation between editorial and commercial operations.
      </p>

      <h2>Contact Our Editorial Team</h2>
      <p>
        Have feedback about our content or methodology? We welcome input from
        our readers. Reach us at{" "}
        <a href="mailto:editorial@alayainsider.com" className="text-accent hover:underline">
          editorial@alayainsider.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
