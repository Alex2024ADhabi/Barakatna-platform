import React, { useState, useEffect } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ClientType, FormField, FormSection } from "@/lib/forms/types";
import { dynamicFormEngine } from "@/lib/services/DynamicFormEngine";
import { formRegistry } from "@/lib/forms/registry";

// UI Components
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Separator } from "./separator";
import { Switch } from "./switch";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicFormProps {
  formId: string;
  clientType: ClientType;
  recordId?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  userId?: string;
}

export function DynamicForm({
  formId,
  clientType,
  recordId,
  onSubmit,
  onCancel,
  userId,
}: DynamicFormProps) {
  const [formConfig, setFormConfig] = useState<{
    sections: FormSection[];
    fields: FormField[];
    title: string;
    description: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  // Initialize form
  const methods = useForm({
    mode: "onBlur",
    // We'll build the schema dynamically once we have the form config
  });

  // Load form configuration
  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        // Get form configuration
        const config = dynamicFormEngine.generateFormConfig(
          formId,
          clientType,
          userId,
        );
        if (!config) {
          setError("Failed to load form configuration");
          setLoading(false);
          return;
        }

        setFormConfig(config);

        // Set active tab to first section
        if (config.sections.length > 0) {
          setActiveTab(config.sections[0].id);
        }

        // Initialize form state
        const initialState = dynamicFormEngine.initializeFormState(
          formId,
          clientType,
          userId,
        );

        // If recordId is provided, load existing data
        if (recordId) {
          const result = await dynamicFormEngine.loadFormData(
            formId,
            recordId,
            clientType,
          );

          if (result.success && result.data) {
            // Reset form with loaded data
            methods.reset(result.data);
          } else {
            console.error("Failed to load form data:", result.error);
            // Still use the initial state
            methods.reset(initialState);
          }
        } else {
          // Reset form with initial state
          methods.reset(initialState);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading form:", err);
        setError(`Failed to load form: ${err}`);
        setLoading(false);
      }
    };

    loadFormConfig();
  }, [formId, clientType, recordId, userId]);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Validate form
      const validation = dynamicFormEngine.validateForm(
        formId,
        clientType,
        data,
      );
      if (!validation.valid) {
        // Display validation errors
        Object.entries(validation.errors).forEach(([field, errors]) => {
          methods.setError(field as any, {
            type: "manual",
            message: errors[0],
          });
        });
        return;
      }

      // Submit form
      const result = await dynamicFormEngine.submitForm(
        formId,
        clientType,
        data,
      );
      if (result.success) {
        // Call onSubmit callback with result
        if (onSubmit) {
          onSubmit(result.data);
        }
      } else {
        // Handle submission error
        setError(`Failed to submit form: ${result.error}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(`Failed to submit form: ${err}`);
    }
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    // Process field dependencies
    dynamicFormEngine.processFieldChange(
      formId,
      fieldName,
      value,
      clientType,
      userId,
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading form...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!formConfig) {
    return <div className="p-8 text-center">Form configuration not found</div>;
  }

  // Render form field based on type
  const renderField = (field: FormField) => {
    const {
      id,
      name,
      label,
      type,
      placeholder,
      helpText,
      required,
      readOnly,
      hidden,
      options,
    } = field;

    if (hidden) return null;

    // Common props for all field types
    const commonProps = {
      id: id,
      disabled: readOnly,
      placeholder: placeholder || `Enter ${label}`,
      "aria-label": label,
    };

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "phone":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...commonProps}
                    type={type === "password" ? "password" : "text"}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(name, e.target.value);
                    }}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <Textarea
                    {...commonProps}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange(name, e.target.value);
                    }}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...commonProps}
                    type="number"
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
                      field.onChange(value);
                      handleFieldChange(name, value);
                    }}
                    className={fieldState.error ? "border-red-500" : ""}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Controller
              name={name}
              control={methods.control}
              render={({ field }) => (
                <Checkbox
                  id={id}
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    handleFieldChange(name, checked);
                  }}
                  disabled={readOnly}
                />
              )}
            />
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {helpText && (
              <p className="text-sm text-muted-foreground ml-2">{helpText}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            <Label>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <RadioGroup
                    disabled={readOnly}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange(name, value);
                    }}
                    className="flex flex-col space-y-1"
                  >
                    {options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`${id}-${option.value}`}
                        />
                        <Label htmlFor={`${id}-${option.value}`}>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    disabled={readOnly}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange(name, value);
                    }}
                  >
                    <SelectTrigger
                      id={id}
                      className={fieldState.error ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={placeholder || `Select ${label}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "multiselect":
        // This is a simplified implementation - in a real app, you'd want a proper multi-select component
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <div className="border rounded-md p-3">
                    {options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <Checkbox
                          id={`${id}-${option.value}`}
                          checked={(field.value || []).includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = [...(field.value || [])];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((v) => v !== option.value);
                            field.onChange(newValues);
                            handleFieldChange(name, newValues);
                          }}
                          disabled={readOnly}
                        />
                        <Label htmlFor={`${id}-${option.value}`}>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Controller
              name={name}
              control={methods.control}
              render={({ field, fieldState }) => (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={id}
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          fieldState.error && "border-red-500",
                        )}
                        disabled={readOnly}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>{placeholder || "Select date"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          const value = date
                            ? format(date, "yyyy-MM-dd")
                            : null;
                          field.onChange(value);
                          handleFieldChange(name, value);
                        }}
                        disabled={readOnly}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
            {helpText && (
              <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
          </div>
        );

      case "switch":
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={id}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {helpText && (
                <p className="text-sm text-muted-foreground">{helpText}</p>
              )}
            </div>
            <Controller
              name={name}
              control={methods.control}
              render={({ field }) => (
                <Switch
                  id={id}
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    handleFieldChange(name, checked);
                  }}
                  disabled={readOnly}
                />
              )}
            />
          </div>
        );

      // Add more field types as needed

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <p className="text-sm text-muted-foreground">
              Field type '{type}' not implemented yet
            </p>
          </div>
        );
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{formConfig.title}</CardTitle>
            <CardDescription>{formConfig.description}</CardDescription>
          </CardHeader>

          <CardContent>
            {formConfig.sections.length > 1 ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {formConfig.sections.map((section) => (
                    <TabsTrigger key={section.id} value={section.id}>
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {formConfig.sections.map((section) => (
                  <TabsContent
                    key={section.id}
                    value={section.id}
                    className="space-y-4 mt-4"
                  >
                    {section.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {section.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formConfig.fields
                        .filter((field) => field.section === section.id)
                        .map((field) => (
                          <div
                            key={field.id}
                            className={cn(
                              field.width === "full" ? "md:col-span-2" : "",
                              field.width === "half" ? "" : "",
                              field.width === "third" ? "md:col-span-1" : "",
                              field.width === "quarter"
                                ? "md:col-span-1 lg:col-span-1"
                                : "",
                            )}
                          >
                            {renderField(field)}
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              // Single section form
              <div className="space-y-6">
                {formConfig.sections[0]?.description && (
                  <p className="text-sm text-muted-foreground">
                    {formConfig.sections[0].description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formConfig.fields.map((field) => (
                    <div
                      key={field.id}
                      className={cn(
                        field.width === "full" ? "md:col-span-2" : "",
                        field.width === "half" ? "" : "",
                        field.width === "third" ? "md:col-span-1" : "",
                        field.width === "quarter"
                          ? "md:col-span-1 lg:col-span-1"
                          : "",
                      )}
                    >
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">{recordId ? "Update" : "Submit"}</Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}
