import React from "react";
import { FormMetadata } from "@/lib/forms/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FormPreviewProps {
  formMetadata: FormMetadata;
}

const FormPreview: React.FC<FormPreviewProps> = ({ formMetadata }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{formMetadata.title}</CardTitle>
        <CardDescription>{formMetadata.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {formMetadata.sections.map((section) => {
            const sectionFields = formMetadata.fields.filter(
              (field) => field.section === section.id,
            );

            return (
              <div key={section.id} className="mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                </div>
                <Separator className="mb-4" />
                <div className="grid grid-cols-12 gap-4">
                  {sectionFields
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((field) => {
                      const widthClass = {
                        full: "col-span-12",
                        half: "col-span-12 md:col-span-6",
                        third: "col-span-12 md:col-span-4",
                        quarter: "col-span-12 md:col-span-3",
                      }[field.width || "full"];

                      return (
                        <div className={cn(widthClass, "mb-4")} key={field.id}>
                          <div className="mb-2">
                            <p className="font-medium">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </p>
                            {field.helpText && (
                              <p className="text-sm text-muted-foreground">
                                {field.helpText}
                              </p>
                            )}
                          </div>
                          <div className="p-2 border rounded-md bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                              {field.placeholder || `[${field.type}]`}
                            </p>
                          </div>
                          {field.conditional && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Conditional: Shown when {field.conditional.field}{" "}
                              {field.conditional.operator}{" "}
                              {typeof field.conditional.value === "boolean"
                                ? field.conditional.value
                                  ? "true"
                                  : "false"
                                : field.conditional.value}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {formMetadata.dependencies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Dependencies</h3>
              <Separator className="mb-4" />
              <ul className="list-disc pl-5 space-y-2">
                {formMetadata.dependencies.map((dependency, index) => (
                  <li key={index}>
                    <p>
                      <span className="font-medium">{dependency.formId}</span>:{" "}
                      {dependency.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {dependency.type}, Required:{" "}
                      {dependency.required ? "Yes" : "No"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Form Metadata</h3>
            <Separator className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Form ID</p>
                <p className="text-sm">{formMetadata.id}</p>
              </div>
              <div>
                <p className="font-medium">Module</p>
                <p className="text-sm">{formMetadata.module}</p>
              </div>
              <div>
                <p className="font-medium">Version</p>
                <p className="text-sm">{formMetadata.version}</p>
              </div>
              <div>
                <p className="font-medium">Client Types</p>
                <p className="text-sm">{formMetadata.clientTypes.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm">
                  {formMetadata.createdAt instanceof Date
                    ? formMetadata.createdAt.toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Updated</p>
                <p className="text-sm">
                  {formMetadata.updatedAt instanceof Date
                    ? formMetadata.updatedAt.toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm">
                  {formMetadata.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormPreview;
