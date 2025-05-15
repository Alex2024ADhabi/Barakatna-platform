import React, { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface OptimisticMutationProps<T, R> {
  /** Function to perform the mutation */
  mutationFn: (variables: T) => Promise<R>;
  /** Function to render the component */
  children: ({
    mutate,
    isLoading,
    error,
    data,
  }: {
    mutate: (variables: T) => Promise<R | undefined>;
    isLoading: boolean;
    error: any;
    data: R | null;
  }) => React.ReactNode;
  /** Success message to show after mutation */
  successMessage?: string;
  /** Error message to show if mutation fails */
  errorMessage?: string;
  /** Function to call on success */
  onSuccess?: (data: R) => void;
  /** Function to call on error */
  onError?: (error: any) => void;
}

/**
 * OptimisticMutation component for handling mutations with loading and error states
 * Provides toast notifications for success and error
 */
export function OptimisticMutation<T, R>({
  mutationFn,
  children,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}: OptimisticMutationProps<T, R>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<R | null>(null);
  const { toast } = useToast();

  const mutate = useCallback(
    async (variables: T) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);

        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);
        console.error("Mutation error:", err);

        if (errorMessage) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        if (onError) {
          onError(err);
        }

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, successMessage, errorMessage, onSuccess, onError, toast],
  );

  return <>{children({ mutate, isLoading, error, data })}</>;
}
