import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { Loader2 } from "lucide-react";

interface FormContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelLabel?: string;
  isValid?: boolean;
  isDirty?: boolean;
  className?: string;
  footerClassName?: string;
  showDirtyWarning?: boolean;
}

/**
 * FormContainer component that provides a consistent layout for forms
 * with header, content, and footer sections
 */
export function FormContainer({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isValid = true,
  isDirty = false,
  className = "",
  footerClassName = "",
  showDirtyWarning = true,
}: FormContainerProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const handleCancel = () => {
    if (isDirty && showDirtyWarning) {
      setShowUnsavedWarning(true);
    } else if (onCancel) {
      onCancel();
    }
  };

  const confirmCancel = () => {
    setShowUnsavedWarning(false);
    if (onCancel) onCancel();
  };

  const cancelWarning = () => {
    setShowUnsavedWarning(false);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showUnsavedWarning && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertDescription className="flex justify-between items-center">
              <span>
                You have unsaved changes. Are you sure you want to cancel?
              </span>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={cancelWarning}>
                  No, continue editing
                </Button>
                <Button size="sm" variant="destructive" onClick={confirmCancel}>
                  Yes, discard changes
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          {children}

          <CardFooter
            className={`flex justify-end space-x-2 pt-6 px-0 ${footerClassName}`}
          >
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
            )}

            {onSubmit && (
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitLabel}
              </Button>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
