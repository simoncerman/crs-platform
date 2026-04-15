import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        glass:
          "bg-stellar-white/80 dark:bg-cosmic-blue/30 backdrop-blur-lg border border-moon-gray/20 dark:border-aurora-cyan/20 hover:border-moon-gray/30 dark:hover:border-aurora-cyan/40 shadow-sm",
        solid:
          "bg-stellar-white dark:bg-cosmic-blue shadow-md border border-moon-gray/10 dark:border-transparent",
        outlined:
          "bg-transparent border-2 border-moon-gray/50 dark:border-moon-gray/30 hover:border-moon-gray/70 dark:hover:border-aurora-cyan/50",
      },
      padding: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hoverable: {
        true: "hover:shadow-xl cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "glass",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, onClick, ...props }, ref) => {
    const classes = cn(cardVariants({ variant, padding, hoverable, className }));

    if (hoverable || onClick) {
      return (
        <motion.div
          ref={ref}
          className={classes}
          onClick={onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={onClick ? { scale: 0.98 } : undefined}
          {...(props as React.ComponentProps<typeof motion.div>)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
  }
>(({ className, title, subtitle, action, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between mb-4", className)}
    {...props}
  >
    <div className="flex-1">
      {title && (
        <h3 className="font-heading text-xl font-bold text-deep-space dark:text-stellar-white">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-moon-gray/80 dark:text-moon-gray mt-1">{subtitle}</p>
      )}
      {children}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
));

CardHeader.displayName = "CardHeader";

const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "sm" | "md" | "lg";
  }
>(({ className, spacing = "md", ...props }, ref) => {
  const spacingClass = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  }[spacing];

  return (
    <div
      ref={ref}
      className={cn(spacingClass, className)}
      {...props}
    />
  );
});

CardBody.displayName = "CardBody";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "left" | "center" | "right" | "between";
  }
>(({ className, align = "right", ...props }, ref) => {
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  }[align];

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 mt-6", alignClass, className)}
      {...props}
    />
  );
});

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter, cardVariants };
