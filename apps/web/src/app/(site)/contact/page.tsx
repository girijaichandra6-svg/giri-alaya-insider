import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the ALAYA INSIDER team.",
};

export default function ContactPage() {
  return (
    <main className="pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
            Connect
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-medium mt-3 mb-3">
            Get in Touch
          </h1>
          <p className="text-sm text-muted font-body">
            Have a question, suggestion, or press inquiry? We&apos;d love to
            hear from you.
          </p>
        </div>

        {/* Email Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[
            {
              label: "General Inquiries",
              email: "hello@alayainsider.com",
            },
            {
              label: "Press &amp; Media",
              email: "press@alayainsider.com",
            },
            {
              label: "Editorial Team",
              email: "editorial@alayainsider.com",
            },
            {
              label: "Privacy &amp; Legal",
              email: "legal@alayainsider.com",
            },
          ].map(({ label, email }) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="group rounded-xl border border-white/10 bg-graphite/30 p-5 hover:border-accent/30 hover:bg-graphite/50 transition-all duration-300"
            >
              <p
                className="text-xs font-ui font-semibold uppercase tracking-wider text-muted mb-1"
                dangerouslySetInnerHTML={{ __html: label }}
              />
              <p className="text-sm text-softWhite group-hover:text-accent transition-colors font-body">
                {email}
              </p>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-white/10 bg-graphite/30 p-8">
          <h2 className="font-heading text-xl font-medium mb-6">
            Send Us a Message
          </h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
