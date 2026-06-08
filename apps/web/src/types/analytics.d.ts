/**
 * Type declarations for analytics integrations.
 */

interface Window {
  gtag?: (
    command: string,
    target: string,
    config?: Record<string, string | number | boolean | undefined>
  ) => void;
  dataLayer?: unknown[];
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    opt_out_capturing: () => void;
    init: (key: string, config?: Record<string, unknown>) => void;
  };
}
