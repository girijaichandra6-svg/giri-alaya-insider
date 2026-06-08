import { prisma } from "@alaya/db/client";
import { ProductsTable } from "./_components/products-table";
import { CreateProductDialog } from "./_components/create-product-dialog";

export const metadata = {
  title: "Products | ALAYA INSIDER Admin",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const sort = sp.sort || "newest";
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  // Build orderBy
  let orderBy: Record<string, unknown>;
  switch (sort) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: where as any,
      orderBy: orderBy as any,
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        brand: true,
        description: true,
        basePrice: true,
        currency: true,
        isActive: true,
        createdAt: true,
        category: { select: { name: true, accentColor: true } },
        subcategory: { select: { name: true } },
        _count: { select: { affiliateLinks: true, reviews: true } },
      },
    }),
    prisma.product.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Product Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} product{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreateProductDialog />
      </div>

      <ProductsTable
        products={products as any}
        query={query}
        sort={sort}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
