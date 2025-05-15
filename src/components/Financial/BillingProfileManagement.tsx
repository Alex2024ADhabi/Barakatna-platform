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
import { BillingProfile } from "@/lib/api/financial/types";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

// Define the form schema with Zod
const billingProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
  billingAddress: z.string().min(1, "Billing address is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  taxId: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type BillingProfileFormValues = z.infer<typeof billingProfileSchema>;

interface BillingProfileManagementProps {
  clientId: string;
  clientType: string;
}

const BillingProfileManagement: React.FC<BillingProfileManagementProps> = ({
  clientId,
  clientType,
}) => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<BillingProfile | null>(
    null,
  );
  const [showForm, setShowForm] = useState<boolean>(false);

  // Initialize the form
  const form = useForm<BillingProfileFormValues>({
    resolver: zodResolver(billingProfileSchema),
    defaultValues: {
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      billingAddress: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Saudi Arabia",
      taxId: "",
      isDefault: false,
    },
  });

  // Load billing profiles
  useEffect(() => {
    // In a real app, this would fetch profiles from the API
    // For now, we'll use mock data
    const mockProfiles: BillingProfile[] = [
      {
        id: "bp-001",
        clientId,
        clientType,
        name: "Main Office",
        contactName: "Ahmed Al-Mansour",
        contactEmail: "ahmed@example.org",
        contactPhone: "+966 11 123 4567",
        billingAddress: "123 King Fahd Road",
        city: "Riyadh",
        region: "Riyadh Province",
        postalCode: "12345",
        country: "Saudi Arabia",
        taxId: "300000000000003",
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: "bp-002",
        clientId,
        clientType,
        name: "Branch Office",
        contactName: "Mohammed Al-Harbi",
        contactEmail: "mohammed@example.org",
        contactPhone: "+966 11 987 6543",
        billingAddress: "456 Olaya Street",
        city: "Riyadh",
        region: "Riyadh Province",
        postalCode: "54321",
        country: "Saudi Arabia",
        taxId: "300000000000004",
        isDefault: false,
        createdAt: new Date(),
      },
    ];

    setProfiles(mockProfiles);
  }, [clientId, clientType]);

  // Handle edit profile
  const handleEditProfile = (profile: BillingProfile) => {
    setEditingProfile(profile);
    form.reset({
      name: profile.name,
      contactName: profile.contactName || "",
      contactEmail: profile.contactEmail || "",
      contactPhone: profile.contactPhone || "",
      billingAddress: profile.billingAddress,
      city: profile.city,
      region: profile.region,
      postalCode: profile.postalCode || "",
      country: profile.country,
      taxId: profile.taxId || "",
      isDefault: profile.isDefault,
    });
    setShowForm(true);
  };

  // Handle create new profile
  const handleCreateProfile = () => {
    setEditingProfile(null);
    form.reset({
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      billingAddress: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Saudi Arabia",
      taxId: "",
      isDefault: false,
    });
    setShowForm(true);
  };

  // Handle delete profile
  const handleDeleteProfile = (id: string) => {
    if (
      window.confirm(t("Are you sure you want to delete this billing profile?"))
    ) {
      // In a real app, this would call the API to delete the profile
      setProfiles(profiles.filter((profile) => profile.id !== id));
    }
  };

  // Handle form submission
  const onSubmit = (data: BillingProfileFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would call the API to create/update the profile
      if (editingProfile) {
        // Update existing profile
        const updatedProfiles = profiles.map((profile) =>
          profile.id === editingProfile.id
            ? {
                ...profile,
                ...data,
                updatedAt: new Date(),
              }
            : profile,
        );
        setProfiles(updatedProfiles);
      } else {
        // Create new profile
        const newProfile: BillingProfile = {
          id: `bp-${Date.now().toString(36)}`,
          clientId,
          clientType,
          ...data,
          createdAt: new Date(),
        };
        setProfiles([...profiles, newProfile]);
      }

      // Reset form and close
      setShowForm(false);
      setEditingProfile(null);
    } catch (err) {
      setError("An error occurred while saving the billing profile");
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
            <CardTitle>{t("Billing Profiles")}</CardTitle>
            <CardDescription>
              {t("Manage billing profiles for this client")}
            </CardDescription>
          </div>
          <Button onClick={handleCreateProfile}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Add Profile")}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {showForm ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Profile Name")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., Main Office")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Contact Name")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., Ahmed Al-Mansour")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Contact Email")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t("e.g., ahmed@example.org")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Contact Phone")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., +966 11 123 4567")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Billing Address")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., 123 King Fahd Road")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("City")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("e.g., Riyadh")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Region/Province")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., Riyadh Province")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Postal Code")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("e.g., 12345")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Country")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., Saudi Arabia")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Tax ID")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("e.g., 300000000000003")}
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
                        <FormLabel>{t("Default Profile")}</FormLabel>
                        <FormDescription>
                          {t(
                            "Use this profile as the default for new invoices",
                          )}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
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
                  {editingProfile ? t("Update Profile") : t("Create Profile")}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <>
            {profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("No billing profiles found")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Contact")}</TableHead>
                    <TableHead>{t("Address")}</TableHead>
                    <TableHead>{t("Tax ID")}</TableHead>
                    <TableHead>{t("Default")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.name}
                      </TableCell>
                      <TableCell>
                        <div>{profile.contactName}</div>
                        <div className="text-sm text-gray-500">
                          {profile.contactEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{profile.billingAddress}</div>
                        <div className="text-sm text-gray-500">
                          {profile.city}, {profile.region}
                        </div>
                      </TableCell>
                      <TableCell>{profile.taxId || "-"}</TableCell>
                      <TableCell>
                        {profile.isDefault && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {t("Default")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProfile(profile.id)}
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

export default BillingProfileManagement;
