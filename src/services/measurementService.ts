import { Measurement } from "../types/database";

// Standard values for different measurement types
const MEASUREMENT_STANDARDS = {
  // Bathroom standards (in cm unless specified)
  DOOR_WIDTH: 90,
  DOOR_THRESHOLD_HEIGHT: 1.5,
  ROOM_WIDTH: 150,
  ROOM_LENGTH: 150,
  FLOOR_SLIP_RESISTANCE: 0.5, // Coefficient of friction
  TOILET_HEIGHT: 45,
  TOILET_CLEARANCE_FRONT: 70,
  TOILET_CLEARANCE_SIDE: 45,
  GRAB_BAR_HEIGHT: 85,
  GRAB_BAR_LENGTH: 60,
  SINK_HEIGHT: 80,
  SINK_CLEARANCE_BELOW: 70,
  MIRROR_HEIGHT: 90,
  SHOWER_ENTRY_WIDTH: 90,
  SHOWER_THRESHOLD_HEIGHT: 1.5,
  SHOWER_SEAT_HEIGHT: 45,
  SHOWER_CONTROLS_HEIGHT: 100,
  BATHTUB_HEIGHT: 45,
  BATHTUB_GRAB_BAR_HEIGHT: 85,
  LIGHT_SWITCH_HEIGHT: 120,

  // Bedroom standards
  BED_HEIGHT: 45,
  BEDSIDE_CLEARANCE: 90,
  WARDROBE_HANDLE_HEIGHT: 120,

  // Kitchen standards
  COUNTER_HEIGHT: 85,
  SINK_DEPTH: 15,
  CABINET_HANDLE_HEIGHT: 100,
  APPLIANCE_CONTROLS_HEIGHT: 120,

  // Living room standards
  SEATING_HEIGHT: 45,
  COFFEE_TABLE_HEIGHT: 40,
  TV_HEIGHT: 120,

  // Entrance standards
  ENTRANCE_WIDTH: 90,
  RAMP_SLOPE: 8, // Degrees
  HANDRAIL_HEIGHT: 85,
};

// Tolerance values for different measurement types (in cm unless specified)
const MEASUREMENT_TOLERANCES = {
  // Default tolerance
  DEFAULT: 2,

  // Specific tolerances
  DOOR_WIDTH: 5,
  DOOR_THRESHOLD_HEIGHT: 0.5,
  TOILET_HEIGHT: 3,
  GRAB_BAR_HEIGHT: 5,
  SINK_HEIGHT: 5,
  SHOWER_THRESHOLD_HEIGHT: 0.5,
  LIGHT_SWITCH_HEIGHT: 10,
};

// Client-specific standard overrides
const CLIENT_SPECIFIC_STANDARDS = {
  FDF: {
    GRAB_BAR_HEIGHT: 90,
    TOILET_HEIGHT: 48,
    SINK_HEIGHT: 85,
  },
  ADHA: {
    DOOR_WIDTH: 95,
    SHOWER_ENTRY_WIDTH: 95,
    GRAB_BAR_LENGTH: 70,
  },
  CASH: {},
};

// Compliance check functions for different measurement types
const COMPLIANCE_CHECKS = {
  // For these types, the measurement should be greater than or equal to the standard
  GREATER_THAN_OR_EQUAL: [
    "DOOR_WIDTH",
    "ROOM_WIDTH",
    "ROOM_LENGTH",
    "TOILET_CLEARANCE_FRONT",
    "TOILET_CLEARANCE_SIDE",
    "GRAB_BAR_LENGTH",
    "SINK_CLEARANCE_BELOW",
    "SHOWER_ENTRY_WIDTH",
    "FLOOR_SLIP_RESISTANCE",
    "BED_HEIGHT",
    "BEDSIDE_CLEARANCE",
    "ENTRANCE_WIDTH",
  ],

  // For these types, the measurement should be less than or equal to the standard
  LESS_THAN_OR_EQUAL: [
    "DOOR_THRESHOLD_HEIGHT",
    "SHOWER_THRESHOLD_HEIGHT",
    "RAMP_SLOPE",
  ],

  // For these types, the measurement should be within a range of the standard
  WITHIN_RANGE: [
    "TOILET_HEIGHT",
    "GRAB_BAR_HEIGHT",
    "SINK_HEIGHT",
    "MIRROR_HEIGHT",
    "SHOWER_SEAT_HEIGHT",
    "SHOWER_CONTROLS_HEIGHT",
    "BATHTUB_HEIGHT",
    "BATHTUB_GRAB_BAR_HEIGHT",
    "LIGHT_SWITCH_HEIGHT",
    "WARDROBE_HANDLE_HEIGHT",
    "COUNTER_HEIGHT",
    "CABINET_HANDLE_HEIGHT",
    "APPLIANCE_CONTROLS_HEIGHT",
    "SEATING_HEIGHT",
    "COFFEE_TABLE_HEIGHT",
    "TV_HEIGHT",
    "HANDRAIL_HEIGHT",
  ],
};

