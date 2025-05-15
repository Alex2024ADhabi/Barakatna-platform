import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Paper,
  Box,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ position: "relative" }}>
          <TextField
            label={label}
            type="number"
            fullWidth
            value={isNaN(measurement.value) ? "" : measurement.value}
            onChange={(e) =>
              handleMeasurementChange(typeCode, parseFloat(e.target.value))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{unitOfMeasure}</InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  {isCompliant !== null && isCompliant !== undefined && (
                    <Box component="span" sx={{ display: "flex", mr: 1 }}>
                      {isCompliant ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <WarningIcon color="error" />
                      )}
                    </Box>
                  )}
                </InputAdornment>
              ),
            }}
            helperText={
              error
                ? error
                : standardValue !== null && standardValue !== undefined
                  ? `${t("assessment.standardValue")}: ${standardValue} ${unitOfMeasure}`
                  : helperText
            }
            error={!!error}
            sx={{
              "& .MuiOutlinedInput-root": {
                // Apply background color based on compliance
                bgcolor:
                  isCompliant === true
                    ? "rgba(76, 175, 80, 0.1)"
                    : isCompliant === false
                      ? "rgba(244, 67, 54, 0.1)"
                      : "transparent",
              },
            }}
            margin="normal"
            variant="outlined"
          />

          {helperText && (
            <Tooltip title={helperText} placement="top">
              <IconButton
                size="small"
                sx={{ position: "absolute", right: -10, top: 28 }}
              >
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Grid>
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
    <Box>
      {clientWarning && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">{clientWarning}</Typography>
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("assessment.bathroomFixtures")}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasToilet}
                  onChange={(e) =>
                    handleFixtureChange("toilet", e.target.checked)
                  }
                />
              }
              label={t("assessment.fixtures.toilet")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasSink}
                  onChange={(e) =>
                    handleFixtureChange("sink", e.target.checked)
                  }
                />
              }
              label={t("assessment.fixtures.sink")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasShower}
                  onChange={(e) =>
                    handleFixtureChange("shower", e.target.checked)
                  }
                />
              }
              label={t("assessment.fixtures.shower")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasBathtub}
                  onChange={(e) =>
                    handleFixtureChange("bathtub", e.target.checked)
                  }
                />
              }
              label={t("assessment.fixtures.bathtub")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("assessment.generalMeasurements")}
        </Typography>

        <Grid container spacing={2}>
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
        </Grid>
      </Paper>

      {hasToilet && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("assessment.fixtures.toilet")}
          </Typography>

          <Grid container spacing={2}>
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
          </Grid>
        </Paper>
      )}

      {hasSink && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("assessment.fixtures.sink")}
          </Typography>

          <Grid container spacing={2}>
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
          </Grid>
        </Paper>
      )}

      {hasShower && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("assessment.fixtures.shower")}
          </Typography>

          <Grid container spacing={2}>
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
          </Grid>
        </Paper>
      )}

      {hasBathtub && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("assessment.fixtures.bathtub")}
          </Typography>

          <Grid container spacing={2}>
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
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("assessment.additionalNotes")}
        </Typography>

        <TextField
          label={t("assessment.notes")}
          multiline
          rows={4}
          fullWidth
          value={roomAssessment.notes || ""}
          onChange={(e) => {
            // This is handled separately from measurements
            const updatedAssessment = {
              ...roomAssessment,
              notes: e.target.value,
            };
            // This would need to be handled by a parent component
          }}
          margin="normal"
          variant="outlined"
        />
      </Paper>
    </Box>
  );
};

export default BathroomAssessmentForm;
