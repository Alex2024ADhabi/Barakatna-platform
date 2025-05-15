// Financial API for Barakatna Platform
import { ApiResponse, QueryParams } from "../core/types";
import {
  Invoice,
  InvoiceStatus,
  Payment,
  BillingProfile,
  InvoiceTemplate,
  TaxConfiguration,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreatePaymentRequest,
  InvoiceApprovalRequest,
  FinancialReportRequest,
  InvoiceFilterParams,
  PaymentFilterParams,
  InvoiceResponse,
  InvoicesResponse,
  PaymentResponse,
  PaymentsResponse,
  BillingProfileResponse,
  BillingProfilesResponse,
  InvoiceTemplateResponse,
  InvoiceTemplatesResponse,
  TaxConfigurationResponse,
  TaxConfigurationsResponse,
  FinancialReportResponse,
} from "./types";

// Mock data for development
const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2023-001",
    clientId: "client-001",
    clientName: "Abdullah Al-Otaibi",
    clientType: "FDF",
    projectId: "proj-001",
    projectName: "Home Modification Project",
    issueDate: new Date(2023, 5, 15),
    dueDate: new Date(2023, 6, 15),
    status: InvoiceStatus.Paid,
    subtotal: 15000,
    taxAmount: 2250,
    totalAmount: 17250,
    paidAmount: 17250,
    notes: "Home modification services for senior citizen",
    paymentTerms: "Net 30",
    items: [
      {
        id: "item-001",
        invoiceId: "inv-001",
        description: "Bathroom Modification",
        quantity: 1,
        unitPrice: 10000,
        taxAmount: 1500,
        taxRate: 15,
        totalAmount: 11500,
      },
      {
        id: "item-002",
        invoiceId: "inv-001",
        description: "Kitchen Modification",
        quantity: 1,
        unitPrice: 5000,
        taxAmount: 750,
        taxRate: 15,
        totalAmount: 5750,
      },
    ],
    createdBy: "user-001",
    createdAt: new Date(2023, 5, 15),
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2023-002",
    clientId: "client-002",
    clientName: "Mohammed Al-Harbi",
    clientType: "ADHA",
    projectId: "proj-002",
    projectName: "Accessibility Improvement",
    issueDate: new Date(2023, 6, 1),
    dueDate: new Date(2023, 7, 1),
    status: InvoiceStatus.Pending,
    subtotal: 8000,
    taxAmount: 1200,
    totalAmount: 9200,
    notes: "Accessibility improvements for senior citizen residence",
    paymentTerms: "Net 30",
    items: [
      {
        id: "item-003",
        invoiceId: "inv-002",
        description: "Ramp Installation",
        quantity: 1,
        unitPrice: 3000,
        taxAmount: 450,
        taxRate: 15,
        totalAmount: 3450,
      },
      {
        id: "item-004",
        invoiceId: "inv-002",
        description: "Doorway Widening",
        quantity: 2,
        unitPrice: 2500,
        taxAmount: 750,
        taxRate: 15,
        totalAmount: 5750,
      },
    ],
    createdBy: "user-001",
    createdAt: new Date(2023, 6, 1),
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2023-003",
    clientId: "client-003",
    clientName: "Fatima Al-Saud",
    clientType: "Cash",
    issueDate: new Date(2023, 6, 15),
    dueDate: new Date(2023, 7, 15),
    status: InvoiceStatus.Overdue,
    subtotal: 12000,
    taxAmount: 1800,
    totalAmount: 13800,
    paidAmount: 5000,
    balanceDue: 8800,
    notes: "Home assessment and modification planning",
    paymentTerms: "Net 30",
    items: [
      {
        id: "item-005",
        invoiceId: "inv-003",
        description: "Home Assessment",
        quantity: 1,
        unitPrice: 2000,
        taxAmount: 300,
        taxRate: 15,
        totalAmount: 2300,
      },
      {
        id: "item-006",
        invoiceId: "inv-003",
        description: "Modification Planning",
        quantity: 1,
        unitPrice: 10000,
        taxAmount: 1500,
        taxRate: 15,
        totalAmount: 11500,
      },
    ],
    createdBy: "user-002",
    createdAt: new Date(2023, 6, 15),
  },
];

