import { prisma } from "@alaya/db/client";
import Link from "next/link";

interface SubcategoryBreadcrumbProps {
  categorySlug: string;
  subcategorySlug: string | undefined;
  /** Pre-resolved name to avoid a duplicate Prisma query */
  subcategoryName?: string | null;
}

export async function SubcategoryBreadcrumb({
  categorySlug,
  subcategorySlug,
  subcategoryName,
}: SubcategoryBreadcrumbProps) {
  if (!subcategorySlug) return null;

  // Use the pre-resolved name if provided, otherwise fetch it
  const name =
    subcategoryName ??
    (await prisma.subcategory
      .findUnique({
        where: { slug: subcategorySlug },
        select: { name: true },
      })
      .then((s) => s?.name));

  if (!name) return null;

  return (
    <span className="flex items-center gap-2">
      <span className="text-muted/40">/</span>
      <Link
        href={`/${categorySlug}?subcategory=${subcategorySlug}`}
        className="text-muted hover:text-softWhite transition-colors font-body"
      >
        {name}
      </Link>
    </span>
  );
}
