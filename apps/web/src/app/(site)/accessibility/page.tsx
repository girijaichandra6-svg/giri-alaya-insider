import type { Metadata } from "next";
import { LegalPageLayout } from "../_components/legal-page-layout";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "ALAYA INSIDER's commitment to making our platform accessible to all users.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      subtitle="Our commitment to inclusive design"
    >
      <h2>Our Commitment</h2>
      <p>
        ALAYA INSIDER is committed to ensuring digital accessibility for all
        users, including those with disabilities. We continuously work to
        improve the user experience and apply relevant accessibility standards
        to make our platform inclusive and usable by everyone.
      </p>

      <h2>Standards We Follow</h2>
      <p>
        We strive to conform to the Web Content Accessibility Guidelines
        (WCAG) 2.1 Level AA standards. These guidelines outline how to make
        web content more accessible to people with a wide range of
        disabilities, including visual, auditory, physical, speech, cognitive,
        language, learning, and neurological disabilities.
      </p>

      <h2>What We&apos;ve Implemented</h2>
      <ul>
        <li>
          <strong>Keyboard navigation:</strong> All interactive elements are
          accessible via keyboard
        </li>
        <li>
          <strong>Screen reader compatibility:</strong> Semantic HTML structure
          with appropriate ARIA labels
        </li>
        <li>
          <strong>Color contrast:</strong> Text meets minimum contrast ratios
          against background colors
        </li>
        <li>
          <strong>Text resizing:</strong> Content remains readable when zoomed
          up to 200%
        </li>
        <li>
          <strong>Focus indicators:</strong> Visible focus states for keyboard
          navigation
        </li>
        <li>
          <strong>Alternative text:</strong> Images include descriptive alt
          text where appropriate
        </li>
        <li>
          <strong>Reduced motion:</strong> Respects user&apos;s reduced motion
          preferences
        </li>
      </ul>

      <h2>Ongoing Efforts</h2>
      <p>
        Accessibility is an ongoing process. We regularly audit our platform
        using automated tools and manual testing to identify and address
        accessibility barriers. Our development team receives ongoing training
        on accessible design and development practices.
      </p>

      <h2>Third-Party Content</h2>
      <p>
        Some content on our site may be provided by third parties. While we
        encourage our partners to meet accessibility standards, we may not
        have full control over the accessibility of third-party content.
      </p>

      <h2>Feedback</h2>
      <p>
        We welcome your feedback on the accessibility of ALAYA INSIDER. If you
        encounter any accessibility barriers or have suggestions for
        improvement, please contact us at{" "}
        <a href="mailto:accessibility@alayainsider.com" className="text-accent hover:underline">
          accessibility@alayainsider.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
