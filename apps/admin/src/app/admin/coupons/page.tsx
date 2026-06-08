import { prisma } from "@alaya/db/client";
import { CouponsTable } from "./_components/coupons-table";
import { CreateCouponDialog } from "./_components/create-coupon-dialog";

export const metadata = {
  title: "Coupons | ALAYA INSIDER Admin",
};

interface CouponsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function CouponsPage({ searchParams }: CouponsPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { code: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  const [coupons, total, products, retailers] = await Promise.all([
    prisma.coupon.findMany({
      where: where as any,
      orderBy: { id: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        code: true,
        description: true,
        discount: true,
        expiresAt: true,
        product: { select: { id: true, title: true } },
        retailer: { select: { id: true, name: true } },
      },
    }),
    prisma.coupon.count({ where: where as any }),
    prisma.product.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    prisma.retailer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium">Coupon Manager</h1>
          <p className="text-sm text-muted font-body mt-1">
            {total} coupon{total === 1 ? "" : "s"} total
          </p>
        </div>
        <CreateCouponDialog products={products as any} retailers={retailers as any} />
      </div>

      <CouponsTable
        coupons={coupons as any}
        products={products as any}
        retailers={retailers as any}
        query={query}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
