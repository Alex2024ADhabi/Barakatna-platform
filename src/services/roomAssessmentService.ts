import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import { authHeader } from "../utils/authHeader";

// Types
export interface RoomType {
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  description: string;
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
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy: number | null;
  lastModifiedDate: Date | null;
  measurements: Measurement[];
  recommendations: Recommendation[];
  photos: Photo[];
}

export interface Measurement {
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

export interface MeasurementType {
  measurementTypeId: number;
  typeCode: string;
  typeName: string;
  description: string;
  defaultUnitOfMeasure: string;
  standardValue: number;
  minValue: number;
  maxValue: number;
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
  approvedBy: number | null;
  approvalDate: Date | null;
}

export interface Photo {
  photoId: number;
  roomAssessmentId: number;
  photoUrl: string;
  capturedDate: Date;
  description: string;
  annotations: string;
  photoType: string;
}

export interface RoomAssessmentRequest {
  assessmentId: number;
  roomTypeId: number;
  roomName: string;
  notes?: string;
}

export interface MeasurementRequest {
  roomAssessmentId: number;
  measurementTypeId: number;
  value: number;
  unitOfMeasure: string;
  notes?: string;
}

export interface RecommendationRequest {
  roomAssessmentId: number;
  recommendationTypeId: number;
  priorityLevel: number;
  description: string;
  reason?: string;
  estimatedCost: number;
  isSelected: boolean;
}

export interface PhotoRequest {
  roomAssessmentId: number;
  photoData: string; // Base64 encoded image
  description?: string;
  annotations?: string;
  photoType: string;
}

export interface GenerateRecommendationsRequest {
  roomAssessmentId: number;
  roomTypeCode: string;
  clientType: string;
}

// Service implementation
const roomAssessmentService = {
  /**
   * Get room assessment by ID
   */
  getRoomAssessmentById: async (
    roomAssessmentId: number,
  ): Promise<{
    success: boolean;
    data?: RoomAssessment;
    message?: string;
  }> => {
    try {
      const response = await axios.get<RoomAssessment>(
        `${API_BASE_URL}/room-assessments/${roomAssessmentId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch room assessment");
    }
  },

  /**
   * Get room assessments by assessment ID
   */
  getRoomAssessmentsByAssessmentId: async (
    assessmentId: number,
  ): Promise<{
    success: boolean;
    data?: RoomAssessment[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<RoomAssessment[]>(
        `${API_BASE_URL}/assessments/${assessmentId}/rooms`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch room assessments");
    }
  },

  /**
   * Create a new room assessment
   */
  createRoomAssessment: async (
    roomAssessment: RoomAssessmentRequest,
  ): Promise<{
    success: boolean;
    data?: RoomAssessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<RoomAssessment>(
        `${API_BASE_URL}/room-assessments`,
        roomAssessment,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to create room assessment");
    }
  },

  /**
   * Update a room assessment
   */
  updateRoomAssessment: async (
    roomAssessment: Partial<RoomAssessment>,
  ): Promise<{
    success: boolean;
    data?: RoomAssessment;
    message?: string;
  }> => {
    try {
      const response = await axios.put<RoomAssessment>(
        `${API_BASE_URL}/room-assessments/${roomAssessment.roomAssessmentId}`,
        roomAssessment,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update room assessment");
    }
  },

  /**
   * Mark a room assessment as complete
   */
  completeRoomAssessment: async (
    roomAssessmentId: number,
  ): Promise<{
    success: boolean;
    data?: RoomAssessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<RoomAssessment>(
        `${API_BASE_URL}/room-assessments/${roomAssessmentId}/complete`,
        {},
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to complete room assessment");
    }
  },

  /**
   * Delete a room assessment
   */
  deleteRoomAssessment: async (
    roomAssessmentId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(
        `${API_BASE_URL}/room-assessments/${roomAssessmentId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete room assessment");
    }
  },

  /**
   * Get all room types
   */
  getRoomTypes: async (): Promise<{
    success: boolean;
    data?: RoomType[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<RoomType[]>(
        `${API_BASE_URL}/room-types`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch room types");
    }
  },

  /**
   * Get measurement types for a room type
   */
  getMeasurementTypesByRoomType: async (
    roomTypeId: number,
  ): Promise<{
    success: boolean;
    data?: MeasurementType[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<MeasurementType[]>(
        `${API_BASE_URL}/room-types/${roomTypeId}/measurement-types`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch measurement types");
    }
  },

  /**
   * Add a measurement to a room assessment
   */
  addMeasurement: async (
    measurement: MeasurementRequest,
  ): Promise<{
    success: boolean;
    data?: Measurement;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Measurement>(
        `${API_BASE_URL}/measurements`,
        measurement,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to add measurement");
    }
  },

  /**
   * Update a measurement
   */
  updateMeasurement: async (
    measurementId: number,
    measurement: Partial<Measurement>,
  ): Promise<{
    success: boolean;
    data?: Measurement;
    message?: string;
  }> => {
    try {
      const response = await axios.put<Measurement>(
        `${API_BASE_URL}/measurements/${measurementId}`,
        measurement,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update measurement");
    }
  },

  /**
   * Delete a measurement
   */
  deleteMeasurement: async (
    measurementId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(`${API_BASE_URL}/measurements/${measurementId}`, {
        headers: authHeader(),
      });

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete measurement");
    }
  },

  /**
   * Add a recommendation to a room assessment
   */
  addRecommendation: async (
    recommendation: RecommendationRequest,
  ): Promise<{
    success: boolean;
    data?: Recommendation;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Recommendation>(
        `${API_BASE_URL}/recommendations`,
        recommendation,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to add recommendation");
    }
  },

  /**
   * Update a recommendation
   */
  updateRecommendation: async (
    recommendationId: number,
    recommendation: Partial<Recommendation>,
  ): Promise<{
    success: boolean;
    data?: Recommendation;
    message?: string;
  }> => {
    try {
      const response = await axios.put<Recommendation>(
        `${API_BASE_URL}/recommendations/${recommendationId}`,
        recommendation,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update recommendation");
    }
  },

  /**
   * Delete a recommendation
   */
  deleteRecommendation: async (
    recommendationId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(
        `${API_BASE_URL}/recommendations/${recommendationId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete recommendation");
    }
  },

  /**
   * Generate recommendations automatically based on measurements
   */
  generateRecommendations: async (
    request: GenerateRecommendationsRequest,
  ): Promise<{
    success: boolean;
    data?: Recommendation[];
    message?: string;
  }> => {
    try {
      const response = await axios.post<Recommendation[]>(
        `${API_BASE_URL}/recommendations/generate`,
        request,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to generate recommendations");
    }
  },

  /**
   * Upload a photo for a room assessment
   */
  uploadPhoto: async (
    photo: PhotoRequest,
  ): Promise<{
    success: boolean;
    data?: Photo;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Photo>(
        `${API_BASE_URL}/photos`,
        photo,
        {
          headers: {
            ...authHeader(),
            "Content-Type": "application/json",
          },
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to upload photo");
    }
  },

  /**
   * Update a photo
   */
  updatePhoto: async (
    photoId: number,
    photo: Partial<Photo>,
  ): Promise<{
    success: boolean;
    data?: Photo;
    message?: string;
  }> => {
    try {
      const response = await axios.put<Photo>(
        `${API_BASE_URL}/photos/${photoId}`,
        photo,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update photo");
    }
  },

  /**
   * Delete a photo
   */
  deletePhoto: async (
    photoId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(`${API_BASE_URL}/photos/${photoId}`, {
        headers: authHeader(),
      });

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete photo");
    }
  },

  /**
   * Get photos by room assessment ID
   */
  getPhotosByRoomAssessment: async (
    roomAssessmentId: number,
  ): Promise<{
    success: boolean;
    data?: Photo[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<Photo[]>(
        `${API_BASE_URL}/room-assessments/${roomAssessmentId}/photos`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch photos");
    }
  },

  /**
   * Get compliance status for a room assessment
   */
  getRoomComplianceStatus: async (
    roomAssessmentId: number,
  ): Promise<{
    success: boolean;
    data?: {
      totalMeasurements: number;
      compliantMeasurements: number;
      nonCompliantMeasurements: number;
      compliancePercentage: number;
      criticalIssuesCount: number;
    };
    message?: string;
  }> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/room-assessments/${roomAssessmentId}/compliance-status`,
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch compliance status");
    }
  },

  /**
   * Get standard values for measurements based on client type
   */
  getStandardValues: async (
    clientTypeId: number,
    roomTypeId: number,
  ): Promise<{
    success: boolean;
    data?: { measurementTypeCode: string; standardValue: number }[];
    message?: string;
  }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/standard-values`, {
        headers: authHeader(),
        params: { clientTypeId, roomTypeId },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch standard values");
    }
  },
};

export { roomAssessmentService };
