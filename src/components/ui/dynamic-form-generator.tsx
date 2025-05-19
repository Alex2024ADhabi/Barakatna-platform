import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormMetadata, FormField, FieldType } from "../../lib/forms/types";
import { formRegistry } from "../../lib/forms/registry";

// Import UI components
import {
  Form,
  FormControl,
  FormDescription,
  FormField as UIFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
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
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface DynamicFormGeneratorProps {
  formId: string;
  clientType?: string;
  onSubmit: (data: any) => void;
  initialData?: any;
  readOnly?: boolean;
}

const generateZodSchema = (fields: FormField[]) => {
  const schemaMap: Record<string, any> = {};

  fields.forEach((field) => {
    let fieldSchema;

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
        fieldSchema = z.string();
        if (field.required)
          fieldSchema = fieldSchema.min(1, {
            message: `${field.label} is required`,
          });
        break;
      case FieldType.NUMBER:
        fieldSchema = z.number();
        break;
      case FieldType.DATE:
        fieldSchema = z.string();
        break;
      case FieldType.CHECKBOX:
        fieldSchema = z.boolean();
        break;
      case FieldType.SELECT:
      case FieldType.RADIO:
        fieldSchema = z.string();
        if (field.required)
          fieldSchema = fieldSchema.min(1, {
            message: `${field.label} is required`,
          });
        break;
      case FieldType.MULTISELECT:
        fieldSchema = z.array(z.string());
        if (field.required)
          fieldSchema = fieldSchema.min(1, {
            message: `${field.label} is required`,
          });
        break;
      case FieldType.FILE:
        fieldSchema = z.any();
        break;
      default:
        fieldSchema = z.any();
    }

    if (!field.required && field.type !== FieldType.CHECKBOX) {
      fieldSchema = fieldSchema.optional();
    }

    schemaMap[field.name] = fieldSchema;
  });

  return z.object(schemaMap);
};

const renderField = (
  field: FormField,
  form: any,
  readOnly: boolean = false,
) => {
  return (
    <UIFormField
      key={field.id}
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem className={`w-${field.width || "full"}`}>
          <FormLabel>
            {field.label}
            {field.required ? " *" : ""}
          </FormLabel>
          <FormControl>
            {(() => {
              switch (field.type) {
                case FieldType.TEXT:
                  return (
                    <Input
                      {...formField}
                      placeholder={field.placeholder}
                      disabled={readOnly || field.readOnly}
                    />
                  );
                case FieldType.TEXTAREA:
                  return (
                    <Textarea
                      {...formField}
                      placeholder={field.placeholder}
                      disabled={readOnly || field.readOnly}
                    />
                  );
                case FieldType.NUMBER:
                  return (
                    <Input
                      {...formField}
                      type="number"
                      placeholder={field.placeholder}
                      disabled={readOnly || field.readOnly}
                      onChange={(e) =>
                        formField.onChange(parseFloat(e.target.value))
                      }
                    />
                  );
                case FieldType.DATE:
                  return (
                    <Input
                      {...formField}
                      type="date"
                      disabled={readOnly || field.readOnly}
                    />
                  );
                case FieldType.CHECKBOX:
                  return (
                    <Checkbox
                      checked={formField.value}
                      onCheckedChange={formField.onChange}
                      disabled={readOnly || field.readOnly}
                    />
                  );
                case FieldType.SELECT:
                  return (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                      disabled={readOnly || field.readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={field.placeholder || "Select an option"}
                        />
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
                case FieldType.RADIO:
                  return (
                    <RadioGroup
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                      disabled={readOnly || field.readOnly}
                    >
                      {field.options?.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`${field.name}-${option.value}`}
                          />
                          <label htmlFor={`${field.name}-${option.value}`}>
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  );
                default:
                  return <div>Unsupported field type: {field.type}</div>;
              }
            })()}
          </FormControl>
          {field.helpText && (
            <FormDescription>{field.helpText}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const DynamicFormGenerator: React.FC<DynamicFormGeneratorProps> = ({
  formId,
  clientType,
  onSubmit,
  initialData = {},
  readOnly = false,
}) => {
  const [formMetadata, setFormMetadata] = useState<FormMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        let metadata;

        if (clientType) {
          metadata = formRegistry.getClientSpecificFormMetadata(
            formId,
            clientType as any,
          );
        } else {
          metadata = formRegistry.getFormMetadataById(formId);
        }

        if (!metadata) {
          throw new Error(`Form with ID ${formId} not found`);
        }

        setFormMetadata(metadata);
        if (metadata.sections.length > 0) {
          setActiveTab(metadata.sections[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId, clientType]);

  if (loading) {
    return <div>Loading form...</div>;
  }

  if (error || !formMetadata) {
    return <div>Error: {error || "Failed to load form"}</div>;
  }

  const schema = generateZodSchema(formMetadata.fields);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const renderSectionFields = (sectionId: string) => {
    return formMetadata.fields
      .filter((field) => field.section === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((field) => renderField(field, form, readOnly));
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{formMetadata.title}</CardTitle>
              <CardDescription>{formMetadata.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {formMetadata.sections.length > 1 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    {formMetadata.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <TabsTrigger key={section.id} value={section.id}>
                          {section.title}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                  {formMetadata.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <TabsContent key={section.id} value={section.id}>
                        {section.description && (
                          <p className="text-sm text-gray-500 mb-4">
                            {section.description}
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderSectionFields(section.id)}
                        </div>
                      </TabsContent>
                    ))}
                </Tabs>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSectionFields(formMetadata.sections[0].id)}
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!readOnly && <Button type="submit">Submit</Button>}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
};
