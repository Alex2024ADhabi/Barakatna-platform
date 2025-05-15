// Financial API Types for Barakatna Platform
import { ApiResponse, PaginatedResponse, Status } from "../core/types";

// Invoice status types
export enum InvoiceStatus {
  Draft = "draft",
  Pending = "pending",
  Approved = "approved",
  Paid = "paid",
  PartiallyPaid = "partially_paid",
  Overdue = "overdue",
  Cancelled = "cancelled",
  Rejected = "rejected",
}

// Payment method types
export enum PaymentMethod {
  Cash = "cash",
  BankTransfer = "bank_transfer",
  CreditCard = "credit_card",
  Check = "check",
  OnlinePayment = "online_payment",
  MobilePayment = "mobile_payment",
}

// Financial report types
export enum FinancialReportType {
  InvoiceSummary = "invoice_summary",
  PaymentSummary = "payment_summary",
  AgingReceivables = "aging_receivables",
  RevenueByClient = "revenue_by_client",
  RevenueByProject = "revenue_by_project",
  TaxSummary = "tax_summary",
  ProfitAndLoss = "profit_and_loss",
}

// Invoice item
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount?: number;
  taxRate?: number;
  discount?: number;
  totalAmount: number;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientType: string;
  projectId?: string;
  projectName?: string;
  issueDate: Date | string;
  dueDate: Date | string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceDue?: number;
  notes?: string;
  paymentTerms?: string;
  items: InvoiceItem[];
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
}

// Payment
export interface Payment {
  id: string;
  invoiceId: string;
  receiptNumber?: string;
  amount: number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
}

// Billing Profile
export interface BillingProfile {
  id: string;
  clientId: string;
  clientType: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  taxId?: string;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Invoice Template
export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  headerContent?: string;
  footerContent?: string;
  termsAndConditions?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
}

// Tax Configuration
export interface TaxConfiguration {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Create Invoice Request
export interface CreateInvoiceRequest {
  clientId: string;
  clientType: string;
  projectId?: string;
  issueDate: Date | string;
  dueDate: Date | string;
  paymentTerms?: string;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }[];
  billingProfileId?: string;
  templateId?: string;
}

// Update Invoice Request
export interface UpdateInvoiceRequest {
  clientId?: string;
  clientType?: string;
  projectId?: string;
  issueDate?: Date | string;
  dueDate?: Date | string;
  status?: InvoiceStatus;
  paymentTerms?: string;
  notes?: string;
  items?: {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
  }[];
  billingProfileId?: string;
  templateId?: string;
}

// Create Payment Request
export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  receiptNumber?: string;
}

// Invoice Approval Request
export interface InvoiceApprovalRequest {
  invoiceId: string;
  action: "approve" | "reject";
  comments?: string;
}

// Financial Report Request
export interface FinancialReportRequest {
  reportType: FinancialReportType;
  startDate: string;
  endDate: string;
  clientId?: string;
  clientType?: string;
  projectId?: string;
}

// Invoice Filter Parameters
export interface InvoiceFilterParams {
  invoiceNumber?: string;
  clientId?: string;
  clientType?: string;
  projectId?: string;
  status?: InvoiceStatus;
  issueDateFrom?: Date | string;
  issueDateTo?: Date | string;
  dueDateFrom?: Date | string;
  dueDateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

// Payment Filter Parameters
export interface PaymentFilterParams {
  receiptNumber?: string;
  invoiceId?: string;
  clientId?: string;
  paymentMethod?: PaymentMethod;
  paymentDateFrom?: Date | string;
  paymentDateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

// API Response Types
export type InvoiceResponse = ApiResponse<Invoice>;
export type InvoicesResponse = ApiResponse<PaginatedResponse<Invoice>>;
export type PaymentResponse = ApiResponse<Payment>;
export type PaymentsResponse = ApiResponse<PaginatedResponse<Payment>>;
export type BillingProfileResponse = ApiResponse<BillingProfile>;
export type BillingProfilesResponse = ApiResponse<
  PaginatedResponse<BillingProfile>
>;
export type InvoiceTemplateResponse = ApiResponse<InvoiceTemplate>;
export type InvoiceTemplatesResponse = ApiResponse<
  PaginatedResponse<InvoiceTemplate>
>;
export type TaxConfigurationResponse = ApiResponse<TaxConfiguration>;
export type TaxConfigurationsResponse = ApiResponse<
  PaginatedResponse<TaxConfiguration>
>;
export type FinancialReportResponse = ApiResponse<any>;
