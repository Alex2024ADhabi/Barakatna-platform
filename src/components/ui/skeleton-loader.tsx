import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The width of the skeleton
   * @default "100%"
   */
  width?: string | number;

  /**
   * The height of the skeleton
   * @default "1rem"
   */
  height?: string | number;

  /**
   * Whether to show the skeleton as a circle
   * @default false
   */
  circle?: boolean;

  /**
   * Whether to animate the skeleton
   * @default true
   */
  animate?: boolean;
}

/**
 * Skeleton component for showing loading state
 */
export function Skeleton({
  className,
  width = "100%",
  height = "1rem",
  circle = false,
  animate = true,
  ...props
}: SkeletonProps) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        "bg-muted rounded-md",
        animate && "animate-pulse",
        circle && "rounded-full",
        className,
      )}
      style={{
        width: widthStyle,
        height: heightStyle,
        ...(circle && { aspectRatio: "1/1" }),
      }}
      {...props}
    />
  );
}

/**
 * Text skeleton component for showing loading state for text
 */
export function TextSkeleton({
  lines = 1,
  lastLineWidth = "100%",
  className,
  ...props
}: {
  lines?: number;
  lastLineWidth?: string | number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={
            i === lines - 1 && lastLineWidth !== "100%" ? lastLineWidth : "100%"
          }
          height="1rem"
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton component for showing loading state for cards
 */
export function CardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm space-y-3",
        className,
      )}
      {...props}
    >
      <Skeleton height={24} width="60%" />
      <TextSkeleton lines={3} lastLineWidth="40%" />
      <div className="pt-2">
        <Skeleton height={36} />
      </div>
    </div>
  );
}

/**
 * Table skeleton component for showing loading state for tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  ...props
}: {
  rows?: number;
  columns?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} height={24} className="flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              height={20}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton component for showing loading state for forms
 */
export function FormSkeleton({
  fields = 4,
  className,
  ...props
}: {
  fields?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width={120} height={16} />
          <Skeleton height={40} />
        </div>
      ))}
      <div className="pt-2 flex justify-end">
        <Skeleton width={120} height={40} />
      </div>
    </div>
  );
}
