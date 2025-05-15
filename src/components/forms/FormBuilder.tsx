import React, { useState } from "react";
import { FormMetadata, FieldType, FormField } from "@/lib/forms/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface FormBuilderProps {
  formMetadata: FormMetadata;
  onSubmit: (values: Record<string, any>) => void;
  onSaveDraft?: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  isLoading?: boolean;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formMetadata,
  onSubmit,
  onSaveDraft,
  initialValues = {},
  isLoading = false,
}) => {
  const [formValues, setFormValues] =
    useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >(
    formMetadata.sections.reduce(
      (acc, section) => {
        acc[section.id] = section.collapsed || false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const validateField = (field: FormField): string | null => {
    if (!field.validation) return null;

    for (const rule of field.validation) {
      // Skip conditional validations if condition is not met
      if (rule.condition) {
        try {
          // eslint-disable-next-line no-new-func
          const conditionFn = new Function(
            "formValues",
            `return ${rule.condition}`,
          );
          if (!conditionFn(formValues)) continue;
        } catch (error) {
          console.error("Error evaluating validation condition:", error);
          continue;
        }
      }

      const value = formValues[field.name];

      switch (rule.type) {
        case "required":
          if (value === undefined || value === null || value === "") {
            return rule.message || "This field is required";
          }
          break;
        case "minLength":
          if (value && typeof value === "string" && value.length < rule.value) {
            return rule.message || `Minimum length is ${rule.value} characters`;
          }
          break;
        case "maxLength":
          if (value && typeof value === "string" && value.length > rule.value) {
            return rule.message || `Maximum length is ${rule.value} characters`;
          }
          break;
        case "pattern":
          if (
            value &&
            typeof value === "string" &&
            !new RegExp(rule.value).test(value)
          ) {
            return rule.message || "Invalid format";
          }
          break;
        case "email":
          if (
            value &&
            typeof value === "string" &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
          ) {
            return rule.message || "Invalid email address";
          }
          break;
        case "minValue":
          if (
            value !== undefined &&
            value !== null &&
            Number(value) < rule.value
          ) {
            return rule.message || `Minimum value is ${rule.value}`;
          }
          break;
        case "maxValue":
          if (
            value !== undefined &&
            value !== null &&
            Number(value) > rule.value
          ) {
            return rule.message || `Maximum value is ${rule.value}`;
          }
          break;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    formMetadata.fields.forEach((field) => {
      // Skip validation for fields that are not visible due to conditional logic
      if (field.conditional) {
        const {
          field: sourceField,
          operator,
          value: conditionValue,
        } = field.conditional;
        const sourceValue = formValues[sourceField];

        let conditionMet = false;
        switch (operator) {
          case "equals":
            conditionMet = sourceValue === conditionValue;
            break;
          case "notEquals":
            conditionMet = sourceValue !== conditionValue;
            break;
          case "includes":
            conditionMet =
              Array.isArray(sourceValue) &&
              sourceValue.includes(conditionValue);
            break;
          case "notIncludes":
            conditionMet =
              !Array.isArray(sourceValue) ||
              !sourceValue.includes(conditionValue);
            break;
        }

        if (!conditionMet) return;
      }

      const error = validateField(field);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formValues);
    }
  };

  const renderField = (field: FormField) => {
    // Check if field should be rendered based on conditional logic
    if (field.conditional) {
      const {
        field: sourceField,
        operator,
        value: conditionValue,
      } = field.conditional;
      const sourceValue = formValues[sourceField];

      let conditionMet = false;
      switch (operator) {
        case "equals":
          conditionMet = sourceValue === conditionValue;
          break;
        case "notEquals":
          conditionMet = sourceValue !== conditionValue;
          break;
        case "includes":
          conditionMet =
            Array.isArray(sourceValue) && sourceValue.includes(conditionValue);
          break;
        case "notIncludes":
          conditionMet =
            !Array.isArray(sourceValue) ||
            !sourceValue.includes(conditionValue);
          break;
      }

      if (!conditionMet) return null;
    }

    const value =
      formValues[field.name] !== undefined
        ? formValues[field.name]
        : field.defaultValue;
    const error = errors[field.name];

    const commonProps = {
      id: field.id,
      name: field.name,
      disabled: field.readOnly || isLoading,
      placeholder: field.placeholder,
      "aria-invalid": error ? "true" : "false",
    };

    const widthClass = {
      full: "col-span-12",
      half: "col-span-12 md:col-span-6",
      third: "col-span-12 md:col-span-4",
      quarter: "col-span-12 md:col-span-3",
    }[field.width || "full"];

    const fieldWrapper = (
      <div className={cn(widthClass, "mb-4")} key={field.id}>
        <div className="mb-2">
          <Label htmlFor={field.id} className="flex items-center">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {field.helpText && (
            <p className="text-sm text-muted-foreground mt-1">
              {field.helpText}
            </p>
          )}
        </div>

        {/* Field-specific rendering */}
        {renderFieldByType(field, value, commonProps)}

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    );

    return fieldWrapper;
  };

  const renderFieldByType = (
    field: FormField,
    value: any,
    commonProps: any,
  ) => {
    switch (field.type) {
      case FieldType.TEXT:
        return (
          <Input
            {...commonProps}
            type="text"
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={cn(errors[field.name] && "border-red-500")}
          />
        );

      case FieldType.EMAIL:
        return (
          <Input
            {...commonProps}
            type="email"
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={cn(errors[field.name] && "border-red-500")}
          />
        );

      case FieldType.PHONE:
        return (
          <Input
            {...commonProps}
            type="tel"
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={cn(errors[field.name] && "border-red-500")}
          />
        );

      case FieldType.NUMBER:
        return (
          <Input
            {...commonProps}
            type="number"
            value={value || ""}
            onChange={(e) =>
              handleChange(
                field.name,
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className={cn(errors[field.name] && "border-red-500")}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <Textarea
            {...commonProps}
            value={value || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={cn(errors[field.name] && "border-red-500")}
            rows={5}
          />
        );

      case FieldType.SELECT:
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={commonProps.disabled}
          >
            <SelectTrigger
              className={cn(errors[field.name] && "border-red-500")}
            >
              <SelectValue placeholder={commonProps.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case FieldType.MULTISELECT:
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isChecked =
                Array.isArray(value) && value.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={isChecked}
                    disabled={commonProps.disabled}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value)
                        ? [...value]
                        : [];
                      if (checked) {
                        handleChange(field.name, [
                          ...currentValues,
                          option.value,
                        ]);
                      } else {
                        handleChange(
                          field.name,
                          currentValues.filter((v) => v !== option.value),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${option.value}`}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case FieldType.RADIO:
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={commonProps.disabled}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${field.id}-${option.value}`}
                />
                <Label htmlFor={`${field.id}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case FieldType.SWITCH:
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value === true}
              disabled={commonProps.disabled}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label htmlFor={field.id}>{value === true ? "Yes" : "No"}</Label>
          </div>
        );

      case FieldType.DATE:
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  errors[field.name] && "border-red-500",
                )}
                disabled={commonProps.disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? (
                  format(new Date(value), "PPP")
                ) : (
                  <span>{commonProps.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) =>
                  handleChange(
                    field.name,
                    date ? date.toISOString().split("T")[0] : null,
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case FieldType.FILE:
        return (
          <div>
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => {
                // In a real implementation, you would handle file uploads differently
                // This is just a placeholder for the UI
                const files = e.target.files;
                handleChange(field.name, files ? Array.from(files) : null);
              }}
              className={cn(errors[field.name] && "border-red-500")}
              multiple={field.multiple}
            />
            {value && Array.isArray(value) && value.length > 0 && (
              <div className="mt-2">
                <p className="text-sm">{value.length} file(s) selected</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{formMetadata.title}</CardTitle>
        <CardDescription>{formMetadata.description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {formMetadata.sections.map((section) => {
            const isCollapsed = collapsedSections[section.id];
            const sectionFields = formMetadata.fields.filter(
              (field) => field.section === section.id,
            );

            return (
              <div key={section.id} className="mb-8">
                <div
                  className={cn(
                    "flex items-center justify-between mb-4",
                    section.collapsible && "cursor-pointer",
                  )}
                  onClick={() =>
                    section.collapsible && toggleSection(section.id)
                  }
                >
                  <div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                  </div>
                  {section.collapsible && (
                    <Button variant="ghost" size="sm" type="button">
                      {isCollapsed ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </Button>
                  )}
                </div>
                <Separator className="mb-4" />
                {!isCollapsed && (
                  <div className="grid grid-cols-12 gap-4">
                    {sectionFields
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((field) => renderField(field))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex justify-between">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              Save Draft
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FormBuilder;
