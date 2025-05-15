import { Drawing, DrawingAnnotation } from "./types";
import { mockDrawings, mockAnnotations } from "./mockData";

// Simple drawing API with mock data
export const drawingApi = {
  // Get all drawings
  getDrawings: async (projectId?: number): Promise<Drawing[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (projectId) {
      return mockDrawings.filter((drawing) => drawing.projectId === projectId);
    }
    return mockDrawings;
  },

  // Get a drawing by ID
  getDrawing: async (id: number): Promise<Drawing | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockDrawings.find((drawing) => drawing.id === id);
  },

  // Upload a new drawing (mock implementation)
  uploadDrawing: async (
    drawing: Omit<Drawing, "id" | "uploadDate">,
  ): Promise<Drawing> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newDrawing: Drawing = {
      ...drawing,
      id: Math.max(...mockDrawings.map((d) => d.id)) + 1,
      uploadDate: new Date().toISOString().split("T")[0],
    };

    mockDrawings.push(newDrawing);
    return newDrawing;
  },

  // Get annotations for a drawing
  getAnnotations: async (drawingId: number): Promise<DrawingAnnotation[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockAnnotations.filter(
      (annotation) => annotation.drawingId === drawingId,
    );
  },

  // Add an annotation to a drawing
  addAnnotation: async (
    annotation: Omit<DrawingAnnotation, "id">,
  ): Promise<DrawingAnnotation> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newAnnotation: DrawingAnnotation = {
      ...annotation,
      id: Math.max(...mockAnnotations.map((a) => a.id)) + 1,
    };

    mockAnnotations.push(newAnnotation);
    return newAnnotation;
  },

  // Update drawing status
  updateStatus: async (
    id: number,
    status: string,
  ): Promise<Drawing | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const drawing = mockDrawings.find((d) => d.id === id);
    if (drawing) {
      drawing.status = status;
    }

    return drawing;
  },
};
