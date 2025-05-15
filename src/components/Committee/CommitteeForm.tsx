import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Committee } from "@/lib/api/committee/types";

interface CommitteeFormProps {
  committee: Committee | null;
  onSave: (data: Partial<Committee>) => void;
  onCancel: () => void;
}

const CommitteeForm: React.FC<CommitteeFormProps> = ({
  committee,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  const form = useForm<Partial<Committee>>({
    defaultValues: {
      name: committee?.name || "",
      description: committee?.description || "",
      type: committee?.type || "",
      clientTypeId: committee?.clientTypeId || 1,
      isActive: committee?.isActive ?? true,
    },
  });

  const handleSubmit = (data: Partial<Committee>) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("committee.name", "Name")}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t("committee.description", "Description")}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          rules={{ required: "Type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("committee.type", "Type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select committee type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Assessment">
                    {t("committee.types.assessment", "Assessment")}
                  </SelectItem>
                  <SelectItem value="Financial">
                    {t("committee.types.financial", "Financial")}
                  </SelectItem>
                  <SelectItem value="Quality">
                    {t("committee.types.quality", "Quality")}
                  </SelectItem>
                  <SelectItem value="Project">
                    {t("committee.types.project", "Project")}
                  </SelectItem>
                  <SelectItem value="Executive">
                    {t("committee.types.executive", "Executive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientTypeId"
          rules={{ required: "Client type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("committee.clientType", "Client Type")}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">
                    {t("clientType.fdf", "Family Development Foundation")}
                  </SelectItem>
                  <SelectItem value="2">
                    {t("clientType.adha", "Abu Dhabi Housing Authority")}
                  </SelectItem>
                  <SelectItem value="3">
                    {t("clientType.cash", "Cash-Based Client")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>{t("committee.active", "Active")}</FormLabel>
                <FormDescription>
                  {t(
                    "committee.activeDescription",
                    "Inactive committees won't appear in selection lists",
                  )}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button type="submit">
            {committee
              ? t("common.update", "Update")
              : t("common.create", "Create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommitteeForm;
