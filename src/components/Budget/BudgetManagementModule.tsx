import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import BudgetManagementDashboard from "./BudgetManagementDashboard";
import BudgetTracking from "./BudgetTracking";
import BudgetAllocation from "./BudgetAllocation";
import AllocationHistory from "./AllocationHistory";
import BudgetReports from "./BudgetReports";
import BudgetApprovalWorkflow from "./BudgetApprovalWorkflow";
import VarianceAnalysis from "./VarianceAnalysis";
import ExpenseEntry from "./ExpenseEntry";
import eventBus, { EventType, useEventSubscription } from "@/services/eventBus";

const BudgetManagementModule = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBudgetId, setSelectedBudgetId] = useState("1"); // Default to first budget

  const handleBudgetSelect = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
  };

  // Subscribe to relevant events
  useEventSubscription(EventType.PROJECT_COMPLETED, async (event) => {
    console.log("Project completed event received in Budget module:", event);
    // Here you would typically update budget allocations or trigger financial closeout
    // For demonstration purposes, we'll just publish a budget changed event
    if (event.payload.finalCost) {
      eventBus.publishBudgetChanged(
        "BudgetManagementModule",
        "1", // Using default budget ID
        500000, // Example previous amount
        500000 - event.payload.finalCost, // Example new amount
        `Budget adjusted after project ${event.payload.projectId} completion`,
        [event.payload.projectId],
      );
    }
  });

  useEventSubscription(EventType.COMMITTEE_DECISION, async (event) => {
    console.log("Committee decision event received in Budget module:", event);
    // If committee approved with a budget, we would update budget allocations
    if (event.payload.approved && event.payload.budget) {
      eventBus.publishBudgetChanged(
        "BudgetManagementModule",
        "1", // Using default budget ID
        500000, // Example previous amount
        500000 - event.payload.budget, // Example new amount
        `Budget allocated for assessment ${event.payload.assessmentId} after committee approval`,
        [],
        [],
      );
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("budget.budgetManagement")}</h1>
        <p className="text-muted-foreground">
          {t("budget.budgetManagementDescription")}
        </p>
      </div>

      <Tabs
        defaultValue="dashboard"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="dashboard">{t("common.dashboard")}</TabsTrigger>
          <TabsTrigger value="tracking">{t("budget.tracking")}</TabsTrigger>
          <TabsTrigger value="allocation">{t("budget.allocation")}</TabsTrigger>
          <TabsTrigger value="history">{t("budget.history")}</TabsTrigger>
          <TabsTrigger value="reports">{t("budget.reports")}</TabsTrigger>
          <TabsTrigger value="approval">{t("budget.approval")}</TabsTrigger>
          <TabsTrigger value="variance">{t("budget.variance")}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <BudgetManagementDashboard onBudgetSelect={handleBudgetSelect} />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BudgetTracking budgetId={selectedBudgetId} />
            </div>
            <div>
              <ExpenseEntry
                budgetId={selectedBudgetId}
                onExpenseAdded={() => console.log("Expense added")}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="mt-6">
          <BudgetAllocation budgetId={selectedBudgetId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <AllocationHistory budgetId={selectedBudgetId} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <BudgetReports budgetId={selectedBudgetId} />
        </TabsContent>

        <TabsContent value="approval" className="mt-6">
          <BudgetApprovalWorkflow />
        </TabsContent>

        <TabsContent value="variance" className="mt-6">
          <VarianceAnalysis budgetId={selectedBudgetId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetManagementModule;