const mockPayments: Payment[] = [
  {
    id: "pay-001",
    invoiceId: "inv-001",
    receiptNumber: "REC-2023-001",
    amount: 17250,
    paymentDate: new Date(2023, 6, 10),
    paymentMethod: "bank_transfer",
    transactionId: "tx-12345",
    notes: "Full payment received",
    createdBy: "user-001",
    createdAt: new Date(2023, 6, 10),
  },
  {
    id: "pay-002",
    invoiceId: "inv-003",
    receiptNumber: "REC-2023-002",
    amount: 5000,
    paymentDate: new Date(2023, 7, 5),
    paymentMethod: "cash",
    notes: "Partial payment received",
    createdBy: "user-002",
    createdAt: new Date(2023, 7, 5),
  },
];

const mockBillingProfiles: BillingProfile[] = [
  {
    id: "bp-001",
    clientId: "client-001",
    clientType: "FDF",
    name: "FDF Main Office",
    contactName: "Ahmed Al-Mansour",
    contactEmail: "ahmed@fdf.org.sa",
    contactPhone: "+966 11 123 4567",
    billingAddress: "123 King Fahd Road",
    city: "Riyadh",
    region: "Riyadh Province",
    postalCode: "12345",
    country: "Saudi Arabia",
    taxId: "300000000000003",
    isDefault: true,
    createdAt: new Date(2023, 0, 1),
  },
  {
    id: "bp-002",
    clientId: "client-002",
    clientType: "ADHA",
    name: "ADHA Billing Department",
    contactName: "Khalid Al-Zahrani",
    contactEmail: "billing@adha.gov.sa",
    contactPhone: "+966 11 987 6543",
    billingAddress: "456 Olaya Street",
    city: "Riyadh",
    region: "Riyadh Province",
    postalCode: "54321",
    country: "Saudi Arabia",
    taxId: "300000000000004",
    isDefault: true,
    createdAt: new Date(2023, 0, 1),
  },
];

const mockInvoiceTemplates: InvoiceTemplate[] = [
  {
    id: "tpl-001",
    name: "Standard Template",
    description: "Default invoice template for all clients",
    headerContent: "<h1>INVOICE</h1>",
    footerContent: "<p>Thank you for your business</p>",
    termsAndConditions: "Standard terms and conditions apply",
    logoUrl: "https://example.com/logo.png",
    primaryColor: "#4f46e5",
    secondaryColor: "#e5e7eb",
    isDefault: true,
    createdBy: "system",
    createdAt: new Date(2023, 0, 1),
  },
  {
    id: "tpl-002",
    name: "FDF Template",
    description: "Custom template for FDF clients",
    headerContent: "<h1>FDF INVOICE</h1>",
    footerContent: "<p>Thank you for your partnership with FDF</p>",
    termsAndConditions: "FDF specific terms and conditions apply",
    logoUrl: "https://example.com/fdf-logo.png",
    primaryColor: "#1e40af",
    secondaryColor: "#bfdbfe",
    isDefault: false,
    createdBy: "system",
    createdAt: new Date(2023, 0, 1),
  },
];

