import { Suspense } from "react";
import { AuditLogsTable } from "./_components/audit-logs-table";

export const metadata = {
  title: "Audit Logs | ALAYA INSIDER Admin",
};

interface AuditLogsPageProps {
  searchParams: Promise<{
    action?: string;
    entity?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const sp = await searchParams;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-medium">Audit Logs</h1>
        <p className="text-sm text-muted font-body mt-1">
          Track all administrative actions across the platform
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-xl border border-white/10 p-12 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted font-body">Loading audit logs...</p>
          </div>
        }
      >
        <AuditLogsTable
          initialAction={sp.action || ""}
          initialEntity={sp.entity || ""}
          initialFrom={sp.from || ""}
          initialTo={sp.to || ""}
          initialPage={parseInt(sp.page || "1")}
        />
      </Suspense>
    </div>
  );
}
