import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BudgetSummary as BudgetSummaryType } from "@/lib/api/budget/types";
import { useTranslation } from "react-i18next";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BudgetSummaryProps {
  budget: BudgetSummaryType;
}

const BudgetSummary = ({ budget }: BudgetSummaryProps) => {
  const { t } = useTranslation();

  // Calculate variance
  const variance = budget.totalActual - budget.totalPlanned;
  const variancePercentage =
    budget.totalPlanned > 0 ? (variance / budget.totalPlanned) * 100 : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: budget.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine status color
  const getStatusColor = () => {
    if (budget.status === "active") return "bg-green-500";
    if (budget.status === "draft") return "bg-gray-300";
    if (budget.status === "closed") return "bg-gray-500";
    if (budget.status === "archived") return "bg-amber-500";
    return "bg-gray-300";
  };

  // Determine utilization color
  const getUtilizationColor = () => {
    if (budget.utilization > 90) return "bg-red-500";
    if (budget.utilization > 70) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 w-full ${getStatusColor()}`}></div>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              {budget.client?.name || t("common.general")}
            </h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {budget.status === "active"
                ? t("budget.active")
                : budget.status === "draft"
                  ? t("budget.draft")
                  : budget.status === "closed"
                    ? t("budget.closed")
                    : t("budget.archived")}
            </span>
          </div>
          <h2 className="font-semibold text-xl truncate" title={budget.name}>
            {budget.name}
          </h2>
          <div className="flex justify-between items-baseline mt-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("budget.planned")}
              </p>
              <p className="text-lg font-medium">
                {formatCurrency(budget.totalPlanned)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("budget.actual")}
              </p>
              <p className="text-lg font-medium">
                {formatCurrency(budget.totalActual)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("budget.variance")}
              </p>
              <div className="flex items-center">
                {variance > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                    <span className="text-lg font-medium text-red-500">
                      {formatCurrency(Math.abs(variance))}
                    </span>
                  </>
                ) : variance < 0 ? (
                  <>
                    <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-lg font-medium text-green-500">
                      {formatCurrency(Math.abs(variance))}
                    </span>
                  </>
                ) : (
                  <>
                    <Minus className="mr-1 h-4 w-4 text-gray-500" />
                    <span className="text-lg font-medium text-gray-500">0</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">{t("budget.utilization")}</span>
              <span className="text-sm font-medium">
                {budget.utilization.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUtilizationColor()}`}
                style={{ width: `${Math.min(100, budget.utilization)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center w-full">
          <span className="text-xs text-muted-foreground">
            {new Date(budget.startDate).toLocaleDateString()} -{" "}
            {new Date(budget.endDate).toLocaleDateString()}
          </span>
          <button className="text-sm font-medium flex items-center text-primary hover:underline">
            {t("common.details")} <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BudgetSummary;
