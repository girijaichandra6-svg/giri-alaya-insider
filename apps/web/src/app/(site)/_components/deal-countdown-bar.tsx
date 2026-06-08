import { serverFetch } from "@/lib/server-api";
import { DealCountdownClient } from "./deal-countdown-client";

interface Deal {
  id: string;
  title: string;
  discount: number | null;
  endDate: string;
}

interface DealsResponse {
  deals: Deal[];
}

export async function DealCountdownBar() {
  let deals: Deal[] = [];

  try {
    const data = await serverFetch<DealsResponse>(
      "/products/deals?limit=1&active=true",
      { next: { revalidate: 30 } }
    );
    deals = data.deals;
  } catch {
    return null;
  }

  if (deals.length === 0) return null;

  const deal = deals[0];
  if (!deal) return null;

  return <DealCountdownClient deal={deal} />;
}
