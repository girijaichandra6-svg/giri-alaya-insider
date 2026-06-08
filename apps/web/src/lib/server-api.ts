import { headers } from "next/headers";

/**
 * Server-side fetch helper for Next.js Server Components (RSC).
 * Uses request headers to construct an absolute URL, since fetch() in
 * server components requires an absolute URL and relative URLs don't work.
 */
export async function serverFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1")
      ? "http"
      : "https";
  const url = `${protocol}://${host}/api${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: {
      revalidate: options?.next?.revalidate ?? 60,
      tags: options?.next?.tags,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
