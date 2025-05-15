import { Drawing, DrawingAnnotation } from "./types";

// Mock drawings data
export const mockDrawings: Drawing[] = [
  {
    id: 1,
    projectId: 1,
    title: "Bathroom Layout",
    description: "Detailed bathroom layout with dimensions",
    drawingNumber: "DWG-001",
    version: "1.0",
    fileUrl:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
    uploadDate: "2023-06-15",
    status: "Approved",
  },
  {
    id: 2,
    projectId: 1,
    title: "Kitchen Modifications",
    description: "Kitchen accessibility modifications",
    drawingNumber: "DWG-002",
    version: "1.0",
    fileUrl:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
    uploadDate: "2023-06-18",
    status: "In Review",
  },
  {
    id: 3,
    projectId: 2,
    title: "Bedroom Accessibility",
    description: "Bedroom modifications for improved accessibility",
    drawingNumber: "DWG-003",
    version: "2.1",
    fileUrl:
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&q=80",
    uploadDate: "2023-05-10",
    status: "Approved",
  },
];

// Mock annotations data
export const mockAnnotations: DrawingAnnotation[] = [
  {
    id: 1,
    drawingId: 1,
    type: "note",
    content: "Check dimensions here",
    x: 150,
    y: 200,
    color: "#FF0000",
    isResolved: false,
  },
  {
    id: 2,
    drawingId: 1,
    type: "area",
    content: "Needs modification",
    x: 300,
    y: 250,
    width: 100,
    height: 80,
    color: "#0000FF",
    isResolved: true,
  },
];