export const measurementService = {
  /**
   * Get the standard value for a measurement type
   * @param measurementTypeCode The code of the measurement type
   * @param clientType The client type (FDF, ADHA, CASH)
   * @returns The standard value for the measurement type
   */
  getStandardValue(
    measurementTypeCode: string,
    clientType: string = "CASH",
  ): number | null {
    // Type-safe client type check
    const validClientType =
      clientType as keyof typeof CLIENT_SPECIFIC_STANDARDS;

    // Check if there's a client-specific standard
    if (clientType && validClientType in CLIENT_SPECIFIC_STANDARDS) {
      const clientStandards = CLIENT_SPECIFIC_STANDARDS[validClientType];

      // Type-safe measurement type check for client standards
      if (measurementTypeCode in clientStandards) {
        const typedMeasurementCode =
          measurementTypeCode as keyof typeof clientStandards;
        return clientStandards[typedMeasurementCode];
      }
    }

    // Type-safe check for standard measurement types
    const typedMeasurementCode =
      measurementTypeCode as keyof typeof MEASUREMENT_STANDARDS;

    // Return the default standard or null if not found
    return typedMeasurementCode in MEASUREMENT_STANDARDS
      ? MEASUREMENT_STANDARDS[typedMeasurementCode]
      : null;
  },

  /**
   * Get the tolerance value for a measurement type
   * @param measurementTypeCode The code of the measurement type
   * @returns The tolerance value for the measurement type
   */
  getTolerance(measurementTypeCode: string): number {
    return (
      MEASUREMENT_TOLERANCES[
        measurementTypeCode as keyof typeof MEASUREMENT_TOLERANCES
      ] || MEASUREMENT_TOLERANCES.DEFAULT
    );
  },

  /**
   * Check if a measurement value is compliant with the standard
   * @param measurementTypeCode The code of the measurement type
   * @param value The measurement value
   * @param standardValue The standard value to compare against
   * @returns Whether the measurement is compliant
   */
  checkCompliance(
    measurementTypeCode: string,
    value: number,
    standardValue: number,
  ): boolean {
    if (COMPLIANCE_CHECKS.GREATER_THAN_OR_EQUAL.includes(measurementTypeCode)) {
      return value >= standardValue;
    }

    if (COMPLIANCE_CHECKS.LESS_THAN_OR_EQUAL.includes(measurementTypeCode)) {
      return value <= standardValue;
    }

    if (COMPLIANCE_CHECKS.WITHIN_RANGE.includes(measurementTypeCode)) {
      const tolerance = this.getTolerance(measurementTypeCode);
      return Math.abs(value - standardValue) <= tolerance;
    }

    // Default compliance check
    return value === standardValue;
  },

  /**
   * Update a measurement with a new value and check compliance
   * @param measurement The measurement to update
   * @param value The new value
   * @param clientType The client type (FDF, ADHA, CASH)
   * @returns The updated measurement
   */
  updateMeasurement(
    measurement: Measurement,
    value: number,
    clientType: string = "CASH",
  ): Measurement {
    const updatedMeasurement = { ...measurement, value };

    // If there's no standard value, try to get it
    if (
      updatedMeasurement.standardValue === undefined ||
      updatedMeasurement.standardValue === null
    ) {
      updatedMeasurement.standardValue =
        this.getStandardValue(
          measurement.measurementTypeId.toString(),
          clientType,
        ) || 0;
    }

    // Check compliance if there's a standard value
    if (
      updatedMeasurement.standardValue !== null &&
      updatedMeasurement.standardValue !== undefined
    ) {
      updatedMeasurement.isCompliant = this.checkCompliance(
        measurement.measurementTypeId.toString(),
        value,
        updatedMeasurement.standardValue,
      );
    }

    return updatedMeasurement;
  },

  /**
   * Validate required measurements
   * @param measurements The list of measurements
   * @param requiredTypes The list of required measurement type codes
   * @returns An object with validation errors
   */
  validateMeasurements(
    measurements: Measurement[],
    requiredTypes: string[],
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    requiredTypes.forEach((typeCode) => {
      const measurement = measurements.find(
        (m) => m.measurementTypeId.toString() === typeCode,
      );

      if (
        !measurement ||
        measurement.value === undefined ||
        measurement.value === null ||
        isNaN(measurement.value)
      ) {
        errors[typeCode] = "This measurement is required";
      }
    });

    return errors;
  },

  /**
   * Get measurement recommendations based on compliance
   * @param measurements The list of measurements
   * @returns An array of recommendation objects
   */
  getRecommendations(measurements: Measurement[]): Array<{
    measurementTypeId: number;
    description: string;
    priority: "high" | "medium" | "low";
    estimatedCost: number;
  }> {
    const recommendations: Array<{
      measurementTypeId: number;
      description: string;
      priority: "high" | "medium" | "low";
      estimatedCost: number;
    }> = [];

    // Filter non-compliant measurements
    const nonCompliantMeasurements = measurements.filter(
      (m) => m.isCompliant === false,
    );

    // Generate recommendations for each non-compliant measurement
    nonCompliantMeasurements.forEach((measurement) => {
      // This is a simplified example - in a real application, you would have more
      // detailed recommendations based on the specific measurement type and value
      recommendations.push({
        measurementTypeId: measurement.measurementTypeId,
        description: `Adjust ${measurement.measurementTypeId} to meet accessibility standards`,
        priority: "medium",
        estimatedCost: 500, // Default estimated cost
      });
    });

    return recommendations;
  },
};
