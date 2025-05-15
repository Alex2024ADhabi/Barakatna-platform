import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceTemplate } from "@/lib/api/financial/types";
import { Plus, Edit, Trash2, Save, X, Eye } from "lucide-react";

// Define the form schema with Zod
const invoiceTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  headerContent: z.string().optional(),
  footerContent: z.string().optional(),
  termsAndConditions: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  isDefault: z.boolean().default(false),
});

type InvoiceTemplateFormValues = z.infer<typeof invoiceTemplateSchema>;

interface InvoiceTemplateEditorProps {}

const InvoiceTemplateEditor: React.FC<InvoiceTemplateEditorProps> = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<InvoiceTemplate | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Initialize the form
  const form = useForm<InvoiceTemplateFormValues>({
    resolver: zodResolver(invoiceTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      headerContent: "<h1>INVOICE</h1>",
      footerContent: "<p>Thank you for your business</p>",
      termsAndConditions: "Standard terms and conditions apply",
      logoUrl: "",
      primaryColor: "#4f46e5",
      secondaryColor: "#e5e7eb",
      isDefault: false,
    },
  });

  // Load invoice templates
  useEffect(() => {
    // In a real app, this would fetch templates from the API
    // For now, we'll use mock data
    const mockTemplates: InvoiceTemplate[] = [
      {
        id: "tpl-001",
        name: "Standard Template",
        description: "Default invoice template for all clients",
        headerContent: "<h1>INVOICE</h1>",
        footerContent: "<p>Thank you for your business</p>",
        termsAndConditions: "Standard terms and conditions apply",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#4f46e5",
        secondaryColor: "#e5e7eb",
        isDefault: true,
        createdBy: "system",
        createdAt: new Date(),
      },
      {
        id: "tpl-002",
        name: "FDF Template",
        description: "Custom template for FDF clients",
        headerContent: "<h1>FDF INVOICE</h1>",
        footerContent: "<p>Thank you for your partnership with FDF</p>",
        termsAndConditions: "FDF specific terms and conditions apply",
        logoUrl: "https://example.com/fdf-logo.png",
        primaryColor: "#1e40af",
        secondaryColor: "#bfdbfe",
        isDefault: false,
        createdBy: "system",
        createdAt: new Date(),
      },
    ];

    setTemplates(mockTemplates);
  }, []);

  // Handle edit template
  const handleEditTemplate = (template: InvoiceTemplate) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      description: template.description || "",
      headerContent: template.headerContent || "",
      footerContent: template.footerContent || "",
      termsAndConditions: template.termsAndConditions || "",
      logoUrl: template.logoUrl || "",
      primaryColor: template.primaryColor || "#4f46e5",
      secondaryColor: template.secondaryColor || "#e5e7eb",
      isDefault: template.isDefault,
    });
    setShowForm(true);
    setActiveTab("editor");
  };

  // Handle create new template
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    form.reset({
      name: "",
      description: "",
      headerContent: "<h1>INVOICE</h1>",
      footerContent: "<p>Thank you for your business</p>",
      termsAndConditions: "Standard terms and conditions apply",
      logoUrl: "",
      primaryColor: "#4f46e5",
      secondaryColor: "#e5e7eb",
      isDefault: false,
    });
    setShowForm(true);
    setActiveTab("editor");
  };

  // Handle delete template
  const handleDeleteTemplate = (id: string) => {
    if (
      window.confirm(
        t("Are you sure you want to delete this invoice template?"),
      )
    ) {
      // In a real app, this would call the API to delete the template
      setTemplates(templates.filter((template) => template.id !== id));
    }
  };

  // Handle preview
  const handlePreview = () => {
    const formData = form.getValues();
    // Generate a preview HTML based on the template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            color: ${formData.primaryColor};
            border-bottom: 2px solid ${formData.secondaryColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 2px solid ${formData.secondaryColor};
            color: #666;
          }
          .terms {
            margin-top: 30px;
            padding: 10px;
            background-color: ${formData.secondaryColor};
            font-size: 0.9em;
          }
          .logo {
            max-height: 80px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${formData.logoUrl ? `<img src="${formData.logoUrl}" class="logo" alt="Logo">` : ""}
          <div class="header">
            ${formData.headerContent || ""}
          </div>
          
          <!-- Sample Invoice Content -->
          <div class="invoice-content">
            <h2>Invoice #INV-2023-001</h2>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}</p>
            
            <h3>Bill To:</h3>
            <p>Client Name<br>
            Client Address<br>
            City, Region, Country</p>
            
            <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: ${formData.secondaryColor};">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Unit Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">Service Item 1</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">1</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">1,000.00 SAR</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">1,000.00 SAR</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">Service Item 2</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">2</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">500.00 SAR</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">1,000.00 SAR</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">2,000.00 SAR</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">VAT (15%):</td>
                  <td style="padding: 10px; text-align: right;">300.00 SAR</td>
                </tr>
                <tr style="color: ${formData.primaryColor}; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
                  <td style="padding: 10px; text-align: right;">2,300.00 SAR</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="terms">
            <h4>Terms and Conditions</h4>
            <p>${formData.termsAndConditions || ""}</p>
          </div>
          
          <div class="footer">
            ${formData.footerContent || ""}
          </div>
        </div>
      </body>
      </html>
    `;

    setPreviewHtml(html);
    setActiveTab("preview");
  };

  // Handle form submission
  const onSubmit = (data: InvoiceTemplateFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would call the API to create/update the template
      if (editingTemplate) {
        // Update existing template
        const updatedTemplates = templates.map((template) =>
          template.id === editingTemplate.id
            ? {
                ...template,
                ...data,
                updatedBy: "current-user",
                updatedAt: new Date(),
              }
            : template,
        );
        setTemplates(updatedTemplates);
      } else {
        // Create new template
        const newTemplate: InvoiceTemplate = {
          id: `tpl-${Date.now().toString(36)}`,
          ...data,
          createdBy: "current-user",
          createdAt: new Date(),
        };
        setTemplates([...templates, newTemplate]);
      }

      // Reset form and close
      setShowForm(false);
      setEditingTemplate(null);
    } catch (err) {
      setError("An error occurred while saving the invoice template");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("Invoice Templates")}</CardTitle>
            <CardDescription>
              {t("Create and manage invoice templates")}
            </CardDescription>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Template")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {showForm ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="editor">{t("Editor")}</TabsTrigger>
              <TabsTrigger value="preview">{t("Preview")}</TabsTrigger>
            </TabsList>

            <TabsContent value="editor">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Template Name")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("e.g., Standard Template")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Description")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("e.g., Default invoice template")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Logo URL")}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                "e.g., https://example.com/logo.png",
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Primary Color")}</FormLabel>
                            <div className="flex space-x-2">
                              <div
                                className="w-8 h-8 rounded-md border"
                                style={{ backgroundColor: field.value }}
                              />
                              <FormControl>
                                <Input {...field} type="color" />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Secondary Color")}</FormLabel>
                            <div className="flex space-x-2">
                              <div
                                className="w-8 h-8 rounded-md border"
                                style={{ backgroundColor: field.value }}
                              />
                              <FormControl>
                                <Input {...field} type="color" />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="headerContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Header Content (HTML)")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t("e.g., <h1>INVOICE</h1>")}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("HTML content for the invoice header")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="footerContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Footer Content (HTML)")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              "e.g., <p>Thank you for your business</p>",
                            )}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("HTML content for the invoice footer")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Terms and Conditions")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t(
                              "e.g., Standard terms and conditions apply",
                            )}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t("Default Template")}</FormLabel>
                          <FormDescription>
                            {t(
                              "Use this template as the default for new invoices",
                            )}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      disabled={loading}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("Preview")}
                    </Button>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t("Cancel")}
                      </Button>
                      <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {editingTemplate
                          ? t("Update Template")
                          : t("Create Template")}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {t("Template Preview")}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("editor")}
                  >
                    {t("Back to Editor")}
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <iframe
                    srcDoc={previewHtml}
                    title="Template Preview"
                    className="w-full h-[600px]"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("No invoice templates found")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead>{t("Default")}</TableHead>
                    <TableHead>{t("Created By")}</TableHead>
                    <TableHead>{t("Created At")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>
                        {template.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {t("Default")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{template.createdBy}</TableCell>
                      <TableCell>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={template.isDefault}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceTemplateEditor;
