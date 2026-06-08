import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
  return (
    <main className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-ui font-semibold uppercase tracking-[0.2em] text-accent">
            Legal
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-medium mt-3 mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted font-body">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        <article className="prose-editorial">
          {children}
        </article>
      </div>
    </main>
  );
}
