import { useState } from "react";
import { useTranslation } from "react-i18next";
import { roomAssessmentService } from "../services/roomAssessmentService";
import { assessmentService } from "../services/assessmentService";
import { useNavigate } from "react-router-dom";
import {
  RoomAssessment,
  Measurement,
  Recommendation,
  Photo,
  SnackbarState,
} from "./useRoomAssessments";

export const useRoomAssessmentState = (
  rooms: RoomAssessment[],
  setRooms: React.Dispatch<React.SetStateAction<RoomAssessment[]>>,
  assessmentId: string | undefined,
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>,
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State variables
  const [saving, setSaving] = useState<boolean>(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [photoMode, setPhotoMode] = useState<boolean>(false);

  // Handle room change
  const handleRoomChange = (roomIndex: number) => {
    // Auto-save current room before changing
    handleSaveRoom();
    setCurrentRoomIndex(roomIndex);
    setActiveTab(0); // Reset to measurements tab
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Save room assessment
  const handleSaveRoom = async () => {
    if (rooms.length === 0 || !assessmentId) return;

    try {
      setSaving(true);

      const currentRoom = rooms[currentRoomIndex];
      const response =
        await roomAssessmentService.updateRoomAssessment(currentRoom);

      if (response.success) {
        // Update the rooms array with the latest data
        const updatedRooms = [...rooms];
        updatedRooms[currentRoomIndex] = response.data;
        setRooms(updatedRooms);

        setSnackbar({
          open: true,
          message: t("assessment.messages.roomSaved"),
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to save room assessment");
      }
    } catch (error) {
      console.error("Error saving room assessment:", error);
      setSnackbar({
        open: true,
        message: t("assessment.errors.saveFailed"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle measurement update
  const handleMeasurementUpdate = (updatedMeasurements: Measurement[]) => {
    if (rooms.length === 0) return;

    const updatedRooms = [...rooms];
    updatedRooms[currentRoomIndex] = {
      ...updatedRooms[currentRoomIndex],
      measurements: updatedMeasurements,
    };

    setRooms(updatedRooms);
  };

  // Handle recommendation update
  const handleRecommendationUpdate = (
    updatedRecommendations: Recommendation[],
  ) => {
    if (rooms.length === 0) return;

    const updatedRooms = [...rooms];
    updatedRooms[currentRoomIndex] = {
      ...updatedRooms[currentRoomIndex],
      recommendations: updatedRecommendations,
    };

    setRooms(updatedRooms);
  };

  // Handle photo update
  const handlePhotoUpdate = (updatedPhotos: Photo[]) => {
    if (rooms.length === 0) return;

    const updatedRooms = [...rooms];
    updatedRooms[currentRoomIndex] = {
      ...updatedRooms[currentRoomIndex],
      photos: updatedPhotos,
    };

    setRooms(updatedRooms);
  };

  // Mark room as complete
  const handleMarkComplete = async () => {
    if (rooms.length === 0 || !assessmentId) return;

    try {
      setSaving(true);

      const currentRoom = rooms[currentRoomIndex];
      const updatedRoom = {
        ...currentRoom,
        completionStatus: true,
      };

      const response =
        await roomAssessmentService.updateRoomAssessment(updatedRoom);

      if (response.success) {
        // Update the rooms array with the latest data
        const updatedRooms = [...rooms];
        updatedRooms[currentRoomIndex] = response.data;
        setRooms(updatedRooms);

        setSnackbar({
          open: true,
          message: t("assessment.messages.roomCompleted"),
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to mark room as complete");
      }
    } catch (error) {
      console.error("Error marking room as complete:", error);
      setSnackbar({
        open: true,
        message: t("assessment.errors.markCompleteFailed"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Navigate to next or previous room
  const navigateToNextRoom = () => {
    if (currentRoomIndex < rooms.length - 1) {
      handleRoomChange(currentRoomIndex + 1);
    }
  };

  const navigateToPreviousRoom = () => {
    if (currentRoomIndex > 0) {
      handleRoomChange(currentRoomIndex - 1);
    }
  };

  // Toggle photo mode
  const togglePhotoMode = () => {
    setPhotoMode(!photoMode);
  };

  // Complete assessment
  const handleCompleteAssessment = async () => {
    try {
      if (!assessmentId) return;

      // Auto-save current room first
      await handleSaveRoom();

      // Check if all rooms are completed
      const allRoomsCompleted = rooms.every((room) => room.completionStatus);

      if (!allRoomsCompleted) {
        setSnackbar({
          open: true,
          message: t("assessment.errors.incompleteRooms"),
          severity: "error",
        });
        return;
      }

      // Update assessment status to completed
      const response = await assessmentService.completeAssessment(
        parseInt(assessmentId),
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: t("assessment.messages.assessmentCompleted"),
          severity: "success",
        });

        // Navigate to assessment details page
        setTimeout(() => {
          navigate(`/assessments/${assessmentId}`);
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to complete assessment");
      }
    } catch (error) {
      console.error("Error completing assessment:", error);
      setSnackbar({
        open: true,
        message: t("assessment.errors.completeAssessmentFailed"),
        severity: "error",
      });
    }
  };

  return {
    saving,
    currentRoomIndex,
    activeTab,
    photoMode,
    handleRoomChange,
    handleTabChange,
    handleSaveRoom,
    handleMeasurementUpdate,
    handleRecommendationUpdate,
    handlePhotoUpdate,
    handleMarkComplete,
    navigateToNextRoom,
    navigateToPreviousRoom,
    togglePhotoMode,
    handleCompleteAssessment,
  };
};
