import Link from "next/link";
import { cn } from "@alaya/ui";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  children?: React.ReactNode;
}

export function Breadcrumbs({ items, className, children }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      <Link
        href="/"
        className="text-muted hover:text-softWhite transition-colors font-body"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="text-muted/40">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted hover:text-softWhite transition-colors font-body"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-softWhite font-body">{item.label}</span>
          )}
        </span>
      ))}
      {children}
    </nav>
  );
}
