import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for managing optimistic updates in the UI
 * @param updateFn Function to perform the actual update
 * @param options Configuration options
 * @returns Object with update function, loading state, and error state
 */
export function useOptimisticUpdate<T, P = any>(
  updateFn: (params: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
  },
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = useCallback(
    async (params: P) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateFn(params);
        setData(result);

        if (options?.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          });
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);
        console.error("Error in optimistic update:", err);

        if (options?.errorMessage) {
          toast({
            title: "Error",
            description: options.errorMessage,
            variant: "destructive",
          });
        }

        if (options?.onError) {
          options.onError(err);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateFn, options, toast],
  );

  return {
    execute,
    isLoading,
    error,
    data,
    reset: useCallback(() => {
      setError(null);
      setData(null);
    }, []),
  };
}
