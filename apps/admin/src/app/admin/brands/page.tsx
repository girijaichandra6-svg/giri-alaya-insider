import { prisma } from "@alaya/db/client";
import { BrandsTable } from "./_components/brands-table";
import { CreateBrandDialog } from "./_components/create-brand-dialog";

export const metadata = {
  title: "Brands | ALAYA INSIDER Admin",
};

interface BrandsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where: where as any,
      orderBy: { name: "asc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.brand.count({ where: where as any }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Brand Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} brand{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreateBrandDialog />
      </div>

      <BrandsTable
        brands={brands as any}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
