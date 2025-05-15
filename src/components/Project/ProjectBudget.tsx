import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { projectApi } from "@/lib/api/project/projectApi";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface ProjectBudgetProps {
  projectId: number;
}

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setIsLoading(true);
        const response = await projectApi.getProjectBudgetSummary(projectId);

        if (response.success && response.data) {
          setBudgetData(response.data);
        }
      } catch (error) {
        console.error("Error fetching project budget data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no budget data is available, use mock data
  const budgetSummary = budgetData || {
    totalBudget: 50000,
    approvedBudget: 45000,
    actualCost: 32000,
    remainingBudget: 13000,
    categories: [
      { name: "Materials", allocated: 25000, spent: 18000 },
      { name: "Labor", allocated: 15000, spent: 12000 },
      { name: "Equipment", allocated: 5000, spent: 2000 },
    ],
    recentExpenses: [
      { date: "2023-05-15", description: "Bathroom fixtures", amount: 3500 },
      { date: "2023-05-10", description: "Flooring materials", amount: 4200 },
      { date: "2023-05-05", description: "Contractor payment", amount: 6000 },
    ],
  };

  const budgetUtilizationPercentage = Math.round(
    (budgetSummary.actualCost / budgetSummary.approvedBudget) * 100,
  );

  return (
    <Card className={directionClass}>
      <CardHeader>
        <CardTitle>{t("project.budgetSummary", "Budget Summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {t("project.totalBudget", "Total Budget")}
            </div>
            <div className="text-2xl font-bold">
              {budgetSummary.totalBudget.toLocaleString()} SAR
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {t("project.approvedBudget", "Approved Budget")}
            </div>
            <div className="text-2xl font-bold">
              {budgetSummary.approvedBudget.toLocaleString()} SAR
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {t("project.actualCost", "Actual Cost")}
            </div>
            <div className="text-2xl font-bold">
              {budgetSummary.actualCost.toLocaleString()} SAR
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {t("project.remainingBudget", "Remaining Budget")}
            </div>
            <div className="text-2xl font-bold">
              {budgetSummary.remainingBudget.toLocaleString()} SAR
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {t("project.budgetUtilization", "Budget Utilization")}
            </span>
            <span className="text-sm font-medium">
              {budgetUtilizationPercentage}%
            </span>
          </div>
          <Progress value={budgetUtilizationPercentage} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("project.budgetByCategory", "Budget by Category")}
          </h3>
          <div className="space-y-4">
            {budgetSummary.categories.map((category: any, index: number) => {
              const utilizationPercentage = Math.round(
                (category.spent / category.allocated) * 100,
              );
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm">
                      {category.spent.toLocaleString()} /{" "}
                      {category.allocated.toLocaleString()} SAR (
                      {utilizationPercentage}%)
                    </span>
                  </div>
                  <Progress value={utilizationPercentage} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("project.recentExpenses", "Recent Expenses")}
          </h3>
          <div className="space-y-2">
            {budgetSummary.recentExpenses.map((expense: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <div>
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-medium">
                  {expense.amount.toLocaleString()} SAR
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBudget;
