import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimisticListProps<T> {
  /** The items to display in the list */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Function to get a unique key for each item */
  getKey: (item: T) => string | number;
  /** Whether the list is loading */
  isLoading?: boolean;
  /** Whether the list has an error */
  error?: any;
  /** Message to display when there are no items */
  emptyMessage?: React.ReactNode;
  /** Message to display when there is an error */
  errorMessage?: React.ReactNode;
  /** Additional class names for the list container */
  className?: string;
  /** Additional class names for each list item */
  itemClassName?: string;
  /** Whether to show a loading skeleton when loading */
  showSkeleton?: boolean;
  /** Number of skeleton items to show when loading */
  skeletonCount?: number;
  /** Function to render a skeleton item */
  renderSkeleton?: () => React.ReactNode;
}

/**
 * OptimisticList component for displaying lists with loading, error, and empty states
 * Supports optimistic updates by allowing items to be updated before the server responds
 */
export function OptimisticList<T>({
  items,
  renderItem,
  getKey,
  isLoading = false,
  error = null,
  emptyMessage = "No items found",
  errorMessage = "An error occurred while loading items",
  className,
  itemClassName,
  showSkeleton = true,
  skeletonCount = 3,
  renderSkeleton,
}: OptimisticListProps<T>) {
  const [optimisticItems, setOptimisticItems] = useState<T[]>(items);

  // Update optimistic items when actual items change
  useEffect(() => {
    setOptimisticItems(items);
  }, [items]);

  // Function to optimistically update an item
  const updateItem = (key: string | number, updater: (item: T) => T) => {
    setOptimisticItems((currentItems) =>
      currentItems.map((item) => (getKey(item) === key ? updater(item) : item)),
    );
  };

  // Function to optimistically add an item
  const addItem = (item: T) => {
    setOptimisticItems((currentItems) => [...currentItems, item]);
  };

  // Function to optimistically remove an item
  const removeItem = (key: string | number) => {
    setOptimisticItems((currentItems) =>
      currentItems.filter((item) => getKey(item) !== key),
    );
  };

  // Render loading state
  if (isLoading && !optimisticItems.length && showSkeleton) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className={cn("animate-pulse", itemClassName)}>
            {renderSkeleton ? (
              renderSkeleton()
            ) : (
              <div className="h-16 bg-muted rounded-md" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error && !optimisticItems.length) {
    return (
      <div className={cn("p-4 text-center text-destructive", className)}>
        {typeof errorMessage === "string" ? (
          <p>{errorMessage}</p>
        ) : (
          errorMessage
        )}
      </div>
    );
  }

  // Render empty state
  if (!optimisticItems.length) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        {typeof emptyMessage === "string" ? (
          <p>{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
      </div>
    );
  }

  // Render list
  return (
    <div className={cn("space-y-2", className)}>
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Updating...</span>
        </div>
      )}
      {optimisticItems.map((item, index) => (
        <div key={getKey(item)} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
