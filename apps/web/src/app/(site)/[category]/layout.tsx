import { categories } from "@alaya/config";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = categories[slug];

  if (!cat) return {};

  return {
    title: cat.name,
    description: cat.description,
    openGraph: {
      title: `${cat.name} | ALAYA INSIDER`,
      description: cat.description,
    },
  };
}

function hexToRgb(hex: string | undefined): string {
  if (!hex) return "212, 255, 0";
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "212, 255, 0";
  const r = parseInt(result[1] as string, 16);
  const g = parseInt(result[2] as string, 16);
  const b = parseInt(result[3] as string, 16);
  return `${r}, ${g}, ${b}`;
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = categories[slug];
  if (!cat) notFound();

  return (
    <div
      style={
        {
          "--category-accent": cat.accentColor,
          "--category-accent-rgb": hexToRgb(cat.accentColor),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
