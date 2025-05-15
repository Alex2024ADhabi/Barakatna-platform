import React, { useState } from "react";
import { useFormState } from "@/hooks/useFormState";
import { Button } from "./button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./card";

interface OptimisticFormProps<T extends Record<string, any>> {
  /** Initial form data */
  initialData: T;
  /** Function to call when form is submitted */
  onSubmit: (data: T) => Promise<boolean>;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Function to render form fields */
  children: ({
    formData,
    updateFormData,
    errors,
  }: {
    formData: T;
    updateFormData: (field: keyof T, value: any) => void;
    errors: Record<string, string>;
  }) => React.ReactNode;
  /** Function to validate form data */
  validate?: (data: T) => Record<string, string> | null;
  /** Success message to show after submission */
  successMessage?: string;
  /** Error message to show if submission fails */
  errorMessage?: string;
  /** Whether to reset form after submission */
  resetOnSubmit?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Additional class name */
  className?: string;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Function to call when cancel button is clicked */
  onCancel?: () => void;
}

/**
 * OptimisticForm component for handling form state and submission
 * Uses useFormState hook for state management
 */
export function OptimisticForm<T extends Record<string, any>>({
  initialData,
  onSubmit,
  title,
  description,
  children,
  validate,
  successMessage = "Form submitted successfully",
  errorMessage = "An error occurred while submitting the form",
  resetOnSubmit = false,
  validateOnChange = true,
  className,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
}: OptimisticFormProps<T>) {
  const {
    formData,
    updateFormData,
    handleSubmit,
    resetForm,
    isDirty,
    isSubmitting,
    errors,
  } = useFormState<T>(initialData, onSubmit, {
    successMessage,
    errorMessage,
    resetOnSubmit,
    validateOnChange,
    validate,
  });

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {children({ formData, updateFormData, errors })}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
