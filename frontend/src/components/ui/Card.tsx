import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
  padding?: "sm" | "md" | "lg";
}

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        paddingStyles[padding],
        variant === "elevated" && "shadow-2xl shadow-black/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-2xl font-semibold text-text-primary", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-text-secondary mt-1", className)} {...props}>
      {children}
    </p>
  );
}
