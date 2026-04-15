import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-heading font-bold uppercase border",
  {
    variants: {
      variant: {
        default:
          "bg-cosmic-blue/30 border-moon-gray/50 text-moon-gray",
        success:
          "bg-aurora-cyan/20 border-aurora-cyan/50 text-aurora-cyan",
        warning:
          "bg-solar-orange/20 border-solar-orange/50 text-solar-orange",
        error:
          "bg-solar-orange/30 border-solar-orange/60 text-solar-orange",
        info:
          "bg-aurora-blue/20 border-aurora-blue/50 text-aurora-blue",
        purple:
          "bg-nebula-purple/20 border-nebula-purple/50 text-nebula-purple",
        crs:
          "bg-crs-base/20 border-crs-base/50 text-crs-funky",
        ignition:
          "bg-crs-ignition/20 border-crs-ignition/50 text-crs-ignition",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
      dot: {
        true: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              variant === "success" && "bg-aurora-cyan",
              variant === "warning" && "bg-solar-orange",
              variant === "error" && "bg-solar-orange",
              variant === "info" && "bg-aurora-blue",
              variant === "purple" && "bg-nebula-purple",
              variant === "crs" && "bg-crs-base",
              variant === "ignition" && "bg-crs-ignition",
              variant === "default" && "bg-moon-gray"
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
