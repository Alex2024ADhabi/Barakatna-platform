import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { BudgetRevision } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  Undo2,
} from "lucide-react";

interface RevisionDetailsProps {
  revision: BudgetRevision;
  onBack: () => void;
}

const RevisionDetails = ({ revision, onBack }: RevisionDetailsProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [loading, setLoading] = useState(false);
  const [categoryChanges, setCategoryChanges] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategoryChanges = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API endpoint
        // For now, we'll use mock data
        const mockCategoryChanges = [
          {
            categoryId: "1",
            categoryName: "Materials",
            previousAmount: 200000,
            newAmount: 220000,
            change: 20000,
            changePercent: 10,
          },
          {
            categoryId: "2",
            categoryName: "Labor",
            previousAmount: 150000,
            newAmount: 160000,
            change: 10000,
            changePercent: 6.67,
          },
          {
            categoryId: "3",
            categoryName: "Equipment",
            previousAmount: 100000,
            newAmount: 110000,
            change: 10000,
            changePercent: 10,
          },
          {
            categoryId: "4",
            categoryName: "Administrative",
            previousAmount: 50000,
            newAmount: 60000,
            change: 10000,
            changePercent: 20,
          },
        ];

        setCategoryChanges(mockCategoryChanges);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category changes:", error);
        setLoading(false);
      }
    };

    fetchCategoryChanges();
  }, [revision.id]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">{t("budget.approved")}</Badge>;
      case "pending":
        return <Badge variant="outline">{t("budget.pending")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">{t("budget.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const change = revision.newAmount - revision.previousAmount;
  const changePercent = (change / revision.previousAmount) * 100;
  const isIncrease = change > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t("budget.revisionDetails", { number: revision.revisionNumber })}
            </h2>
            <p className="text-muted-foreground">
              {formatDate(revision.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            {t("common.print")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("common.export")}
          </Button>
          {revision.status === "pending" && (
            <Button>
              <Undo2 className="mr-2 h-4 w-4" />
              {t("budget.revertToThisVersion")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("budget.revisionSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("budget.revisionNumber")}:
              </span>
              <span className="font-bold">{revision.revisionNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("common.status")}:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(revision.status)}
                {getStatusBadge(revision.status)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("budget.previousAmount")}:
              </span>
              <span>{formatAmount(revision.previousAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("budget.newAmount")}:
              </span>
              <span>{formatAmount(revision.newAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("budget.change")}:</span>
              <span
                className={`${isIncrease ? "text-red-500" : "text-green-500"}`}
              >
                {isIncrease ? "+" : ""}
                {formatAmount(change)} ({isIncrease ? "+" : ""}
                {changePercent.toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("budget.revisionDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t("budget.reason")}:</h3>
              <p className="mt-1">{revision.reason}</p>
            </div>

            {revision.notes && (
              <div>
                <h3 className="text-sm font-medium">{t("common.notes")}:</h3>
                <p className="mt-1">{revision.notes}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">
                  {t("budget.createdBy")}:
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{revision.createdBy}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(revision.createdAt)}</span>
                </div>
              </div>

              {revision.approvedBy && revision.approvedAt && (
                <div>
                  <h3 className="text-sm font-medium">
                    {t("budget.approvedBy")}:
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{revision.approvedBy}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(revision.approvedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("budget.categoryChanges")}</CardTitle>
          <CardDescription>
            {t("budget.categoryChangesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : categoryChanges.length === 0 ? (
            <div className="flex h-20 items-center justify-center">
              <p className="text-muted-foreground">
                {t("budget.noCategoryChanges")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryChanges.map((change) => (
                <div
                  key={change.categoryId}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-medium">{change.categoryName}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:flex md:items-center md:gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {t("budget.previousAmount")}
                      </p>
                      <p className="font-medium">
                        {formatAmount(change.previousAmount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {t("budget.newAmount")}
                      </p>
                      <p className="font-medium">
                        {formatAmount(change.newAmount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {t("budget.change")}
                      </p>
                      <p
                        className={`font-medium ${change.change > 0 ? "text-red-500" : "text-green-500"}`}
                      >
                        {change.change > 0 ? "+" : ""}
                        {formatAmount(change.change)} (
                        {change.change > 0 ? "+" : ""}
                        {change.changePercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("budget.approvalHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{t("budget.revisionCreated")}</p>
                <p className="text-sm text-muted-foreground">
                  {revision.createdBy} - {formatDateTime(revision.createdAt)}
                </p>
              </div>
            </div>

            {revision.status === "approved" &&
              revision.approvedBy &&
              revision.approvedAt && (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("budget.revisionApproved")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {revision.approvedBy} -{" "}
                      {formatDateTime(revision.approvedAt)}
                    </p>
                  </div>
                </div>
              )}

            {revision.status === "rejected" &&
              revision.approvedBy &&
              revision.approvedAt && (
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {t("budget.revisionRejected")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {revision.approvedBy} -{" "}
                      {formatDateTime(revision.approvedAt)}
                    </p>
                  </div>
                </div>
              )}

            {revision.status === "pending" && (
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">{t("budget.pendingApproval")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("budget.awaitingApproval")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {revision.status === "pending" && (
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" className="border-red-500 text-red-500">
                {t("budget.reject")}
              </Button>
              <Button className="bg-green-500 hover:bg-green-600">
                {t("budget.approve")}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default RevisionDetails;
