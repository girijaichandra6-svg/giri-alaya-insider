import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { SearchModalWrapper } from "@/components/shared/search-modal-wrapper";
import { ToastProvider } from "@/components/ui/toast";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Header />
      <SearchModalWrapper />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
