import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { caseApi } from "@/lib/api/case/caseApi";
import { Case, CaseStatus, CasePriority, CaseType } from "@/lib/api/case/types";

interface CaseFormProps {
  initialData?: Partial<Case>;
  onSubmit: (data: Partial<Case>) => void;
  onCancel: () => void;
}

export default function CaseForm({
  initialData,
  onSubmit,
  onCancel,
}: CaseFormProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [formData, setFormData] = useState<Partial<Case>>(
    initialData || {
      beneficiaryName: "",
      beneficiaryId: "",
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      type: "fdf" as CaseType,
      address: "",
      contactPhone: "",
      contactEmail: "",
      tags: [],
      totalBudget: 0,
      caseNumber: `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split("T")[0],
    },
  );
  const [tagInput, setTagInput] = useState("");
  const [date, setDate] = useState<Date | undefined>(
    formData.estimatedCompletionDate
      ? new Date(formData.estimatedCompletionDate)
      : undefined,
  );

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const newTags = [...(formData.tags || []), tagInput.trim()];
      setFormData((prev) => ({ ...prev, tags: newTags }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = formData.tags?.filter((t) => t !== tag) || [];
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    const requiredFields = [
      "beneficiaryName",
      "beneficiaryId",
      "title",
      "description",
      "address",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      alert(t("Please fill in all required fields"));
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData ? t("Edit Case") : t("Create New Case")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("Case Title")}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder={t("Enter case title")}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiaryName">
                    {t("Beneficiary Name")}
                  </Label>
                  <Input
                    id="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={(e) =>
                      handleChange("beneficiaryName", e.target.value)
                    }
                    placeholder={t("Enter beneficiary name")}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="beneficiaryId">{t("Beneficiary ID")}</Label>
                  <Input
                    id="beneficiaryId"
                    value={formData.beneficiaryId}
                    onChange={(e) =>
                      handleChange("beneficiaryId", e.target.value)
                    }
                    placeholder={t("Enter beneficiary ID")}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">{t("Address")}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder={t("Enter address")}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">{t("Contact Phone")}</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        handleChange("contactPhone", e.target.value)
                      }
                      placeholder={t("Enter phone number")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactEmail">{t("Contact Email")}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        handleChange("contactEmail", e.target.value)
                      }
                      placeholder={t("Enter email address")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">{t("Description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder={t("Enter case description")}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">{t("Status")}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleChange("status", value as CaseStatus)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue
                          placeholder={t("Select status")}
                        ></SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("Pending")}</SelectItem>
                        <SelectItem value="in-progress">
                          {t("In Progress")}
                        </SelectItem>
                        <SelectItem value="completed">
                          {t("Completed")}
                        </SelectItem>
                        <SelectItem value="on-hold">{t("On Hold")}</SelectItem>
                        <SelectItem value="cancelled">
                          {t("Cancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">{t("Priority")}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        handleChange("priority", value as CasePriority)
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue
                          placeholder={t("Select priority")}
                        ></SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t("Low")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="high">{t("High")}</SelectItem>
                        <SelectItem value="urgent">{t("Urgent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">{t("Case Type")}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleChange("type", value as CaseType)
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue
                        placeholder={t("Select case type")}
                      ></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fdf">{t("FDF")}</SelectItem>
                      <SelectItem value="adha">{t("ADHA")}</SelectItem>
                      <SelectItem value="cash">{t("Cash")}</SelectItem>
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedCompletionDate">
                    {t("Estimated Completion Date")}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : t("Select a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => {
                          setDate(date);
                          handleChange(
                            "estimatedCompletionDate",
                            date?.toISOString(),
                          );
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="totalBudget">
                    {t("Total Budget (SAR)")}:
                  </Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    value={formData.totalBudget || ""}
                    onChange={(e) =>
                      handleChange("totalBudget", Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="tags">{t("Tags")}</Label>
              <div className="flex items-center">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={t("Add a tag")}
                  className="mr-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  {t("Add")}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {tag}
                    <X
                      className="ml-2 h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("Cancel")}
              </Button>
              <Button type="submit">
                {initialData ? t("Update Case") : t("Create Case")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
