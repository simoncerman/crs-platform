import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden font-heading font-bold text-stellar-white",
  {
    variants: {
      size: {
        xs: "w-6 h-6 text-xs",
        sm: "w-8 h-8 text-sm",
        md: "w-12 h-12 text-base",
        lg: "w-16 h-16 text-xl",
        xl: "w-24 h-24 text-2xl",
        "2xl": "w-32 h-32 text-3xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  }
);

const statusVariants = cva(
  "absolute bottom-0 right-0 block rounded-full ring-2 ring-deep-space",
  {
    variants: {
      status: {
        online: "bg-aurora-cyan",
        offline: "bg-moon-gray",
        busy: "bg-solar-orange",
        away: "bg-nebula-purple",
      },
      size: {
        xs: "w-1.5 h-1.5",
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
        xl: "w-5 h-5",
        "2xl": "w-6 h-6",
      },
    },
    defaultVariants: {
      status: "online",
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt: string;
  fallback?: string;
  status?: "online" | "offline" | "busy" | "away";
  badge?: number | string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      shape,
      src,
      alt,
      fallback,
      status,
      badge,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);

    // Generate initials from alt text if no fallback provided
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const displayFallback = fallback || getInitials(alt);

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, shape, className }))}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="bg-gradient-to-br from-aurora-cyan to-aurora-blue w-full h-full flex items-center justify-center">
            {displayFallback}
          </span>
        )}

        {status && (
          <span
            className={cn(statusVariants({ status, size }))}
            aria-label={`Status: ${status}`}
          />
        )}

        {badge !== undefined && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "flex items-center justify-center",
              "min-w-[20px] h-5 px-1.5",
              "bg-red-500 text-white text-xs font-bold rounded-full",
              "ring-2 ring-deep-space"
            )}
            aria-label={`${badge} notifications`}
          >
            {badge}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };
