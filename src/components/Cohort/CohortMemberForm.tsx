import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  TextInput,
  DatePicker,
  SelectField,
  TextArea,
  FormContainer,
  FormHeader,
  FormSection,
  FormActions,
} from "@/components/ui/form-components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CohortMember,
  CreateCohortMemberRequest,
  UpdateCohortMemberRequest,
} from "@/lib/api/cohort/types";

interface CohortMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateCohortMemberRequest | UpdateCohortMemberRequest,
  ) => void;
  member?: CohortMember;
  cohortId?: number;
  isEditing?: boolean;
}

const CohortMemberForm: React.FC<CohortMemberFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  cohortId,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  // Form state
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [joinDate, setJoinDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);
  const [statusId, setStatusId] = useState(1); // Default to active
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with member data if editing
  useEffect(() => {
    if (member && isEditing) {
      setBeneficiaryId(member.beneficiaryId);
      setJoinDate(new Date(member.joinDate));
      setExitDate(member.exitDate ? new Date(member.exitDate) : null);
      setStatusId(member.statusId);
      setNotes(member.notes || "");
    } else {
      // Reset form for new member
      setBeneficiaryId("");
      setJoinDate(new Date());
      setExitDate(null);
      setStatusId(1);
      setNotes("");
    }
    setErrors({});
  }, [member, isEditing, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!beneficiaryId.trim()) {
      newErrors.beneficiaryId = t(
        "validation.required",
        "This field is required",
      );
    }

    if (!joinDate) {
      newErrors.joinDate = t("validation.required", "This field is required");
    }

    if (exitDate && joinDate && exitDate < joinDate) {
      newErrors.exitDate = t(
        "validation.exitDateAfterJoinDate",
        "Exit date must be after join date",
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = {
      cohortId: member?.cohortId || cohortId || 0,
      beneficiaryId,
      joinDate: joinDate as Date,
      exitDate: exitDate || undefined,
      statusId,
      notes: notes || undefined,
    };

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] ${directionClass}`}>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("cohort.editMember", "Edit Cohort Member")
              : t("cohort.addMember", "Add Cohort Member")}
          </DialogTitle>
        </DialogHeader>

        <FormContainer>
          <FormSection title="cohort.memberDetails">
            <TextInput
              label={t("cohort.beneficiaryId", "Beneficiary ID")}
              arabicLabel={t("cohort.beneficiaryId", "Beneficiary ID")}
              value={beneficiaryId}
              onChange={setBeneficiaryId}
              required
              error={errors.beneficiaryId}
            />

            <DatePicker
              label={t("cohort.joinDate", "Join Date")}
              arabicLabel={t("cohort.joinDate", "Join Date")}
              value={joinDate}
              onChange={setJoinDate}
              required
              error={errors.joinDate}
            />

            <DatePicker
              label={t("cohort.exitDate", "Exit Date")}
              arabicLabel={t("cohort.exitDate", "Exit Date")}
              value={exitDate}
              onChange={setExitDate}
              error={errors.exitDate}
            />

            <SelectField
              label={t("cohort.status", "Status")}
              arabicLabel={t("cohort.status", "Status")}
              value={statusId.toString()}
              onChange={(value) => setStatusId(parseInt(value))}
              options={[
                { value: "1", label: t("cohort.statuses.active", "Active") },
                {
                  value: "2",
                  label: t("cohort.statuses.completed", "Completed"),
                },
                { value: "3", label: t("cohort.statuses.dropped", "Dropped") },
                { value: "4", label: t("cohort.statuses.onHold", "On Hold") },
              ]}
              required
              error={errors.statusId}
            />

            <TextArea
              label={t("cohort.notes", "Notes")}
              arabicLabel={t("cohort.notes", "Notes")}
              value={notes}
              onChange={setNotes}
              rows={4}
            />
          </FormSection>

          <FormActions>
            <Button variant="outline" onClick={onClose}>
              {t("common.buttons.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing
                ? t("common.buttons.update", "Update")
                : t("common.buttons.save", "Save")}
            </Button>
          </FormActions>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};

export default CohortMemberForm;
