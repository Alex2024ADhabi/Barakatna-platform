import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { roomAssessmentService } from "../services/roomAssessmentService";

// Types
export interface Measurement {
  measurementId: number;
  roomAssessmentId: number;
  measurementTypeId: number;
  measurementTypeCode: string;
  measurementTypeName: string;
  value: number | null;
  unitOfMeasure: string;
  isCompliant: boolean | null;
  standardValue: number;
  notes: string;
}

// Interface for component usage
export interface MeasurementForComponent {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  standard: number;
  isCompliant: boolean | null;
}

export interface Recommendation {
  recommendationId: number;
  roomAssessmentId: number;
  recommendationTypeId: number;
  recommendationTypeCode: string;
  recommendationTypeName: string;
  priorityLevel: number;
  description: string;
  reason: string;
  estimatedCost: number;
  isSelected: boolean;
  isApproved: boolean;
}

// Interface for component usage
export interface RecommendationForComponent {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedCost: number;
  selected: boolean;
}

export interface Photo {
  photoId: number;
  roomAssessmentId: number;
  photoUrl: string;
  capturedDate: Date;
  description: string;
  annotations: string;
}

// Interface for component usage
export interface PhotoForComponent {
  id: string;
  url: string;
  description: string;
  timestamp: string;
}

export interface RoomAssessment {
  roomAssessmentId: number;
  assessmentId: number;
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  roomName: string;
  completionStatus: boolean;
  notes: string;
  measurements: Measurement[];
  recommendations: Recommendation[];
  photos: Photo[];
}

// Interface for component usage
export interface RoomForComponent {
  id: string;
  name: string;
  type: string;
  completed: boolean;
  progress: number;
  measurements: MeasurementForComponent[];
  recommendations: RecommendationForComponent[];
  photos: PhotoForComponent[];
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export const useRoomAssessments = (assessmentId: string | undefined) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<RoomAssessment[]>([]);
  const [roomsForComponent, setRoomsForComponent] = useState<
    RoomForComponent[]
  >([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load room assessments
  useEffect(() => {
    const loadRoomAssessments = async () => {
      try {
        if (!assessmentId) return;

        const response =
          await roomAssessmentService.getRoomAssessmentsByAssessmentId(
            parseInt(assessmentId),
          );

        if (response.success) {
          setRooms(response.data);

          // Transform data for component usage
          const transformedRooms = response.data.map(
            (room: RoomAssessment): RoomForComponent => ({
              id: room.roomAssessmentId.toString(),
              name: room.roomName,
              type: room.roomTypeCode.toLowerCase(),
              completed: room.completionStatus,
              progress: room.completionStatus ? 100 : 65, // Default progress value
              measurements: room.measurements.map((m) => ({
                id: m.measurementId.toString(),
                name: m.measurementTypeName,
                value: m.value,
                unit: m.unitOfMeasure,
                standard: m.standardValue,
                isCompliant: m.isCompliant,
              })),
              recommendations: room.recommendations.map((r) => ({
                id: r.recommendationId.toString(),
                description: r.description,
                priority: mapPriorityLevel(r.priorityLevel),
                estimatedCost: r.estimatedCost,
                selected: r.isSelected,
              })),
              photos: room.photos.map((p) => ({
                id: p.photoId.toString(),
                url: p.photoUrl,
                description: p.description,
                timestamp: p.capturedDate.toISOString(),
              })),
            }),
          );

          setRoomsForComponent(transformedRooms);
        } else {
          throw new Error(
            response.message || "Failed to load room assessments",
          );
        }
      } catch (error) {
        console.error("Error loading room assessments:", error);
        setSnackbar({
          open: true,
          message: t("assessment.errors.loadRoomsFailed"),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoomAssessments();
  }, [assessmentId, t]);

  // Helper function to map priority level number to string
  const mapPriorityLevel = (level: number): "high" | "medium" | "low" => {
    if (level >= 8) return "high";
    if (level >= 4) return "medium";
    return "low";
  };

  return {
    loading,
    rooms,
    setRooms,
    roomsForComponent,
    setRoomsForComponent,
    snackbar,
    setSnackbar,
  };
};
