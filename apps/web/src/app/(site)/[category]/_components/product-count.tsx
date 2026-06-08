import { prisma } from "@alaya/db/client";

interface ProductCountProps {
  categorySlug: string;
  subcategorySlug?: string;
}

export async function ProductCount({
  categorySlug,
  subcategorySlug,
}: ProductCountProps) {
  const where: Record<string, unknown> = {
    isActive: true,
    category: { slug: categorySlug },
  };

  if (subcategorySlug) {
    where.subcategory = { slug: subcategorySlug };
  }

  try {
    const total = await prisma.product.count({ where: where as any });

    if (total === 0) return null;

    return (
      <p className="text-sm text-muted font-body">
        {total} product{total !== 1 ? "s" : ""}
      </p>
    );
  } catch {
    return (
      <p className="text-sm text-muted font-body">Showing products</p>
    );
  }
}
