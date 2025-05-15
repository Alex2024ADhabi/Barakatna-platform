import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { HelpCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

// Services
import { measurementService } from "../../services/measurementService";

// Types
import { Measurement } from "../../types/database";

interface RoomAssessment {
  roomAssessmentId: number;
  assessmentId: number;
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  roomName: string;
  completionStatus: boolean;
  notes: string;
  measurements: Measurement[];
}

interface BathroomAssessmentFormProps {
  roomAssessment: RoomAssessment;
  clientType: string; // 'FDF', 'ADHA', or 'CASH'
  onMeasurementUpdate: (measurements: Measurement[]) => void;
}

// Measurement Type Codes for Bathroom
const BATHROOM_MEASUREMENT_TYPES = {
  DOOR_WIDTH: "DOOR_WIDTH",
  DOOR_THRESHOLD_HEIGHT: "DOOR_THRESHOLD_HEIGHT",
  ROOM_WIDTH: "ROOM_WIDTH",
  ROOM_LENGTH: "ROOM_LENGTH",
  FLOOR_SLIP_RESISTANCE: "FLOOR_SLIP_RESISTANCE",
  TOILET_HEIGHT: "TOILET_HEIGHT",
  TOILET_CLEARANCE_FRONT: "TOILET_CLEARANCE_FRONT",
  TOILET_CLEARANCE_SIDE: "TOILET_CLEARANCE_SIDE",
  GRAB_BAR_HEIGHT: "GRAB_BAR_HEIGHT",
  GRAB_BAR_LENGTH: "GRAB_BAR_LENGTH",
  SINK_HEIGHT: "SINK_HEIGHT",
  SINK_CLEARANCE_BELOW: "SINK_CLEARANCE_BELOW",
  MIRROR_HEIGHT: "MIRROR_HEIGHT",
  SHOWER_ENTRY_WIDTH: "SHOWER_ENTRY_WIDTH",
  SHOWER_THRESHOLD_HEIGHT: "SHOWER_THRESHOLD_HEIGHT",
  SHOWER_SEAT_HEIGHT: "SHOWER_SEAT_HEIGHT",
  SHOWER_CONTROLS_HEIGHT: "SHOWER_CONTROLS_HEIGHT",
  BATHTUB_HEIGHT: "BATHTUB_HEIGHT",
  BATHTUB_GRAB_BAR_HEIGHT: "BATHTUB_GRAB_BAR_HEIGHT",
  LIGHT_SWITCH_HEIGHT: "LIGHT_SWITCH_HEIGHT",
};

const BathroomAssessmentForm: React.FC<BathroomAssessmentFormProps> = ({
  roomAssessment,
  clientType,
  onMeasurementUpdate,
}) => {
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [hasShower, setHasShower] = useState<boolean>(false);
  const [hasBathtub, setHasBathtub] = useState<boolean>(false);
  const [hasToilet, setHasToilet] = useState<boolean>(true);
  const [hasSink, setHasSink] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Initialize measurements
  useEffect(() => {
    if (roomAssessment && roomAssessment.measurements) {
      setMeasurements(roomAssessment.measurements);

      // Determine if bathroom has shower, bathtub, toilet, and sink based on measurements
      const hasShower = roomAssessment.measurements.some(
        (m) =>
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.SHOWER_ENTRY_WIDTH ||
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.SHOWER_THRESHOLD_HEIGHT ||
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.SHOWER_SEAT_HEIGHT ||
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.SHOWER_CONTROLS_HEIGHT,
      );

      const hasBathtub = roomAssessment.measurements.some(
        (m) =>
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.BATHTUB_HEIGHT ||
          m.measurementTypeId.toString() ===
            BATHROOM_MEASUREMENT_TYPES.BATHTUB_GRAB_BAR_HEIGHT,
      );

      setHasShower(hasShower);
      setHasBathtub(hasBathtub);
      setHasToilet(true); // Default to true as most bathrooms have toilets
      setHasSink(true); // Default to true as most bathrooms have sinks
    }
  }, [roomAssessment]);

  // Get measurement by type code
  const getMeasurement = (typeCode: string): Measurement | undefined => {
    return measurements.find(
      (m) => m.measurementTypeId.toString() === typeCode,
    );
  };

  // Handle measurement value change
  const handleMeasurementChange = (typeCode: string, value: number) => {
    const updatedMeasurements = [...measurements];
    const index = updatedMeasurements.findIndex(
      (m) => m.measurementTypeId.toString() === typeCode,
    );

    if (index !== -1) {
      // Get the standard value using the measurement service
      const standardValue =
        measurementService.getStandardValue(typeCode, clientType) ||
        updatedMeasurements[index].standardValue;

      // Update the measurement using the measurement service
      const updatedMeasurement = measurementService.updateMeasurement(
        updatedMeasurements[index],
        value,
        clientType,
      );

      updatedMeasurements[index] = updatedMeasurement;

      setMeasurements(updatedMeasurements);
      onMeasurementUpdate(updatedMeasurements);

      // Clear validation error if exists
      if (validationErrors[typeCode]) {
        const updatedErrors = { ...validationErrors };
        delete updatedErrors[typeCode];
        setValidationErrors(updatedErrors);
      }
    } else {
      // Should not happen as all measurements should be initialized
      console.error(`Measurement with type code ${typeCode} not found`);
    }
  };

  // Handle measurement notes change
  const handleNotesChange = (typeCode: string, notes: string) => {
    const updatedMeasurements = [...measurements];
    const index = updatedMeasurements.findIndex(
      (m) => m.measurementTypeId.toString() === typeCode,
    );

    if (index !== -1) {
      updatedMeasurements[index] = {
        ...updatedMeasurements[index],
        notes,
      };

      setMeasurements(updatedMeasurements);
      onMeasurementUpdate(updatedMeasurements);
    }
  };

  // Handle fixture existence change
  const handleFixtureChange = (
    fixture: "shower" | "bathtub" | "toilet" | "sink",
    exists: boolean,
  ) => {
    switch (fixture) {
      case "shower":
        setHasShower(exists);
        break;
      case "bathtub":
        setHasBathtub(exists);
        break;
      case "toilet":
        setHasToilet(exists);
        break;
      case "sink":
        setHasSink(exists);
        break;
    }
  };

  // Validate required measurements
  const validateRequiredMeasurements = () => {
    // Define required measurements based on fixture existence
    const requiredMeasurements = [
      BATHROOM_MEASUREMENT_TYPES.DOOR_WIDTH,
      BATHROOM_MEASUREMENT_TYPES.DOOR_THRESHOLD_HEIGHT,
      BATHROOM_MEASUREMENT_TYPES.ROOM_WIDTH,
      BATHROOM_MEASUREMENT_TYPES.ROOM_LENGTH,
      BATHROOM_MEASUREMENT_TYPES.FLOOR_SLIP_RESISTANCE,
      BATHROOM_MEASUREMENT_TYPES.LIGHT_SWITCH_HEIGHT,
    ];

    if (hasToilet) {
      requiredMeasurements.push(
        BATHROOM_MEASUREMENT_TYPES.TOILET_HEIGHT,
        BATHROOM_MEASUREMENT_TYPES.TOILET_CLEARANCE_FRONT,
        BATHROOM_MEASUREMENT_TYPES.TOILET_CLEARANCE_SIDE,
        BATHROOM_MEASUREMENT_TYPES.GRAB_BAR_HEIGHT,
        BATHROOM_MEASUREMENT_TYPES.GRAB_BAR_LENGTH,
      );
    }

    if (hasSink) {
      requiredMeasurements.push(
        BATHROOM_MEASUREMENT_TYPES.SINK_HEIGHT,
        BATHROOM_MEASUREMENT_TYPES.SINK_CLEARANCE_BELOW,
        BATHROOM_MEASUREMENT_TYPES.MIRROR_HEIGHT,
      );
    }

    if (hasShower) {
      requiredMeasurements.push(
        BATHROOM_MEASUREMENT_TYPES.SHOWER_ENTRY_WIDTH,
        BATHROOM_MEASUREMENT_TYPES.SHOWER_THRESHOLD_HEIGHT,
      );
    }

    if (hasBathtub) {
      requiredMeasurements.push(
        BATHROOM_MEASUREMENT_TYPES.BATHTUB_HEIGHT,
        BATHROOM_MEASUREMENT_TYPES.BATHTUB_GRAB_BAR_HEIGHT,
      );
    }

    // Use the measurement service to validate required measurements
    const errors = measurementService.validateMeasurements(
      measurements,
      requiredMeasurements,
    );

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Render measurement field
  const renderMeasurementField = (
    typeCode: string,
    label: string,
    helperText?: string,
  ) => {
    const measurement = getMeasurement(typeCode);

    if (!measurement) {
      return null;
    }

    const unitOfMeasure = measurement.unitOfMeasure || "cm";
    const isCompliant = measurement.isCompliant;
    const standardValue =
      measurement.standardValue ||
      measurementService.getStandardValue(typeCode, clientType);
    const error = validationErrors[typeCode];

    return (
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
        <div className="relative">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor={`measurement-${typeCode}`}>{label}</Label>
            <div className="flex">
              {isCompliant !== null && isCompliant !== undefined && (
                <div className="flex items-center mr-2">
                  {isCompliant ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
              <div className="relative flex-1">
                <Input
                  id={`measurement-${typeCode}`}
                  type="number"
                  value={isNaN(measurement.value) ? "" : measurement.value}
                  onChange={(e) =>
                    handleMeasurementChange(
                      typeCode,
                      parseFloat(e.target.value),
                    )
                  }
                  className={`pr-12 ${isCompliant === true ? "bg-green-50" : isCompliant === false ? "bg-red-50" : ""} ${error ? "border-red-500" : ""}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">{unitOfMeasure}</span>
                </div>
              </div>
            </div>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : standardValue !== null && standardValue !== undefined ? (
              <p className="text-sm text-gray-500">
                {t("assessment.standardValue")}: {standardValue} {unitOfMeasure}
              </p>
            ) : helperText ? (
              <p className="text-sm text-gray-500">{helperText}</p>
            ) : null}
          </div>

          {helperText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-8 w-8 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{helperText}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  };

  // Get client-specific warning message
  const getClientSpecificWarning = () => {
    switch (clientType) {
      case "FDF":
        return t("assessment.clientSpecific.fdf.bathroomWarning");
      case "ADHA":
        return t("assessment.clientSpecific.adha.bathroomWarning");
      default:
        return null;
    }
  };

  // Client-specific warning message
  const clientWarning = getClientSpecificWarning();

  return (
    <div className="space-y-6">
      {clientWarning && (
        <Alert>
          <AlertDescription>{clientWarning}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("assessment.bathroomFixtures")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-toilet"
                checked={hasToilet}
                onCheckedChange={(checked) =>
                  handleFixtureChange("toilet", checked === true)
                }
              />
              <Label htmlFor="has-toilet">
                {t("assessment.fixtures.toilet")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-sink"
                checked={hasSink}
                onCheckedChange={(checked) =>
                  handleFixtureChange("sink", checked === true)
                }
              />
              <Label htmlFor="has-sink">{t("assessment.fixtures.sink")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-shower"
                checked={hasShower}
                onCheckedChange={(checked) =>
                  handleFixtureChange("shower", checked === true)
                }
              />
              <Label htmlFor="has-shower">
                {t("assessment.fixtures.shower")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-bathtub"
                checked={hasBathtub}
                onCheckedChange={(checked) =>
                  handleFixtureChange("bathtub", checked === true)
                }
              />
              <Label htmlFor="has-bathtub">
                {t("assessment.fixtures.bathtub")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("assessment.generalMeasurements")}
          </h3>

          <div className="flex flex-wrap -mx-2">
            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.ROOM_WIDTH,
              t("assessment.measurements.roomWidth"),
              t("assessment.helperText.roomWidth"),
            )}

            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.ROOM_LENGTH,
              t("assessment.measurements.roomLength"),
              t("assessment.helperText.roomLength"),
            )}

            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.DOOR_WIDTH,
              t("assessment.measurements.doorWidth"),
              t("assessment.helperText.doorWidth"),
            )}

            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.DOOR_THRESHOLD_HEIGHT,
              t("assessment.measurements.doorThresholdHeight"),
              t("assessment.helperText.doorThresholdHeight"),
            )}

            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.FLOOR_SLIP_RESISTANCE,
              t("assessment.measurements.floorSlipResistance"),
              t("assessment.helperText.floorSlipResistance"),
            )}

            {renderMeasurementField(
              BATHROOM_MEASUREMENT_TYPES.LIGHT_SWITCH_HEIGHT,
              t("assessment.measurements.lightSwitchHeight"),
              t("assessment.helperText.lightSwitchHeight"),
            )}
          </div>
        </CardContent>
      </Card>

      {hasToilet && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("assessment.fixtures.toilet")}
            </h3>

            <div className="flex flex-wrap -mx-2">
              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.TOILET_HEIGHT,
                t("assessment.measurements.toiletHeight"),
                t("assessment.helperText.toiletHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.TOILET_CLEARANCE_FRONT,
                t("assessment.measurements.toiletClearanceFront"),
                t("assessment.helperText.toiletClearanceFront"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.TOILET_CLEARANCE_SIDE,
                t("assessment.measurements.toiletClearanceSide"),
                t("assessment.helperText.toiletClearanceSide"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.GRAB_BAR_HEIGHT,
                t("assessment.measurements.grabBarHeight"),
                t("assessment.helperText.grabBarHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.GRAB_BAR_LENGTH,
                t("assessment.measurements.grabBarLength"),
                t("assessment.helperText.grabBarLength"),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasSink && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("assessment.fixtures.sink")}
            </h3>

            <div className="flex flex-wrap -mx-2">
              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SINK_HEIGHT,
                t("assessment.measurements.sinkHeight"),
                t("assessment.helperText.sinkHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SINK_CLEARANCE_BELOW,
                t("assessment.measurements.sinkClearanceBelow"),
                t("assessment.helperText.sinkClearanceBelow"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.MIRROR_HEIGHT,
                t("assessment.measurements.mirrorHeight"),
                t("assessment.helperText.mirrorHeight"),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasShower && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("assessment.fixtures.shower")}
            </h3>

            <div className="flex flex-wrap -mx-2">
              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SHOWER_ENTRY_WIDTH,
                t("assessment.measurements.showerEntryWidth"),
                t("assessment.helperText.showerEntryWidth"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SHOWER_THRESHOLD_HEIGHT,
                t("assessment.measurements.showerThresholdHeight"),
                t("assessment.helperText.showerThresholdHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SHOWER_SEAT_HEIGHT,
                t("assessment.measurements.showerSeatHeight"),
                t("assessment.helperText.showerSeatHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.SHOWER_CONTROLS_HEIGHT,
                t("assessment.measurements.showerControlsHeight"),
                t("assessment.helperText.showerControlsHeight"),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasBathtub && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("assessment.fixtures.bathtub")}
            </h3>

            <div className="flex flex-wrap -mx-2">
              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.BATHTUB_HEIGHT,
                t("assessment.measurements.bathtubHeight"),
                t("assessment.helperText.bathtubHeight"),
              )}

              {renderMeasurementField(
                BATHROOM_MEASUREMENT_TYPES.BATHTUB_GRAB_BAR_HEIGHT,
                t("assessment.measurements.bathtubGrabBarHeight"),
                t("assessment.helperText.bathtubGrabBarHeight"),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("assessment.additionalNotes")}
          </h3>

          <Textarea
            placeholder={t("assessment.notes")}
            value={roomAssessment.notes || ""}
            onChange={(e) => {
              // This is handled separately from measurements
              const updatedAssessment = {
                ...roomAssessment,
                notes: e.target.value,
              };
              // This would need to be handled by a parent component
            }}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BathroomAssessmentForm;
