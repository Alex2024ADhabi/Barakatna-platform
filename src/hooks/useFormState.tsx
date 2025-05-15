import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Custom hook for managing form state with dirty tracking and confirmation
 * @param initialState Initial form data
 * @param onSubmit Function to call when form is submitted
 * @param options Additional options
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  onSubmit: (data: T) => Promise<boolean> | boolean,
  options?: {
    confirmationMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    resetOnSubmit?: boolean;
    validateOnChange?: boolean;
    validate?: (data: T) => Record<string, string> | null;
  },
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [originalData, setOriginalData] = useState<T>(initialState);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(originalData);
    setIsDirty(false);
    setErrors({});
  }, [originalData]);

  // Update form data
  const updateFormData = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Validate if option is enabled
        if (options?.validateOnChange && options.validate) {
          const validationErrors = options.validate(newData);
          if (validationErrors) {
            setErrors(validationErrors);
          } else {
            // Clear error for this field if it was previously set
            if (errors[field as string]) {
              const newErrors = { ...errors };
              delete newErrors[field as string];
              setErrors(newErrors);
            }
          }
        }

        return newData;
      });
      setIsDirty(true);
    },
    [errors, options],
  );

  // Bulk update form data
  const bulkUpdateFormData = useCallback(
    (updates: Partial<T>) => {
      setFormData((prev) => {
        const newData = { ...prev, ...updates };

        // Validate if option is enabled
        if (options?.validateOnChange && options.validate) {
          const validationErrors = options.validate(newData as T);
          setErrors(validationErrors || {});
        }

        return newData as T;
      });
      setIsDirty(true);
    },
    [options],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Validate form data
      if (options?.validate) {
        const validationErrors = options.validate(formData);
        if (validationErrors) {
          setErrors(validationErrors);
          return false;
        }
      }

      setIsSubmitting(true);
      try {
        const result = await onSubmit(formData);

        if (result) {
          if (options?.successMessage) {
            toast({
              title: "Success",
              description: options.successMessage,
            });
          }

          if (options?.resetOnSubmit) {
            setOriginalData(formData);
            setIsDirty(false);
          }

          return true;
        } else {
          if (options?.errorMessage) {
            toast({
              title: "Error",
              description: options.errorMessage,
              variant: "destructive",
            });
          }
          return false;
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Error",
          description:
            options?.errorMessage ||
            "An error occurred while submitting the form",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit, options, toast],
  );

  // Check for unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          options?.confirmationMessage ||
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, options?.confirmationMessage]);

  return {
    formData,
    updateFormData,
    bulkUpdateFormData,
    handleSubmit,
    resetForm,
    isDirty,
    isSubmitting,
    errors,
    setErrors,
  };
}
