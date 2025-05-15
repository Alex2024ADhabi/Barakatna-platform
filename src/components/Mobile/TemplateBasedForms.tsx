import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";
import {
  AlertCircle,
  Save,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface FormField {
  id: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "date";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sections: {
    id: string;
    title: string;
    fields: FormField[];
  }[];
}

interface TemplateBasedFormsProps {
  assessmentId: string;
  roomId?: string;
  onSave?: (formData: any) => void;
  initialData?: any;
  availableTemplates?: FormTemplate[];
  defaultTemplateId?: string;
}

// Sample templates
const SAMPLE_TEMPLATES: FormTemplate[] = [
  {
    id: "bathroom-assessment",
    name: "Bathroom Assessment",
    description: "Comprehensive assessment for bathroom modifications",
    sections: [
      {
        id: "general",
        title: "General Information",
        fields: [
          {
            id: "assessor_name",
            type: "text",
            label: "Assessor Name",
            required: true,
          },
          {
            id: "assessment_date",
            type: "date",
            label: "Assessment Date",
            required: true,
          },
          {
            id: "client_mobility",
            type: "select",
            label: "Client Mobility Level",
            options: [
              { value: "independent", label: "Independent" },
              { value: "cane", label: "Uses Cane" },
              { value: "walker", label: "Uses Walker" },
              { value: "wheelchair", label: "Uses Wheelchair" },
              { value: "bedridden", label: "Bedridden" },
            ],
            required: true,
          },
        ],
      },
      {
        id: "measurements",
        title: "Bathroom Measurements",
        fields: [
          {
            id: "room_width",
            type: "number",
            label: "Room Width (cm)",
            required: true,
            validation: { min: 0 },
          },
          {
            id: "room_length",
            type: "number",
            label: "Room Length (cm)",
            required: true,
            validation: { min: 0 },
          },
          {
            id: "door_width",
            type: "number",
            label: "Door Width (cm)",
            required: true,
            validation: { min: 0 },
          },
          {
            id: "shower_type",
            type: "select",
            label: "Shower Type",
            options: [
              { value: "standard", label: "Standard Shower" },
              { value: "walk_in", label: "Walk-in Shower" },
              { value: "bathtub", label: "Bathtub" },
              { value: "bathtub_shower", label: "Bathtub with Shower" },
              { value: "none", label: "No Shower/Bath" },
            ],
            required: true,
          },
        ],
      },
      {
        id: "accessibility",
        title: "Accessibility Features",
        fields: [
          {
            id: "grab_bars",
            type: "checkbox",
            label: "Grab Bars Present",
          },
          {
            id: "raised_toilet",
            type: "checkbox",
            label: "Raised Toilet Seat",
          },
          {
            id: "non_slip_flooring",
            type: "checkbox",
            label: "Non-slip Flooring",
          },
          {
            id: "accessible_sink",
            type: "checkbox",
            label: "Wheelchair Accessible Sink",
          },
          {
            id: "roll_in_shower",
            type: "checkbox",
            label: "Roll-in Shower",
          },
        ],
      },
      {
        id: "recommendations",
        title: "Recommendations",
        fields: [
          {
            id: "recommended_modifications",
            type: "textarea",
            label: "Recommended Modifications",
            required: true,
          },
          {
            id: "priority_level",
            type: "radio",
            label: "Priority Level",
            options: [
              {
                value: "critical",
                label: "Critical - Immediate action required",
              },
              { value: "high", label: "High - Action required within 1 month" },
              {
                value: "medium",
                label: "Medium - Action required within 3 months",
              },
              { value: "low", label: "Low - Action when convenient" },
            ],
            required: true,
          },
          {
            id: "estimated_cost",
            type: "number",
            label: "Estimated Cost",
            validation: { min: 0 },
          },
        ],
      },
    ],
  },
  {
    id: "kitchen-assessment",
    name: "Kitchen Assessment",
    description: "Detailed assessment for kitchen modifications",
    sections: [
      {
        id: "general",
        title: "General Information",
        fields: [
          {
            id: "assessor_name",
            type: "text",
            label: "Assessor Name",
            required: true,
          },
          {
            id: "assessment_date",
            type: "date",
            label: "Assessment Date",
            required: true,
          },
        ],
      },
      {
        id: "measurements",
        title: "Kitchen Measurements",
        fields: [
          {
            id: "room_width",
            type: "number",
            label: "Room Width (cm)",
            required: true,
            validation: { min: 0 },
          },
          {
            id: "room_length",
            type: "number",
            label: "Room Length (cm)",
            required: true,
            validation: { min: 0 },
          },
          {
            id: "counter_height",
            type: "number",
            label: "Counter Height (cm)",
            required: true,
            validation: { min: 0 },
          },
        ],
      },
      {
        id: "accessibility",
        title: "Accessibility Features",
        fields: [
          {
            id: "accessible_cabinets",
            type: "checkbox",
            label: "Accessible Cabinets",
          },
          {
            id: "pull_out_shelves",
            type: "checkbox",
            label: "Pull-out Shelves",
          },
          {
            id: "lever_handles",
            type: "checkbox",
            label: "Lever Handles on Faucets",
          },
          {
            id: "adequate_lighting",
            type: "checkbox",
            label: "Adequate Lighting",
          },
        ],
      },
      {
        id: "recommendations",
        title: "Recommendations",
        fields: [
          {
            id: "recommended_modifications",
            type: "textarea",
            label: "Recommended Modifications",
            required: true,
          },
          {
            id: "priority_level",
            type: "radio",
            label: "Priority Level",
            options: [
              { value: "critical", label: "Critical" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
            required: true,
          },
        ],
      },
    ],
  },
];

export default function TemplateBasedForms({
  assessmentId,
  roomId,
  onSave,
  initialData = {},
  availableTemplates = SAMPLE_TEMPLATES,
  defaultTemplateId,
}: TemplateBasedFormsProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    defaultTemplateId || availableTemplates[0]?.id,
  );
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [formTouched, setFormTouched] = useState(false);

  const selectedTemplate =
    availableTemplates.find((t) => t.id === selectedTemplateId) ||
    availableTemplates[0];

  // Initialize expanded sections
  useEffect(() => {
    if (selectedTemplate) {
      const initialExpandedState: Record<string, boolean> = {};
      selectedTemplate.sections.forEach((section, index) => {
        initialExpandedState[section.id] = index === 0; // Only expand first section by default
      });
      setExpandedSections(initialExpandedState);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Try to load saved form data from local storage
    try {
      const storedTemplateId = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_template_id`,
      );
      const storedData = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_template_form`,
      );

      if (storedTemplateId) {
        setSelectedTemplateId(storedTemplateId);
      }

      if (storedData) {
        setFormData(JSON.parse(storedData));
      }
    } catch (err) {
      console.error("Failed to load stored form data", err);
    }

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [assessmentId, roomId]);

  // Auto-save form data when it changes
  useEffect(() => {
    if (!formTouched) return;

    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(
          `assessment_${assessmentId}_${roomId || ""}_template_id`,
          selectedTemplateId,
        );
        localStorage.setItem(
          `assessment_${assessmentId}_${roomId || ""}_template_form`,
          JSON.stringify(formData),
        );
      } catch (err) {
        console.error("Failed to auto-save form data", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [formData, selectedTemplateId, assessmentId, roomId, formTouched]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateId = e.target.value;
    setSelectedTemplateId(newTemplateId);
    setFormTouched(true);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error for this field if it exists
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    setFormTouched(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    selectedTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        // Check required fields
        if (
          field.required &&
          (!formData[field.id] || formData[field.id] === "")
        ) {
          newErrors[field.id] = `${field.label} is required`;
          isValid = false;
        }

        // Check validation rules
        if (field.validation && formData[field.id]) {
          if (field.type === "number") {
            const numValue = parseFloat(formData[field.id]);

            if (
              field.validation.min !== undefined &&
              numValue < field.validation.min
            ) {
              newErrors[field.id] =
                field.validation.message ||
                `${field.label} must be at least ${field.validation.min}`;
              isValid = false;
            }

            if (
              field.validation.max !== undefined &&
              numValue > field.validation.max
            ) {
              newErrors[field.id] =
                field.validation.message ||
                `${field.label} must be at most ${field.validation.max}`;
              isValid = false;
            }
          }

          if (
            field.validation.pattern &&
            typeof formData[field.id] === "string"
          ) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(formData[field.id])) {
              newErrors[field.id] =
                field.validation.message ||
                `${field.label} has an invalid format`;
              isValid = false;
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Expand sections with errors
      const sectionsWithErrors = new Set<string>();

      selectedTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (errors[field.id]) {
            sectionsWithErrors.add(section.id);
          }
        });
      });

      const newExpandedSections = { ...expandedSections };
      sectionsWithErrors.forEach((sectionId) => {
        newExpandedSections[sectionId] = true;
      });

      setExpandedSections(newExpandedSections);
      return;
    }

    setSaving(true);

    try {
      // Add metadata
      const dataToSave = {
        ...formData,
        templateId: selectedTemplateId,
        templateName: selectedTemplate.name,
        timestamp: new Date().toISOString(),
        assessmentId,
        roomId,
      };

      // Save to local storage
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_template_id`,
        selectedTemplateId,
      );
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_template_form`,
        JSON.stringify(dataToSave),
      );

      if (onSave) {
        await onSave(dataToSave);
      }

      setFormTouched(false);
    } catch (err) {
      console.error("Error saving form data:", err);
      setErrors({
        form: "Failed to save assessment data. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] !== undefined ? formData[field.id] : "";
    const error = errors[field.id];

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={error ? "border-red-500" : ""}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={error ? "border-red-500" : ""}
          />
        );

      case "select":
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`w-full rounded-md border ${error ? "border-red-500" : "border-gray-300"} py-2 px-3 text-sm`}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              id={field.id}
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${error ? "border-red-500" : ""}`}
            />
            <label htmlFor={field.id} className="ml-2 block text-sm">
              {field.label}
            </label>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleInputChange(field.id, option.value)}
                  className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 ${error ? "border-red-500" : ""}`}
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="ml-2 block text-sm"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <FileText className="mr-2" /> Template Assessment
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs">
              {networkStatus ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errors.form}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="template-select" className="text-sm font-medium">
              Assessment Template
            </label>
            <select
              id="template-select"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
            >
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              {selectedTemplate?.description}
            </p>
          </div>

          <div className="space-y-4">
            {selectedTemplate?.sections.map((section) => (
              <div
                key={section.id}
                className="border rounded-md overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 text-left"
                >
                  <h3 className="font-medium">{section.title}</h3>
                  {expandedSections[section.id] ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {expandedSections[section.id] && (
                  <div className="p-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        {field.type !== "checkbox" && (
                          <label
                            htmlFor={field.id}
                            className="text-sm font-medium flex items-center"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                        )}

                        {renderField(field)}

                        {errors[field.id] && (
                          <p className="text-xs text-red-500">
                            {errors[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center"
        >
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-1" /> Save Assessment
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
