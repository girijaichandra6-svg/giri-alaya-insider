import * as React from "react";

interface JsonLdProps {
  /** Single schema object or array of schema objects */
  schema: Record<string, unknown> | Record<string, unknown>[];
  /**
   * When true and schema is an array, wraps all schemas in a single
   * `@graph` container. This is Google's recommended pattern for
   * co-locating multiple entities on one page.
   * @default false
   */
  useGraph?: boolean;
}

/**
 * Renders JSON-LD structured data as `<script type="application/ld+json">` tags.
 *
 * Each schema object must include `@context` and `@type` properties.
 *
 * @example
 * ```tsx
 * <JsonLd
 *   schema={[
 *     { "@context": "https://schema.org", "@type": "Organization", name: "My Org" },
 *     { "@context": "https://schema.org", "@type": "WebSite", name: "My Site" },
 *   ]}
 *   useGraph
 * />
 * ```
 */
export function JsonLd({ schema, useGraph = false }: JsonLdProps) {
  if (Array.isArray(schema) && useGraph) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": schema,
          }),
        }}
      />
    );
  }

  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(s),
          }}
        />
      ))}
    </>
  );
}
