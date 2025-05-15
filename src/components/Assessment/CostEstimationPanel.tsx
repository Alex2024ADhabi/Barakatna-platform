import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowDown,
  CheckCircle,
  Download,
  Loader2,
  Minus,
  Printer,
} from "lucide-react";

// Types
interface Recommendation {
  recommendationId: number;
  roomAssessmentId: number;
  recommendationTypeId: number;
  recommendationTypeCode: string;
  recommendationTypeName: string;
  priorityLevel: number;
  description: string;
  reason: string;
  estimatedCost: number;
  isSelected: boolean;
  isApproved: boolean;
}

interface PriceListItem {
  priceListItemId: number;
  priceListId: number;
  itemCode: string;
  itemName: string;
  description: string;
  categoryId: number;
  categoryName: string;
  unitOfMeasure: string;
  unitPrice: number;
  supplierId: number;
  supplierName: string;
  taxPercentage: number;
  minimumOrderQuantity: number;
  leadTimeDays: number;
}

interface CostEstimationPanelProps {
  recommendations: Recommendation[];
  clientType: string; // 'FDF', 'ADHA', or 'CASH'
}

const CostEstimationPanel: React.FC<CostEstimationPanelProps> = ({
  recommendations,
  clientType,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // State variables
  const [priceListItems, setPriceListItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load price list items
  useEffect(() => {
    const loadPriceListItems = async () => {
      try {
        setLoading(true);

        // Placeholder for API call
        const response = await fetch(
          `/api/price-list?clientType=${clientType}`,
        );
        const data = await response.json();

        if (data.success) {
          setPriceListItems(data.data);
        } else {
          throw new Error(data.message || "Failed to load price list items");
        }
      } catch (error) {
        console.error("Error loading price list items:", error);
        setError(t("costEstimation.errors.loadPriceListFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadPriceListItems();
  }, [clientType, t]);

  // Filter selected recommendations
  const selectedRecommendations = recommendations.filter(
    (rec) => rec.isSelected,
  );

  // Calculate total cost
  const totalCost = selectedRecommendations.reduce(
    (sum, rec) => sum + (rec.estimatedCost || 0),
    0,
  );

  // Group recommendations by priority for pie chart
  const costByPriority = [
    {
      name: t("recommendation.priority.high"),
      value: selectedRecommendations
        .filter((rec) => rec.priorityLevel === 1)
        .reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0),
      color: "bg-destructive",
      priorityLevel: 1,
    },
    {
      name: t("recommendation.priority.medium"),
      value: selectedRecommendations
        .filter((rec) => rec.priorityLevel === 2)
        .reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0),
      color: "bg-amber-500",
      priorityLevel: 2,
    },
    {
      name: t("recommendation.priority.low"),
      value: selectedRecommendations
        .filter((rec) => rec.priorityLevel === 3)
        .reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0),
      color: "bg-blue-500",
      priorityLevel: 3,
    },
  ].filter((item) => item.value > 0);

  // Get priority icon
  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1: // High
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 2: // Medium
        return <Minus className="h-4 w-4 text-amber-500" />;
      case 3: // Low
        return <ArrowDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-amber-500" />;
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return t("recommendation.priority.high");
      case 2:
        return t("recommendation.priority.medium");
      case 3:
        return t("recommendation.priority.low");
      default:
        return t("recommendation.priority.medium");
    }
  };

  // Calculate budget threshold based on client type
  const getBudgetThreshold = () => {
    switch (clientType) {
      case "FDF":
        return 15000; // AED - Fund for Development of Fisheries
      case "ADHA":
        return 20000; // AED - Abu Dhabi Housing Authority
      case "CASH":
        return 25000; // AED - Cash clients have higher thresholds
      default:
        return 20000; // AED - Default threshold
    }
  };

  // Get client-specific funding information
  const getClientFundingInfo = () => {
    switch (clientType) {
      case "FDF":
        return {
          fundingName: t("FDF Funding"),
          eligibilityNote: t(
            "Eligible for up to 80% funding for accessibility modifications",
          ),
          approvalProcess: t("Requires committee approval within 14 days"),
        };
      case "ADHA":
        return {
          fundingName: t("ADHA Housing Support"),
          eligibilityNote: t(
            "Eligible for full funding of required accessibility modifications",
          ),
          approvalProcess: t(
            "Requires compliance verification and technical approval",
          ),
        };
      case "CASH":
        return {
          fundingName: t("Self-Funded"),
          eligibilityNote: t("No external funding available"),
          approvalProcess: t("No approval process required"),
        };
      default:
        return {
          fundingName: t("Standard Funding"),
          eligibilityNote: t("Funding eligibility varies"),
          approvalProcess: t("Standard approval process applies"),
        };
    }
  };

  const budgetThreshold = getBudgetThreshold();
  const isOverBudget = totalCost > budgetThreshold;

  // Calculate percentage of budget used
  const budgetPercentage = Math.min((totalCost / budgetThreshold) * 100, 100);

  // Print cost estimation
  const handlePrint = () => {
    window.print();
  };

  // Export as PDF
  const handleExport = () => {
    // This would be implemented with a PDF generation library
    // For now, just show an alert
    alert(t("costEstimation.pdfExportNotImplemented"));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (selectedRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {t("costEstimation.noSelectedRecommendations")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // SVG Pie Chart for Cost Breakdown by Priority
  const PieChart = ({
    data,
  }: {
    data: {
      name: string;
      value: number;
      color: string;
      priorityLevel: number;
    }[];
  }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return null;

    let startAngle = 0;
    const radius = 60;
    const centerX = 80;
    const centerY = 80;

    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((item, index) => {
          const percentage = item.value / total;
          const endAngle = startAngle + percentage * 360;

          // Calculate the path for the pie slice
          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = percentage > 0.5 ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ");

          const currentStartAngle = startAngle;
          startAngle = endAngle;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <div className="col-span-1 md:col-span-5">
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("costEstimation.costEstimation")}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {t("costEstimation.buttons.print")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("costEstimation.buttons.export")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%]">#</TableHead>
                    <TableHead className="w-[10%]">
                      {t("costEstimation.table.priority")}
                    </TableHead>
                    <TableHead className="w-[40%]">
                      {t("costEstimation.table.description")}
                    </TableHead>
                    <TableHead className="w-[15%]">
                      {t("costEstimation.table.type")}
                    </TableHead>
                    <TableHead className="w-[15%] text-right">
                      {t("costEstimation.table.estimatedCost")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRecommendations.map((recommendation, index) => (
                    <TableRow key={recommendation.recommendationId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPriorityIcon(recommendation.priorityLevel)}
                          <span className="ml-2 text-sm">
                            {getPriorityLabel(recommendation.priorityLevel)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{recommendation.description}</TableCell>
                      <TableCell>
                        {recommendation.recommendationTypeName}
                      </TableCell>
                      <TableCell className="text-right">
                        {recommendation.estimatedCost
                          ? recommendation.estimatedCost.toFixed(2)
                          : "0.00"}{" "}
                        AED
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      {t("costEstimation.table.subtotal")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {totalCost.toFixed(2)} AED
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      {t("costEstimation.table.tax")} (5%)
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(totalCost * 0.05).toFixed(2)} AED
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      {t("costEstimation.table.total")}
                    </TableCell>
                    <TableCell className="text-right font-medium text-lg">
                      {(totalCost * 1.05).toFixed(2)} AED
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Budget Analysis Section */}
        <div className="col-span-1 md:col-span-3">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{t("costEstimation.budgetAnalysis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {t("costEstimation.budgetUsage")}
                    </span>
                    <span className="text-sm font-medium">
                      {totalCost.toFixed(2)} / {budgetThreshold.toFixed(2)} AED
                    </span>
                  </div>
                  <Progress value={budgetPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Budget Status */}
                <div className="pt-2">
                  {isOverBudget ? (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("costEstimation.overBudget")}</AlertTitle>
                      <AlertDescription>
                        {t("costEstimation.overBudgetDescription", {
                          amount: (totalCost - budgetThreshold).toFixed(2),
                        })}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>
                        {t("costEstimation.withinBudget")}
                      </AlertTitle>
                      <AlertDescription>
                        {t("costEstimation.withinBudgetDescription", {
                          amount: (budgetThreshold - totalCost).toFixed(2),
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Client-specific funding information */}
                <div className="pt-2">
                  <div className="bg-muted p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-2">
                      {getClientFundingInfo().fundingName}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      {getClientFundingInfo().eligibilityNote}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getClientFundingInfo().approvalProcess}
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown by Priority */}
                <div className="pt-4">
                  <Separator className="my-4" />
                  <h4 className="text-sm font-medium mb-4">
                    {t("costEstimation.costBreakdown")}
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <PieChart data={costByPriority} />
                    </div>
                    <div className="flex-1">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t("costEstimation.table.priority")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("costEstimation.table.cost")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {costByPriority.map((item) => (
                            <TableRow key={item.priorityLevel}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full ${item.color} mr-2`}
                                  ></div>
                                  {item.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.value.toFixed(2)} AED
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationPanel;
