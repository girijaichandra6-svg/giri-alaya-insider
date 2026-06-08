import type { Metadata } from "next";
import { LegalPageLayout } from "../_components/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ALAYA INSIDER collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Last updated: June 2026"
    >
      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly, such as your name and email
        address when you subscribe to our newsletter, create an account, or
        contact us. We also automatically collect certain information when you
        visit our site, including your IP address, browser type, operating
        system, referring URLs, and browsing behavior.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to provide, maintain, and improve our
        services; to send you newsletters and updates (with your consent); to
        respond to your comments and inquiries; and to detect, prevent, and
        address technical issues and abuse.
      </p>

      <h2>3. Cookies &amp; Tracking</h2>
      <p>
        We use cookies and similar tracking technologies to track activity on
        our site and store certain information. Cookies are small data files
        stored on your device. We use both session cookies (which expire when
        you close your browser) and persistent cookies (which remain until
        deleted) to improve your experience and analyze site traffic.
      </p>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when
        a cookie is being sent. However, if you do not accept cookies, some
        portions of our site may not function properly.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        We may employ third-party companies and individuals to facilitate our
        service, provide analytics, process payments, or deliver newsletters.
        These third parties have access to your personal information only to
        perform these tasks on our behalf and are obligated not to disclose or
        use it for any other purpose.
      </p>
      <p>
        We currently use the following third-party services: Resend (email),
        Clerk (authentication), and analytics providers. Each has its own
        privacy policy governing the use of your data.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal information against unauthorized access,
        alteration, disclosure, or destruction. However, no method of
        transmission over the Internet or electronic storage is 100% secure.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access,
        correct, update, or request deletion of your personal information. You
        may also have the right to object to or restrict certain processing of
        your data. To exercise these rights, please contact us.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new policy on this page and updating the
        &ldquo;Last updated&rdquo; date.
      </p>

      <h2>8. Contact</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at{" "}
        <a href="mailto:privacy@alayainsider.com" className="text-accent hover:underline">
          privacy@alayainsider.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
