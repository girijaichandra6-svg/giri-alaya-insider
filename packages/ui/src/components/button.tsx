import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-obsidian hover:bg-accent/90": variant === "primary",
            "bg-onyx text-softWhite hover:bg-graphite border border-white/10": variant === "secondary",
            "text-softWhite hover:bg-white/5": variant === "ghost",
            "border border-white/20 text-softWhite hover:bg-white/5": variant === "outline",
          },
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
