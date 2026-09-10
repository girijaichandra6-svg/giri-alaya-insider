/**
 * Mandatory Amazon Associates disclosure — exact phrase, every product page.
 * (Compliance checklist item 2: "page_exact_disclosure")
 */
const EXACT_PHRASE =
  "As an Amazon Associate I earn from qualifying purchases.";

export function AmazonDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={className || "text-xs text-muted/60 font-body"}>
      {EXACT_PHRASE}
    </p>
  );
}
