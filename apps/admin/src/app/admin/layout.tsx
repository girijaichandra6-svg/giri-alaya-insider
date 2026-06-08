import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/app/admin/products/_components/use-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
          <ToastProvider>
            {children}
          </ToastProvider>
        </div>
      </main>
    </div>
  );
}