const mockTaxConfigurations: TaxConfiguration[] = [
  {
    id: "tax-001",
    name: "VAT 15%",
    rate: 15,
    description: "Standard VAT rate in Saudi Arabia",
    isDefault: true,
    isActive: true,
    createdAt: new Date(2023, 0, 1),
  },
  {
    id: "tax-002",
    name: "VAT 0%",
    rate: 0,
    description: "Zero-rated VAT for exempt items",
    isDefault: false,
    isActive: true,
    createdAt: new Date(2023, 0, 1),
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Invoice API functions
export const getInvoices = async (
  params: QueryParams & InvoiceFilterParams,
): Promise<InvoicesResponse> => {
  await delay(500);

  let filteredInvoices = [...mockInvoices];

  // Apply filters
  if (params.clientId) {
    filteredInvoices = filteredInvoices.filter(
      (inv) => inv.clientId === params.clientId,
    );
  }

  if (params.clientType) {
    filteredInvoices = filteredInvoices.filter(
      (inv) => inv.clientType === params.clientType,
    );
  }

  if (params.projectId) {
    filteredInvoices = filteredInvoices.filter(
      (inv) => inv.projectId === params.projectId,
    );
  }

  if (params.status) {
    filteredInvoices = filteredInvoices.filter(
      (inv) => inv.status === params.status,
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filteredInvoices.sort((a: any, b: any) => {
      const aValue = a[params.sortBy as keyof Invoice];
      const bValue = b[params.sortBy as keyof Invoice];

      if (aValue < bValue) return params.sortDirection === "desc" ? 1 : -1;
      if (aValue > bValue) return params.sortDirection === "desc" ? -1 : 1;
      return 0;
    });
  }

  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + params.pageSize,
  );

  return {
    success: true,
    data: {
      items: paginatedInvoices,
      totalCount: filteredInvoices.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredInvoices.length / params.pageSize),
    },
  };
};

export const getInvoiceById = async (id: string): Promise<InvoiceResponse> => {
  await delay(300);
  const invoice = mockInvoices.find((inv) => inv.id === id);

  if (!invoice) {
    return {
      success: false,
      error: `Invoice with ID ${id} not found`,
    };
  }

  return {
    success: true,
    data: invoice,
  };
};

export const createInvoice = async (
  data: CreateInvoiceRequest,
): Promise<InvoiceResponse> => {
  await delay(700);

  const newInvoice: Invoice = {
    id: `inv-${Date.now().toString(36)}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${(mockInvoices.length + 1).toString().padStart(3, "0")}`,
    clientId: data.clientId,
    clientName: `Client ${data.clientId}`, // In a real app, would fetch client name
    clientType: data.clientType,
    projectId: data.projectId,
    projectName: data.projectId ? `Project ${data.projectId}` : undefined, // In a real app, would fetch project name
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: InvoiceStatus.Draft,
    subtotal: data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    ),
    taxAmount: data.items.reduce((sum, item) => {
      const itemTax = item.taxRate
        ? (item.quantity * item.unitPrice * item.taxRate) / 100
        : 0;
      return sum + itemTax;
    }, 0),
    totalAmount: 0, // Will be calculated below
    paymentTerms: data.paymentTerms,
    notes: data.notes,
    items: data.items.map((item, index) => {
      const taxAmount = item.taxRate
        ? (item.quantity * item.unitPrice * item.taxRate) / 100
        : 0;
      const discountAmount = item.discount || 0;
      const totalAmount =
        item.quantity * item.unitPrice + taxAmount - discountAmount;

      return {
        id: `item-${Date.now().toString(36)}-${index}`,
        invoiceId: `inv-${Date.now().toString(36)}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount,
        discount: item.discount,
        totalAmount,
      };
    }),
    createdBy: "current-user", // In a real app, would use authenticated user ID
    createdAt: new Date(),
  };

  // Calculate total amount
  newInvoice.totalAmount = newInvoice.subtotal + newInvoice.taxAmount;

  mockInvoices.push(newInvoice);

  return {
    success: true,
    data: newInvoice,
  };
};

export const updateInvoice = async (
  id: string,
  data: UpdateInvoiceRequest,
): Promise<InvoiceResponse> => {
  await delay(700);

  const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === id);

  if (invoiceIndex === -1) {
    return {
      success: false,
      error: `Invoice with ID ${id} not found`,
    };
  }

  const updatedInvoice = { ...mockInvoices[invoiceIndex] };

  // Update fields if provided
  if (data.clientId) updatedInvoice.clientId = data.clientId;
  if (data.clientType) updatedInvoice.clientType = data.clientType;
  if (data.projectId) updatedInvoice.projectId = data.projectId;
  if (data.issueDate) updatedInvoice.issueDate = data.issueDate;
  if (data.dueDate) updatedInvoice.dueDate = data.dueDate;
  if (data.status) updatedInvoice.status = data.status;
  if (data.paymentTerms) updatedInvoice.paymentTerms = data.paymentTerms;
  if (data.notes) updatedInvoice.notes = data.notes;

  // Update items if provided
  if (data.items) {
    updatedInvoice.items = data.items.map((item, index) => {
      const taxAmount = item.taxRate
        ? (item.quantity * item.unitPrice * item.taxRate) / 100
        : 0;
      const discountAmount = item.discount || 0;
      const totalAmount =
        item.quantity * item.unitPrice + taxAmount - discountAmount;

      return {
        id: item.id || `item-${Date.now().toString(36)}-${index}`,
        invoiceId: id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        taxAmount,
        discount: item.discount,
        totalAmount,
      };
    });

    // Recalculate subtotal and tax amount
    updatedInvoice.subtotal = updatedInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    updatedInvoice.taxAmount = updatedInvoice.items.reduce(
      (sum, item) => sum + (item.taxAmount || 0),
      0,
    );
    updatedInvoice.totalAmount =
      updatedInvoice.subtotal + updatedInvoice.taxAmount;
  }

  updatedInvoice.updatedBy = "current-user"; // In a real app, would use authenticated user ID
  updatedInvoice.updatedAt = new Date();

  mockInvoices[invoiceIndex] = updatedInvoice;

  return {
    success: true,
    data: updatedInvoice,
  };
};

export const deleteInvoice = async (
  id: string,
): Promise<ApiResponse<boolean>> => {
  await delay(500);

  const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === id);

  if (invoiceIndex === -1) {
    return {
      success: false,
      error: `Invoice with ID ${id} not found`,
    };
  }

  mockInvoices.splice(invoiceIndex, 1);

  return {
    success: true,
    data: true,
  };
};

// Payment API functions
export const getPayments = async (
  params: QueryParams & PaymentFilterParams,
): Promise<PaymentsResponse> => {
  await delay(500);

  let filteredPayments = [...mockPayments];

  // Apply filters
  if (params.invoiceId) {
    filteredPayments = filteredPayments.filter(
      (payment) => payment.invoiceId === params.invoiceId,
    );
  }

  // Apply sorting
  if (params.sortBy) {
    filteredPayments.sort((a: any, b: any) => {
      const aValue = a[params.sortBy as keyof Payment];
      const bValue = b[params.sortBy as keyof Payment];

      if (aValue < bValue) return params.sortDirection === "desc" ? 1 : -1;
      if (aValue > bValue) return params.sortDirection === "desc" ? -1 : 1;
      return 0;
    });
  }

  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + params.pageSize,
  );

  return {
    success: true,
    data: {
      items: paginatedPayments,
      totalCount: filteredPayments.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredPayments.length / params.pageSize),
    },
  };
};

export const createPayment = async (
  data: CreatePaymentRequest,
): Promise<PaymentResponse> => {
  await delay(700);

  // Find the invoice
  const invoiceIndex = mockInvoices.findIndex(
    (inv) => inv.id === data.invoiceId,
  );

  if (invoiceIndex === -1) {
    return {
      success: false,
      error: `Invoice with ID ${data.invoiceId} not found`,
    };
  }

  const invoice = mockInvoices[invoiceIndex];

  // Create new payment
  const newPayment: Payment = {
    id: `pay-${Date.now().toString(36)}`,
    invoiceId: data.invoiceId,
    receiptNumber:
      data.receiptNumber ||
      `REC-${new Date().getFullYear()}-${(mockPayments.length + 1).toString().padStart(3, "0")}`,
    amount: data.amount,
    paymentDate: data.paymentDate,
    paymentMethod: data.paymentMethod,
    transactionId: data.transactionId,
    notes: data.notes,
    createdBy: "current-user", // In a real app, would use authenticated user ID
    createdAt: new Date(),
  };

  mockPayments.push(newPayment);

  // Update invoice payment status
  const currentPaidAmount = invoice.paidAmount || 0;
  const newPaidAmount = currentPaidAmount + data.amount;
  const balanceDue = invoice.totalAmount - newPaidAmount;

  mockInvoices[invoiceIndex] = {
    ...invoice,
    paidAmount: newPaidAmount,
    balanceDue: balanceDue,
    status:
      balanceDue <= 0
        ? InvoiceStatus.Paid
        : newPaidAmount > 0
          ? InvoiceStatus.PartiallyPaid
          : invoice.status,
    updatedBy: "current-user",
    updatedAt: new Date(),
  };

  return {
    success: true,
    data: newPayment,
  };
};

// Billing Profile API functions
export const getBillingProfiles = async (
  params: QueryParams,
): Promise<BillingProfilesResponse> => {
  await delay(500);

  let filteredProfiles = [...mockBillingProfiles];

  // Apply filters
  if (params.clientId) {
    filteredProfiles = filteredProfiles.filter(
      (profile) => profile.clientId === params.clientId,
    );
  }

  if (params.clientType) {
    filteredProfiles = filteredProfiles.filter(
      (profile) => profile.clientType === params.clientType,
    );
  }

  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedProfiles = filteredProfiles.slice(
    startIndex,
    startIndex + params.pageSize,
  );

  return {
    success: true,
    data: {
      items: paginatedProfiles,
      totalCount: filteredProfiles.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredProfiles.length / params.pageSize),
    },
  };
};

// Invoice Template API functions
export const getInvoiceTemplates = async (
  params: QueryParams,
): Promise<InvoiceTemplatesResponse> => {
  await delay(500);

  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedTemplates = mockInvoiceTemplates.slice(
    startIndex,
    startIndex + params.pageSize,
  );

  return {
    success: true,
    data: {
      items: paginatedTemplates,
      totalCount: mockInvoiceTemplates.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(mockInvoiceTemplates.length / params.pageSize),
    },
  };
};

// Tax Configuration API functions
export const getTaxConfigurations = async (
  params: QueryParams,
): Promise<TaxConfigurationsResponse> => {
  await delay(500);

  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedConfigs = mockTaxConfigurations.slice(
    startIndex,
    startIndex + params.pageSize,
  );

  return {
    success: true,
    data: {
      items: paginatedConfigs,
      totalCount: mockTaxConfigurations.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(mockTaxConfigurations.length / params.pageSize),
    },
  };
};

// Invoice Approval API
export const approveInvoice = async (
  data: InvoiceApprovalRequest,
): Promise<InvoiceResponse> => {
  await delay(700);

  const invoiceIndex = mockInvoices.findIndex(
    (inv) => inv.id === data.invoiceId,
  );

  if (invoiceIndex === -1) {
    return {
      success: false,
      error: `Invoice with ID ${data.invoiceId} not found`,
    };
  }

  const invoice = { ...mockInvoices[invoiceIndex] };

  if (data.action === "approve") {
    invoice.status = InvoiceStatus.Approved;
  } else {
    invoice.status = InvoiceStatus.Rejected;
  }

  invoice.updatedBy = "current-user";
  invoice.updatedAt = new Date();

  mockInvoices[invoiceIndex] = invoice;

  return {
    success: true,
    data: invoice,
  };
};

// Export Invoice API
export const exportInvoice = async (
  id: string,
  format: "pdf" | "excel" | "csv",
): Promise<ApiResponse<string>> => {
  await delay(1000);

  const invoice = mockInvoices.find((inv) => inv.id === id);

  if (!invoice) {
    return {
      success: false,
      error: `Invoice with ID ${id} not found`,
    };
  }

  // In a real app, this would generate and return a URL to the exported file
  return {
    success: true,
    data: `https://api.example.com/exports/invoice-${id}.${format}`,
  };
};

// Send Invoice by Email API
export const sendInvoiceByEmail = async (
  id: string,
  email: string,
): Promise<ApiResponse<boolean>> => {
  await delay(1000);

  const invoice = mockInvoices.find((inv) => inv.id === id);

  if (!invoice) {
    return {
      success: false,
      error: `Invoice with ID ${id} not found`,
    };
  }

  // In a real app, this would send an email with the invoice
  return {
    success: true,
    data: true,
    message: `Invoice ${invoice.invoiceNumber} sent to ${email}`,
  };
};

// Financial Report API
export const generateFinancialReport = async (
  data: FinancialReportRequest,
): Promise<FinancialReportResponse> => {
  await delay(1500);

  // Mock report data
  const reportData = {
    reportType: data.reportType,
    generatedAt: new Date(),
    period: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
    totalInvoices: mockInvoices.length,
    totalAmount: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: mockInvoices.reduce(
      (sum, inv) => sum + (inv.paidAmount || 0),
      0,
    ),
    outstandingAmount: mockInvoices.reduce((sum, inv) => {
      const paid = inv.paidAmount || 0;
      return sum + (inv.totalAmount - paid);
    }, 0),
    statusBreakdown: {
      [InvoiceStatus.Draft]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Draft,
      ).length,
      [InvoiceStatus.Pending]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Pending,
      ).length,
      [InvoiceStatus.Approved]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Approved,
      ).length,
      [InvoiceStatus.Paid]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Paid,
      ).length,
      [InvoiceStatus.PartiallyPaid]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.PartiallyPaid,
      ).length,
      [InvoiceStatus.Overdue]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Overdue,
      ).length,
      [InvoiceStatus.Cancelled]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Cancelled,
      ).length,
      [InvoiceStatus.Rejected]: mockInvoices.filter(
        (inv) => inv.status === InvoiceStatus.Rejected,
      ).length,
    },
  };

  return {
    success: true,
    data: reportData,
  };
};
