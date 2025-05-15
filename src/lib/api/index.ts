// Export all API modules for easy importing

// Core API types and clients
export * from "./core/types";
export { apiClient } from "./core/apiClient";
export { graphqlClient } from "./core/graphqlClient";
export { websocketClient, WebSocketMessageType } from "./core/websocketClient";
export { batchClient, BatchOperationType } from "./core/batchClient";
export * from "./core/repository";
export {
  dataValidationService,
  SchemaType,
  ValidationResult,
  ValidationError,
} from "./core/dataValidation";

// Domain-specific API modules
export * from "./priceList/types";
export * from "./assessment/types";
export * from "./beneficiary/types";
export * from "./client/types";
export * from "./cohort/types";
export * from "./project/types";
export * from "./supplier/types";
export * from "./manpower/types";
export * from "./budget/types";
export * from "./program/types";
export * from "./committee/types";
export * from "./case/types";
export * from "./drawing/types";
export * from "./inspection/types";
export * from "./financial/types";

// Domain-specific API clients
export { priceListApi } from "./priceList/priceListApi";
export { assessmentApi } from "./assessment/assessmentApi";
export { assessmentHistoryApi } from "./assessment/assessmentHistoryApi";
export { beneficiaryApi } from "./beneficiary/beneficiaryApi";
export { clientApi } from "./client/clientApi";
export { cohortApi } from "./cohort/cohortApi";
export { cohortAnalyticsApi } from "./cohort/cohortAnalyticsApi";
export { projectApi } from "./project/projectApi";
export { supplierApi } from "./supplier/supplierApi";
export { manpowerApi } from "./manpower/manpowerApi";
export { budgetApi } from "./budget/budgetApi";
export { programApi } from "./program/programApi";
export { committeeApi } from "./committee/committeeApi";
export { caseApi } from "./case/caseApi";
export { drawingApi } from "./drawing/drawingApi";
export { inspectionApi } from "./inspection/inspectionApi";
export { financialApi } from "./financial/financialApi";

// Export event types for use in API modules
export { EventType } from "../services/eventBus";
