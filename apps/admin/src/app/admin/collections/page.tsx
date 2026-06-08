import { prisma } from "@alaya/db/client";
import { CollectionsTable } from "./_components/collections-table";
import { CreateCollectionDialog } from "./_components/create-collection-dialog";

export const metadata = {
  title: "Collections | ALAYA INSIDER Admin",
};

interface CollectionsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const typeFilter = sp.type || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (query) {
    andConditions.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (typeFilter) {
    andConditions.push({ type: typeFilter });
  }
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [collections, total, products] = await Promise.all([
    prisma.collection.findMany({
      where: where as any,
      orderBy: { id: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        isPublic: true,
        type: true,
        products: {
          orderBy: { order: "asc" },
          select: {
            productId: true,
            order: true,
            product: { select: { id: true, title: true, slug: true } },
          },
        },
        _count: { select: { products: true } },
      },
    }),
    prisma.collection.count({ where: where as any }),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Collection Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} collection{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreateCollectionDialog products={products as any} />
      </div>

      <CollectionsTable
        collections={collections as any}
        products={products as any}
        typeFilter={typeFilter}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
