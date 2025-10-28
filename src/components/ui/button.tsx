import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-[0_8px_30px_hsl(var(--primary)/0.4)] active:scale-[0.98] active:shadow-md",
        destructive: "bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 shadow-lg active:scale-[0.98]",
        outline: "border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/60 active:scale-[0.98]",
        secondary: "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-lg hover:shadow-[0_8px_30px_hsl(var(--secondary)/0.4)] active:scale-[0.98]",
        ghost: "hover:bg-muted/50 active:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
        score: "h-12 min-w-[3rem] text-base font-bold glass-card hover:border-primary/60 hover:bg-card active:scale-95 transition-all touch-manipulation",
        gameMode: "min-h-[7rem] text-base glass-card border-2 border-border/50 hover:border-primary/60 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.25)] active:scale-[0.98] touch-manipulation",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
