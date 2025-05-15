import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Check, AlertTriangle, Edit, Trash2, Plus } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface Measurement {
  measurementId: number;
  roomAssessmentId: number;
  measurementTypeId: number;
  measurementTypeCode: string;
  measurementTypeName: string;
  value: number;
  unitOfMeasure: string;
  isCompliant: boolean;
  standardValue: number;
  notes: string;
}

interface MeasurementType {
  measurementTypeId: number;
  typeCode: string;
  typeName: string;
  description: string;
  defaultUnitOfMeasure: string;
  standardValue: number;
  minValue: number;
  maxValue: number;
  clientTypeCode?: string;
}

interface MeasurementFormProps {
  measurementTypes: MeasurementType[];
  existingMeasurements: Measurement[];
  onMeasurementAdd: (
    measurement: Omit<Measurement, "measurementId" | "isCompliant">,
  ) => void;
  onMeasurementUpdate: (measurement: Measurement) => void;
  onMeasurementDelete: (measurementId: number) => void;
  clientType: string;
  roomTypeId?: number;
  defaultMeasurementTypeIds?: number[];
  onBulkAdd?: () => void;
  onImportFromTemplate?: () => void;
  isAdminMode?: boolean;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  measurementTypes,
  existingMeasurements,
  onMeasurementAdd,
  onMeasurementUpdate,
  onMeasurementDelete,
  clientType,
  roomTypeId,
  defaultMeasurementTypeIds = [],
  onBulkAdd,
  onImportFromTemplate,
  isAdminMode = false,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  const [selectedType, setSelectedType] = useState<MeasurementType | null>(
    null,
  );
  const [value, setValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);

  const handleTypeSelect = (typeId: number) => {
    const type = measurementTypes.find((t) => t.measurementTypeId === typeId);
    setSelectedType(type || null);
  };

  const handleAddMeasurement = () => {
    if (!selectedType || !value) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Check if this measurement type already exists for this room
    const existingMeasurement = existingMeasurements.find(
      (m) => m.measurementTypeId === selectedType.measurementTypeId,
    );

    if (existingMeasurement) {
      // If it exists, confirm before adding a duplicate
      if (
        !window.confirm(
          t("A measurement of this type already exists. Add another one?"),
        )
      )
        return;
    }

    // Calculate compliance based on client type and measurement type
    const isCompliant = checkCompliance(
      numValue,
      selectedType.standardValue,
      selectedType.typeCode,
    );

    onMeasurementAdd({
      roomAssessmentId: existingMeasurements[0]?.roomAssessmentId || 1,
      measurementTypeId: selectedType.measurementTypeId,
      measurementTypeCode: selectedType.typeCode,
      measurementTypeName: selectedType.typeName,
      value: numValue,
      unitOfMeasure: selectedType.defaultUnitOfMeasure,
      standardValue: selectedType.standardValue,
      notes: notes + (isCompliant ? "" : ` (${clientType} compliance issue)`),
    });

    // Reset form
    setSelectedType(null);
    setValue("");
    setNotes("");
  };

