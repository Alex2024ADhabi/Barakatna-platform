import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Switch } from "./switch";
import { Button } from "./button";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

// Text input with label and error handling
export const TextInput: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
}> = ({
  label,
  arabicLabel,
  value,
  onChange,
  placeholder,
  required,
  error,
  type = "text",
  min,
  max,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        min={min}
        max={max}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Formatted input with specific format pattern
export const FormattedInput: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string;
  onChange: (value: string) => void;
  format: string;
  required?: boolean;
  error?: string;
}> = ({ label, arabicLabel, value, onChange, format, required, error }) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  // Format handling would be implemented here

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={format}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-xs text-gray-500">
        {t("common.format")}: {format}
      </p>
    </div>
  );
};

// Date picker component
export const DatePicker: React.FC<{
  label: string;
  arabicLabel?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  required?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}> = ({
  label,
  arabicLabel,
  value,
  onChange,
  required,
  error,
  minDate,
  maxDate,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type="date"
        value={value ? value.toISOString().split("T")[0] : ""}
        onChange={(e) =>
          onChange(e.target.value ? new Date(e.target.value) : null)
        }
        className={error ? "border-red-500" : ""}
        min={minDate ? minDate.toISOString().split("T")[0] : undefined}
        max={maxDate ? maxDate.toISOString().split("T")[0] : undefined}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Select field component
export const SelectField: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[] | string[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}> = ({
  label,
  arabicLabel,
  value,
  onChange,
  options,
  required,
  error,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder || t("common.select")} />
        </SelectTrigger>
        <SelectContent>
          {Array.isArray(options) && options.length > 0 ? (
            options
              .map((option) => {
                if (!option) return null;
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string" ? option : option.label;

                // Skip rendering items with empty string values
                if (optionValue === "") return null;

                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })
              .filter(Boolean)
          ) : (
            <SelectItem value="default" disabled>
              {t("common.noOptions", "No options available")}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Number input component
export const NumberInput: React.FC<{
  label: string;
  arabicLabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
  helpText?: string;
  readOnly?: boolean;
}> = ({
  label,
  arabicLabel,
  value,
  onChange,
  min,
  max,
  step = 1,
  required,
  error,
  helpText,
  readOnly,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className={error ? "border-red-500" : ""}
        readOnly={readOnly}
      />
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Switch field component
export const SwitchField: React.FC<{
  label: string;
  arabicLabel?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, arabicLabel, value, onChange }) => {
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
      </label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
};

// Text area component
export const TextArea: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
}> = ({ label, arabicLabel, value, onChange, required, error, rows = 3 }) => {
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-500" : ""}
        rows={rows}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Read-only field component
export const ReadOnlyField: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string | number | null;
}> = ({ label, arabicLabel, value }) => {
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
      </label>
      <div className="p-2 bg-gray-50 border rounded-md text-gray-700">
        {value !== null ? value : "-"}
      </div>
    </div>
  );
};

// Currency input component
export const CurrencyInput: React.FC<{
  label: string;
  arabicLabel?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  min?: number;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}> = ({
  label,
  arabicLabel,
  value,
  onChange,
  currency = "AED",
  min,
  required,
  error,
  readOnly,
}) => {
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {currency}
        </span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`pl-12 ${error ? "border-red-500" : ""}`}
          min={min}
          readOnly={readOnly}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Form container component
export const FormContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-md">
      {children}
    </div>
  );
};

// Form header component
export const FormHeader: React.FC<{
  title: string;
  arabicTitle: string;
  subtitle?: string;
}> = ({ title, arabicTitle, subtitle }) => {
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="border-b pb-4 mb-6">
      <h2 className="text-2xl font-bold">{isRTL ? arabicTitle : title}</h2>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Form section component
export const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t(title)}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// Form actions component
export const FormActions: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="flex justify-end space-x-4 pt-6">{children}</div>;
};

// Status field component
export const StatusField: React.FC<{
  label: string;
  arabicLabel?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  editable?: boolean;
}> = ({ label, arabicLabel, value, options, onChange, editable = true }) => {
  const { isRTL } = useTranslatedDirection();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "qualified":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "not qualified":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {isRTL && arabicLabel ? arabicLabel : label}
      </label>
      {editable ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(option)}`}
                >
                  {option}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="p-2 border rounded-md">
          <span
            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(value)}`}
          >
            {value || "-"}
          </span>
        </div>
      )}
    </div>
  );
};

// Status update button component
export const StatusUpdateButton: React.FC<{
  currentStatus: string;
  possibleTransitions: string[];
  onStatusChange: (newStatus: string) => void;
}> = ({ currentStatus, possibleTransitions, onStatusChange }) => {
  const { t } = useTranslation();

  if (possibleTransitions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t("common.statusTransition")}:</p>
      <div className="flex flex-wrap gap-2">
        {possibleTransitions.map((status) => (
          <Button
            key={status}
            variant="outline"
            onClick={() => onStatusChange(status)}
          >
            {t(`common.status.${status.toLowerCase().replace(" ", "")}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
