// Basic types for drawing management
export interface Drawing {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  drawingNumber: string;
  version: string;
  fileUrl: string;
  uploadDate: string;
  status: string;
}

export interface DrawingAnnotation {
  id: number;
  drawingId: number;
  type: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  isResolved: boolean;
}
