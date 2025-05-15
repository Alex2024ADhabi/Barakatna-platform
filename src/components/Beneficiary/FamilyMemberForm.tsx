import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FamilyMember {
  id?: string;
  beneficiaryId: string;
  fullNameEn: string;
  fullNameAr: string;
  relationship: string;
  dateOfBirth: Date | null;
  gender: string;
  contactNumber?: string;
  emiratesId?: string;
  isDependent: boolean;
  hasMedicalCondition: boolean;
  medicalConditionDetails?: string;
}

interface FamilyMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyMember?: FamilyMember;
  beneficiaryId: string;
  onSave: (familyMember: FamilyMember) => void;
}

export const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  open,
  onOpenChange,
  familyMember,
  beneficiaryId,
  onSave,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const isEditing = !!familyMember?.id;

  const [formData, setFormData] = useState<FamilyMember>(
    familyMember || {
      beneficiaryId,
      fullNameEn: "",
      fullNameAr: "",
      relationship: "",
      dateOfBirth: null,
      gender: "",
      contactNumber: "",
      emiratesId: "",
      isDependent: true,
      hasMedicalCondition: false,
      medicalConditionDetails: "",
    },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof FamilyMember, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullNameEn) {
      newErrors.fullNameEn = t("common.validation.required");
    }

    if (!formData.fullNameAr) {
      newErrors.fullNameAr = t("common.validation.required");
    }

    if (!formData.relationship) {
      newErrors.relationship = t("common.validation.required");
    }

    if (!formData.gender) {
      newErrors.gender = t("common.validation.required");
    }

    // Emirates ID format validation (if provided)
    if (formData.emiratesId) {
      const emiratesIdRegex = /^\d{3}-\d{4}-\d{7}-\d{1}$/;
      if (!emiratesIdRegex.test(formData.emiratesId)) {
        newErrors.emiratesId = t("beneficiary.validation.invalidEmiratesId");
      }
    }

    // Phone validation (if provided)
    if (formData.contactNumber) {
      const phoneRegex = /^05\d-\d{3}-\d{4}$/;
      if (!phoneRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = t(
          "beneficiary.validation.invalidPhoneFormat",
        );
      }
    }

    // Medical condition details required if hasMedicalCondition is true
    if (formData.hasMedicalCondition && !formData.medicalConditionDetails) {
      newErrors.medicalConditionDetails = t("common.validation.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? t("familyMember.editTitle")
                : t("familyMember.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("familyMember.formDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className={`${directionClass} py-4 space-y-4`}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullNameEn">
                  {t("familyMember.fullNameEn")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="fullNameEn"
                  value={formData.fullNameEn}
                  onChange={(e) => handleChange("fullNameEn", e.target.value)}
                  className={errors.fullNameEn ? "border-red-500" : ""}
                />
                {errors.fullNameEn && (
                  <p className="text-red-500 text-sm">{errors.fullNameEn}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullNameAr">
                  {t("familyMember.fullNameAr")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="fullNameAr"
                  value={formData.fullNameAr}
                  onChange={(e) => handleChange("fullNameAr", e.target.value)}
                  className={errors.fullNameAr ? "border-red-500" : ""}
                />
                {errors.fullNameAr && (
                  <p className="text-red-500 text-sm">{errors.fullNameAr}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  {t("familyMember.relationship")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => handleChange("relationship", value)}
                >
                  <SelectTrigger
                    id="relationship"
                    className={errors.relationship ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={t("familyMember.selectRelationship")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">
                      {t("familyMember.relationships.spouse")}
                    </SelectItem>
                    <SelectItem value="child">
                      {t("familyMember.relationships.child")}
                    </SelectItem>
                    <SelectItem value="parent">
                      {t("familyMember.relationships.parent")}
                    </SelectItem>
                    <SelectItem value="sibling">
                      {t("familyMember.relationships.sibling")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("familyMember.relationships.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-red-500 text-sm">{errors.relationship}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  {t("familyMember.gender")}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger
                    id="gender"
                    className={errors.gender ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={t("familyMember.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      {t("familyMember.male")}
                    </SelectItem>
                    <SelectItem value="female">
                      {t("familyMember.female")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  {t("familyMember.dateOfBirth")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP")
                      ) : (
                        <span>{t("familyMember.selectDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth || undefined}
                      onSelect={(date) => handleChange("dateOfBirth", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emiratesId">
                  {t("familyMember.emiratesId")}
                </Label>
                <Input
                  id="emiratesId"
                  placeholder="XXX-XXXX-XXXXXXX-X"
                  value={formData.emiratesId || ""}
                  onChange={(e) => handleChange("emiratesId", e.target.value)}
                  className={errors.emiratesId ? "border-red-500" : ""}
                />
                {errors.emiratesId && (
                  <p className="text-red-500 text-sm">{errors.emiratesId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  {t("familyMember.contactNumber")}
                </Label>
                <Input
                  id="contactNumber"
                  placeholder="05X-XXX-XXXX"
                  value={formData.contactNumber || ""}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                  className={errors.contactNumber ? "border-red-500" : ""}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm">{errors.contactNumber}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDependent"
                  checked={formData.isDependent}
                  onCheckedChange={(checked) =>
                    handleChange("isDependent", checked === true)
                  }
                />
                <Label htmlFor="isDependent">
                  {t("familyMember.isDependent")}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedicalCondition"
                  checked={formData.hasMedicalCondition}
                  onCheckedChange={(checked) =>
                    handleChange("hasMedicalCondition", checked === true)
                  }
                />
                <Label htmlFor="hasMedicalCondition">
                  {t("familyMember.hasMedicalCondition")}
                </Label>
              </div>

              {formData.hasMedicalCondition && (
                <div className="space-y-2">
                  <Label htmlFor="medicalConditionDetails">
                    {t("familyMember.medicalConditionDetails")}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="medicalConditionDetails"
                    value={formData.medicalConditionDetails || ""}
                    onChange={(e) =>
                      handleChange("medicalConditionDetails", e.target.value)
                    }
                    className={
                      errors.medicalConditionDetails ? "border-red-500" : ""
                    }
                  />
                  {errors.medicalConditionDetails && (
                    <p className="text-red-500 text-sm">
                      {errors.medicalConditionDetails}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyMemberForm;
