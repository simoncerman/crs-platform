import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      error,
      icon,
      iconPosition = "left",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-heading text-deep-space/80 dark:text-moon-gray"
          >
            {label}
            {props.required && (
              <span className="text-solar-orange ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-moon-gray pointer-events-none">
              {icon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 rounded-lg",
              "bg-stellar-white dark:bg-cosmic-blue border",
              "text-deep-space dark:text-stellar-white placeholder-moon-gray/50 dark:placeholder-moon-gray",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-aurora-cyan/20 dark:focus:ring-aurora-cyan/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-solar-orange focus:border-solar-orange"
                : "border-moon-gray/30 dark:border-moon-gray/30 focus:border-aurora-cyan dark:focus:border-aurora-cyan",
              icon && iconPosition === "left" && "pl-12",
              icon && iconPosition === "right" && "pr-12",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : helperText ? helperTextId : undefined
            }
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-moon-gray pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {helperText && !error && (
          <p id={helperTextId} className="text-sm text-moon-gray/80 dark:text-moon-gray">
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-solar-orange">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
