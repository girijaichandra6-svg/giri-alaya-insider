import { prisma } from "@alaya/db/client";
import { RetailersPanel } from "./_components/retailers-panel";
import { NetworksPanel } from "./_components/networks-panel";
import { RedirectTester } from "./_components/redirect-tester";

export const metadata = {
  title: "Affiliates | ALAYA INSIDER Admin",
};

export default async function AffiliatesPage() {
  const [retailers, networks] = await Promise.all([
    prisma.retailer.findMany({
      orderBy: { trustScore: "desc" },
      select: {
        id: true,
        name: true,
        website: true,
        trustScore: true,
        logoUrl: true,
        _count: { select: { affiliateLinks: true, deals: true, coupons: true } },
      },
    }),
    prisma.affiliateNetwork.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        identifier: true,
        _count: { select: { links: true } },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-medium">Affiliate Networks</h1>
        <p className="text-sm text-muted font-body mt-1">
          Manage retailers, affiliate links, and test redirects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RetailersPanel retailers={retailers as any} />
        <NetworksPanel networks={networks as any} />
      </div>

      <RedirectTester />
    </div>
  );
}
