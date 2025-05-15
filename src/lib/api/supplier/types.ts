// Supplier API Types

// Supplier entity interface
export interface Supplier {
  id: string;
  name: string;
  arabicName?: string;
  logo?: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  website?: string;
  specialties: string[];
  description: string;
  registrationDate?: Date;
  lastOrderDate?: Date;
  totalOrders?: number;
  totalSpend?: number;
  paymentTerms?: string;
  notes?: string;
  tags?: string[];
}

// Supplier document interface
export interface SupplierDocument {
  id: string;
  supplierId: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  url?: string;
  fileKey?: string;
}

// Supplier order interface
export interface SupplierOrder {
  id: string;
  supplierId: string;
  date: Date;
  items: string;
  quantity: number;
  amount: number;
  status: "delivered" | "pending" | "cancelled";
  deliveryDate?: Date;
  notes?: string;
}

// Supplier review interface
export interface SupplierReview {
  id: string;
  supplierId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

// Create supplier request
export interface CreateSupplierRequest {
  name: string;
  arabicName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  website?: string;
  specialties: string[];
  description: string;
  status: "active" | "inactive" | "pending";
}

// Update supplier request
export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

// Create order request
export interface CreateOrderRequest {
  supplierId: string;
  items: string;
  quantity: number;
  amount: number;
  notes?: string;
}

// Create review request
export interface CreateReviewRequest {
  supplierId: string;
  rating: number;
  comment: string;
}

// Upload document request
export interface UploadDocumentRequest {
  supplierId: string;
  name: string;
  type: string;
  file: File;
}

// Filter parameters for supplier list
export interface SupplierFilterParams {
  name?: string;
  category?: string;
  status?: "active" | "inactive" | "pending";
  minRating?: number;
  city?: string;
  country?: string;
}
