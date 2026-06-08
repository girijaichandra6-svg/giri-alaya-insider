import { prisma } from "@alaya/db/client";
import { SubcategoriesTable } from "./_components/subcategories-table";
import { CreateSubcategoryDialog } from "./_components/create-subcategory-dialog";

export const metadata = {
  title: "Subcategories | ALAYA INSIDER Admin",
};

interface SubcategoriesPageProps {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function SubcategoriesPage({ searchParams }: SubcategoriesPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const categoryIdFilter = sp.categoryId || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (query) {
    andConditions.push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (categoryIdFilter) {
    andConditions.push({ categoryId: categoryIdFilter });
  }
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [subcategories, total, categories] = await Promise.all([
    prisma.subcategory.findMany({
      where: where as any,
      orderBy: { name: "asc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        categoryId: true,
        category: { select: { id: true, name: true, accentColor: true } },
        _count: { select: { products: true } },
      },
    }),
    prisma.subcategory.count({ where: where as any }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Subcategory Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} subcategor{total === 1 ? "y" : "ies"} total
          </p>
        </div>
        <CreateSubcategoryDialog categories={categories as any} />
      </div>

      <SubcategoriesTable
        subcategories={subcategories as any}
        categories={categories as any}
        categoryIdFilter={categoryIdFilter}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
