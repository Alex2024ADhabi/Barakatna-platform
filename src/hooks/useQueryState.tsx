import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook for managing API query state with loading, error handling, and caching
 * @param queryFn Function that returns a promise with the query result
 * @param options Additional options
 */
export function useQueryState<T>(
  queryFn: () => Promise<T>,
  options?: {
    initialData?: T;
    key?: string;
    cacheTime?: number;
    staleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
  },
) {
  const [data, setData] = useState<T | undefined>(options?.initialData);
  const [isLoading, setIsLoading] = useState(options?.enabled !== false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const { toast } = useToast();

  // Generate cache key
  const cacheKey = options?.key || "query-cache";

  // Check cache on mount
  useEffect(() => {
    if (options?.enabled === false) return;

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const { data: cachedValue, timestamp } = JSON.parse(cachedData);
        const isStale = options?.staleTime
          ? Date.now() - timestamp > options.staleTime
          : true;

        if (!isStale) {
          setData(cachedValue);
          setIsLoading(false);
          setLastFetched(timestamp);

          if (options?.onSuccess) {
            options.onSuccess(cachedValue);
          }
          return;
        }
      } catch (e) {
        console.error("Error parsing cached data:", e);
        localStorage.removeItem(cacheKey);
      }
    }

    // No valid cache, fetch data
    fetchData();
  }, [cacheKey, options?.enabled]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      setLastFetched(Date.now());

      // Cache the result
      if (options?.cacheTime !== 0) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          }),
        );
      }

      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error);

      if (options?.onError) {
        options.onError(error);
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch data: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, cacheKey, options, toast]);

  // Refetch data manually
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
    lastFetched,
  };
}
