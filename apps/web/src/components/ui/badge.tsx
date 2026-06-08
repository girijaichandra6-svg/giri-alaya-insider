import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@alaya/ui";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-ui transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-obsidian",
        secondary: "bg-onyx text-softWhite border border-white/10",
        outline: "border border-white/20 text-muted",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-coral/10 text-coral border border-coral/20",
        info: "bg-cyan/10 text-cyan border border-cyan/20",
        new: "bg-accent/20 text-accent border border-accent/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