  const handleEditStart = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setValue(measurement.value.toString());
    setNotes(measurement.notes);
  };

  const handleEditSave = () => {
    if (!editingMeasurement) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const isCompliant = checkCompliance(
      numValue,
      editingMeasurement.standardValue,
      editingMeasurement.measurementTypeCode,
    );

    onMeasurementUpdate({
      ...editingMeasurement,
      value: numValue,
      notes: notes,
      isCompliant,
    });

    // Reset edit state
    setEditingMeasurement(null);
    setValue("");
    setNotes("");
  };

  const handleEditCancel = () => {
    setEditingMeasurement(null);
    setValue("");
    setNotes("");
  };

  const checkCompliance = (
    value: number,
    standardValue: number,
    measurementTypeCode?: string,
  ): boolean => {
    // Use the measurement service for more accurate compliance checking if code is provided
    if (measurementTypeCode) {
      // Apply different compliance rules based on client type
      if (clientType === "ADHA") {
        // ADHA has stricter compliance requirements
        if (
          measurementTypeCode.includes("WIDTH") ||
          measurementTypeCode.includes("CLEARANCE")
        ) {
          return value >= standardValue;
        } else if (
          measurementTypeCode.includes("HEIGHT") ||
          measurementTypeCode.includes("THRESHOLD")
        ) {
          return Math.abs(value - standardValue) <= 1; // Within 1cm tolerance for ADHA
        } else if (measurementTypeCode.includes("SLOPE")) {
          return value <= standardValue * 0.9; // 10% stricter for ADHA
        }
      } else if (clientType === "FDF") {
        // FDF has standard compliance requirements
        if (
          measurementTypeCode.includes("WIDTH") ||
          measurementTypeCode.includes("CLEARANCE")
        ) {
          return value >= standardValue * 0.95; // 5% tolerance for FDF
        } else if (
          measurementTypeCode.includes("HEIGHT") ||
          measurementTypeCode.includes("THRESHOLD")
        ) {
          return Math.abs(value - standardValue) <= 2; // Within 2cm tolerance
        } else if (measurementTypeCode.includes("SLOPE")) {
          return value <= standardValue;
        }
      } else {
        // Cash clients have more relaxed compliance requirements
        if (
          measurementTypeCode.includes("WIDTH") ||
          measurementTypeCode.includes("CLEARANCE")
        ) {
          return value >= standardValue * 0.9; // 10% tolerance for cash clients
        } else if (
          measurementTypeCode.includes("HEIGHT") ||
          measurementTypeCode.includes("THRESHOLD")
        ) {
          return Math.abs(value - standardValue) <= 3; // Within 3cm tolerance
        } else if (measurementTypeCode.includes("SLOPE")) {
          return value <= standardValue * 1.1; // 10% more relaxed for cash clients
        }
      }
    }

    // Default fallback based on client type
    if (clientType === "ADHA") {
      return value >= standardValue;
    } else if (clientType === "FDF") {
      return value >= standardValue * 0.95;
    } else {
      return value >= standardValue * 0.9;
    }
  };

  const getComplianceBadge = (isCompliant: boolean) => {
    return isCompliant ? (
      <Badge className="bg-green-500 flex items-center gap-1">
        <Check className="h-3 w-3" /> {t("Compliant")}
      </Badge>
    ) : (
      <Badge className="bg-red-500 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" /> {t("Non-Compliant")}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("Add New Measurement")}</CardTitle>
          <div className="flex gap-2">
            {onBulkAdd && (
              <Button variant="outline" size="sm" onClick={onBulkAdd}>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add All Default Measurements")}
              </Button>
            )}
            {onImportFromTemplate && isAdminMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImportFromTemplate}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Import from Template")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="measurement-type">{t("Measurement Type")}</Label>
              <select
                id="measurement-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedType?.measurementTypeId || ""}
                onChange={(e) => handleTypeSelect(parseInt(e.target.value))}
              >
                <option value="">{t("Select a measurement type")}</option>
                {measurementTypes
                  .filter((type) => {
                    // If room type has default measurement types, filter by them
                    if (roomTypeId && defaultMeasurementTypeIds.length > 0) {
                      return defaultMeasurementTypeIds.includes(
                        type.measurementTypeId,
                      );
                    }
                    // Otherwise show all measurement types
                    return true;
                  })
                  .map((type) => (
                    <option
                      key={type.measurementTypeId}
                      value={type.measurementTypeId}
                    >
                      {type.typeName} ({type.defaultUnitOfMeasure})
                    </option>
                  ))}
              </select>
            </div>

            {selectedType && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedType.description}
                </p>
                <p className="text-sm">
                  {t("Standard Value")}: {selectedType.standardValue}{" "}
                  {selectedType.defaultUnitOfMeasure}
                </p>
                <p className="text-sm">
                  {t("Range")}: {selectedType.minValue} -{" "}
                  {selectedType.maxValue} {selectedType.defaultUnitOfMeasure}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="measurement-value">{t("Value")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="measurement-value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={t("Enter measurement value")}
                />
                {selectedType && (
                  <span className="text-sm">
                    {selectedType.defaultUnitOfMeasure}
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="measurement-notes">{t("Notes")}</Label>
              <Textarea
                id="measurement-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("Add any additional notes")}
              />
            </div>

            <div className="flex justify-end">
              {editingMeasurement ? (
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleEditCancel}>
                    {t("Cancel")}
                  </Button>
                  <Button onClick={handleEditSave}>{t("Save Changes")}</Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddMeasurement}
                  disabled={!selectedType || !value}
                >
                  {t("Add Measurement")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("Existing Measurements")}</h3>

        {existingMeasurements.length === 0 ? (
          <p className="text-muted-foreground">
            {t("No measurements recorded yet.")}
          </p>
        ) : (
          existingMeasurements.map((measurement) => (
            <Card key={measurement.measurementId}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {measurement.measurementTypeName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-semibold">
                        {measurement.value} {measurement.unitOfMeasure}
                      </p>
                      {getComplianceBadge(measurement.isCompliant)}
                    </div>
                    {measurement.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {measurement.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(measurement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        onMeasurementDelete(measurement.measurementId)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  <p>
                    {t("Standard")}: {measurement.standardValue}{" "}
                    {measurement.unitOfMeasure}
                  </p>
                  {clientType === "ADHA" &&
                    measurement.isCompliant === false && (
                      <p className="text-amber-600 mt-1">
                        {t(
                          "This measurement requires attention for ADHA compliance.",
                        )}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MeasurementForm;
