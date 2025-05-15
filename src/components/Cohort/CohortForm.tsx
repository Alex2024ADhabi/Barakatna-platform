import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  TextInput,
  DatePicker,
  SelectField,
  TextArea,
  NumberInput,
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

interface CohortFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  cohort?: any;
  isEditing?: boolean;
}

const CohortForm: React.FC<CohortFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cohort,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  // Form state
  const [cohortCode, setCohortCode] = useState("");
  const [cohortName, setCohortName] = useState("");
  const [cohortTypeId, setCohortTypeId] = useState("1"); // Default to first type
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusId, setStatusId] = useState("1"); // Default to active
  const [location, setLocation] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [coordinatorId, setCoordinatorId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with cohort data if editing
  useEffect(() => {
    if (cohort && isEditing) {
      setCohortCode(cohort.cohortCode || "");
      setCohortName(cohort.cohortName || "");
      setCohortTypeId(cohort.cohortTypeId?.toString() || "1");
      setDescription(cohort.description || "");
      setStartDate(cohort.startDate ? new Date(cohort.startDate) : new Date());
      setEndDate(cohort.endDate ? new Date(cohort.endDate) : null);
      setStatusId(cohort.statusId?.toString() || "1");
      setLocation(cohort.location || "");
      setMaxCapacity(cohort.maxCapacity || 30);
      setCoordinatorId(cohort.coordinatorId?.toString() || "");
      setNotes(cohort.notes || "");
    } else {
      // Reset form for new cohort
      setCohortCode("");
      setCohortName("");
      setCohortTypeId("1");
      setDescription("");
      setStartDate(new Date());
      setEndDate(null);
      setStatusId("1");
      setLocation("");
      setMaxCapacity(30);
      setCoordinatorId("");
      setNotes("");
    }
    setErrors({});
  }, [cohort, isEditing, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cohortCode.trim()) {
      newErrors.cohortCode = t("validation.required", "This field is required");
    }

    if (!cohortName.trim()) {
      newErrors.cohortName = t("validation.required", "This field is required");
    }

    if (!startDate) {
      newErrors.startDate = t("validation.required", "This field is required");
    }

    if (endDate && startDate && endDate < startDate) {
      newErrors.endDate = t(
        "validation.endDateAfterStartDate",
        "End date must be after start date",
      );
    }

    if (maxCapacity <= 0) {
      newErrors.maxCapacity = t(
        "validation.positiveNumber",
        "Must be a positive number",
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = {
      cohortCode,
      cohortName,
      cohortTypeId: parseInt(cohortTypeId),
      description: description || undefined,
      startDate,
      endDate: endDate || undefined,
      statusId: parseInt(statusId),
      locationId: location ? parseInt(location) : undefined,
      maxCapacity,
      coordinatorId: coordinatorId ? parseInt(coordinatorId) : undefined,
      notes: notes || undefined,
    };

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[700px] ${directionClass}`}>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("cohort.editCohort", "Edit Cohort")
              : t("cohort.createCohort", "Create Cohort")}
          </DialogTitle>
        </DialogHeader>

        <FormContainer>
          <FormSection title="cohort.basicDetails">
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label={t("cohort.cohortCode", "Cohort Code")}
                arabicLabel={t("cohort.cohortCode", "Cohort Code")}
                value={cohortCode}
                onChange={setCohortCode}
                required
                error={errors.cohortCode}
              />

              <TextInput
                label={t("cohort.cohortName", "Cohort Name")}
                arabicLabel={t("cohort.cohortName", "Cohort Name")}
                value={cohortName}
                onChange={setCohortName}
                required
                error={errors.cohortName}
              />
            </div>

            <SelectField
              label={t("cohort.cohortType", "Cohort Type")}
              arabicLabel={t("cohort.cohortType", "Cohort Type")}
              value={cohortTypeId}
              onChange={setCohortTypeId}
              options={[
                { value: "1", label: t("cohort.types.wellness", "Wellness") },
                { value: "2", label: t("cohort.types.education", "Education") },
                { value: "3", label: t("cohort.types.workshop", "Workshop") },
                { value: "4", label: t("cohort.types.social", "Social") },
              ]}
              required
              error={errors.cohortTypeId}
            />

            <TextArea
              label={t("cohort.description", "Description")}
              arabicLabel={t("cohort.description", "Description")}
              value={description}
              onChange={setDescription}
              rows={3}
            />
          </FormSection>

          <FormSection title="cohort.scheduleAndLocation">
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label={t("cohort.startDate", "Start Date")}
                arabicLabel={t("cohort.startDate", "Start Date")}
                value={startDate}
                onChange={setStartDate}
                required
                error={errors.startDate}
              />

              <DatePicker
                label={t("cohort.endDate", "End Date")}
                arabicLabel={t("cohort.endDate", "End Date")}
                value={endDate}
                onChange={setEndDate}
                error={errors.endDate}
              />
            </div>

            <SelectField
              label={t("cohort.location", "Location")}
              arabicLabel={t("cohort.location", "Location")}
              value={location}
              onChange={setLocation}
              options={[
                {
                  value: "",
                  label: t("cohort.selectLocation", "Select Location"),
                },
                { value: "1", label: "Abu Dhabi Community Center" },
                { value: "2", label: "Dubai Senior Center" },
                { value: "3", label: "Sharjah Community Hall" },
                { value: "4", label: "Ajman Cultural Center" },
              ]}
              error={errors.location}
            />
          </FormSection>

          <FormSection title="cohort.capacityAndStatus">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label={t("cohort.maxCapacity", "Maximum Capacity")}
                arabicLabel={t("cohort.maxCapacity", "Maximum Capacity")}
                value={maxCapacity}
                onChange={setMaxCapacity}
                min={1}
                required
                error={errors.maxCapacity}
              />

              <SelectField
                label={t("cohort.status", "Status")}
                arabicLabel={t("cohort.status", "Status")}
                value={statusId}
                onChange={setStatusId}
                options={[
                  { value: "1", label: t("cohort.statuses.active", "Active") },
                  {
                    value: "2",
                    label: t("cohort.statuses.upcoming", "Upcoming"),
                  },
                  {
                    value: "3",
                    label: t("cohort.statuses.completed", "Completed"),
                  },
                  {
                    value: "4",
                    label: t("cohort.statuses.cancelled", "Cancelled"),
                  },
                ]}
                required
                error={errors.statusId}
              />
            </div>

            <SelectField
              label={t("cohort.coordinator", "Coordinator")}
              arabicLabel={t("cohort.coordinator", "Coordinator")}
              value={coordinatorId}
              onChange={setCoordinatorId}
              options={[
                {
                  value: "",
                  label: t("cohort.selectCoordinator", "Select Coordinator"),
                },
                { value: "1", label: "Ahmed Al Mansouri" },
                { value: "2", label: "Fatima Al Zahra" },
                { value: "3", label: "Omar Khalid" },
                { value: "4", label: "Layla Mohammed" },
              ]}
              error={errors.coordinatorId}
            />

            <TextArea
              label={t("cohort.notes", "Notes")}
              arabicLabel={t("cohort.notes", "Notes")}
              value={notes}
              onChange={setNotes}
              rows={2}
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

export default CohortForm;
