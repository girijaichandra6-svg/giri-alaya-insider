import type { Metadata } from "next";
import { LegalPageLayout } from "../_components/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing the use of ALAYA INSIDER.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Last updated: June 2026"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using ALAYA INSIDER, you agree to be bound by these
        Terms of Service. If you do not agree to all the terms, you may not
        access or use the site.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        ALAYA INSIDER provides curated product recommendations, reviews,
        editorial content, and affiliate links to third-party retailers. We do
        not sell products directly. All purchases are made through third-party
        retailers, and your relationship with those retailers is governed by
        their respective terms.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        When you create an account, you must provide accurate and complete
        information. You are responsible for maintaining the confidentiality
        of your account credentials and for all activities that occur under
        your account. You agree to notify us immediately of any unauthorized
        use of your account.
      </p>

      <h2>4. Affiliate Disclosure</h2>
      <p>
        ALAYA INSIDER participates in affiliate marketing programs. When you
        click on an affiliate link and make a purchase, we may earn a
        commission at no additional cost to you. This compensation helps us
        maintain our editorial independence and continue providing high-quality
        content. See our full{" "}
        <a href="/disclosure" className="text-accent hover:underline">
          Affiliate Disclosure
        </a>{" "}
        for more information.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        All content on ALAYA INSIDER, including text, graphics, logos, images,
        and software, is the property of ALAYA INSIDER or its content suppliers
        and is protected by applicable intellectual property laws. You may not
        reproduce, distribute, modify, or create derivative works without our
        prior written consent.
      </p>

      <h2>6. User Conduct</h2>
      <p>
        You agree not to use the site for any unlawful purpose or in violation
        of these terms. Prohibited conduct includes but is not limited to:
        attempting to gain unauthorized access to our systems, submitting false
        information, interfering with the site&apos;s operation, and engaging
        in any activity that could harm other users.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        ALAYA INSIDER and its affiliates shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from
        your use of the site or any products purchased through affiliate links.
      </p>

      <h2>8. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. Changes will
        be effective immediately upon posting. Your continued use of the site
        after any modifications indicates your acceptance of the updated terms.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the
        laws of the United States, without regard to its conflict of law
        provisions.
      </p>

      <h2>10. Contact</h2>
      <p>
        For questions about these Terms, please contact us at{" "}
        <a href="mailto:legal@alayainsider.com" className="text-accent hover:underline">
          legal@alayainsider.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
