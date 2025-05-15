import InvoiceManagementDashboard from "./InvoiceManagementDashboard";
import InvoiceList from "./InvoiceList";
import InvoiceGenerator from "./InvoiceGenerator";
import InvoiceDetails from "./InvoiceDetails";
import PaymentForm from "./PaymentForm";
import FinancialModuleDashboard from "./FinancialModuleDashboard";
import FinancialReports from "./FinancialReports";
import InvoiceApprovalWorkflow from "./InvoiceApprovalWorkflow";
import InvoiceTemplateEditor from "./InvoiceTemplateEditor";
import BillingProfileManagement from "./BillingProfileManagement";

export {
  InvoiceManagementDashboard,
  InvoiceList,
  InvoiceGenerator,
  InvoiceDetails,
  PaymentForm,
  FinancialModuleDashboard,
  FinancialReports,
  InvoiceApprovalWorkflow,
  InvoiceTemplateEditor,
  BillingProfileManagement,
};

// Export a default component for the Financial module
const FinancialModule = {
  InvoiceManagementDashboard,
  InvoiceList,
  InvoiceGenerator,
  InvoiceDetails,
  PaymentForm,
  FinancialModuleDashboard,
  FinancialReports,
  InvoiceApprovalWorkflow,
  InvoiceTemplateEditor,
  BillingProfileManagement,
};

export default FinancialModule;
