import { prisma } from "@alaya/db/client";
import { CategoriesTable } from "./_components/categories-table";
import { CreateCategoryDialog } from "./_components/create-category-dialog";

export const metadata = {
  title: "Categories | ALAYA INSIDER Admin",
};

interface CategoriesPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
    ];
  }

  const categories = await prisma.category.findMany({
    where: where as any,
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      accentColor: true,
      imageUrl: true,
      parentId: true,
      metadata: true,
      _count: { select: { products: true, posts: true, children: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Category Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
          </p>
        </div>
        <CreateCategoryDialog categories={categories as any} />
      </div>

      <CategoriesTable
        categories={categories as any}
        query={query}
      />
    </div>
  );
}
