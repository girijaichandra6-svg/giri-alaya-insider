import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Playfair_Display, Inter, Manrope } from "next/font/google";
import "../styles/globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Admin | ALAYA INSIDER",
    template: "%s | ALAYA INSIDER Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#D4FF00",
          colorBackground: "#0A0A0A",
          colorInputBackground: "#1A1A1A",
          colorText: "#F5F5F7",
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${playfairDisplay.variable} ${inter.variable} ${manrope.variable}`}
      >
        <body className="min-h-screen bg-obsidian antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
