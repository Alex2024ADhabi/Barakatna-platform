import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { ManpowerResource } from "@/lib/api/manpower/types";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";
import { Plus, Calendar, Phone, Mail } from "lucide-react";

const ContractorManagement = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [contractors, setContractors] = useState<ManpowerResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const resources = await manpowerApi.getResources();
        const contractorResources = resources.filter(
          (resource) => resource.isContractor,
        );
        setContractors(contractorResources);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contractors:", error);
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Calculate days remaining in contract
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("manpower.contractorManagement")}</CardTitle>
            <CardDescription>
              {t("manpower.contractorManagementDescription")}
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("manpower.addContractor")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("manpower.name")}</TableHead>
                <TableHead>{t("manpower.company")}</TableHead>
                <TableHead>{t("manpower.contractPeriod")}</TableHead>
                <TableHead>{t("manpower.contractNumber")}</TableHead>
                <TableHead>{t("manpower.contactPerson")}</TableHead>
                <TableHead>{t("manpower.status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : contractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                contractors.map((contractor) => {
                  const contractDetails = contractor.contractorDetails!;
                  const daysRemaining = getDaysRemaining(
                    contractDetails.contractEndDate,
                  );
                  const status =
                    daysRemaining <= 0
                      ? "expired"
                      : daysRemaining <= 30
                        ? "expiring"
                        : "active";

                  return (
                    <TableRow key={contractor.id}>
                      <TableCell className="font-medium">
                        {contractor.name}
                      </TableCell>
                      <TableCell>{contractDetails.companyName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(contractDetails.contractStartDate)} -{" "}
                          {formatDate(contractDetails.contractEndDate)}
                        </div>
                      </TableCell>
                      <TableCell>{contractDetails.contractNumber}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{contractDetails.contactPerson}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="mr-1 h-3 w-3" />
                            {contractDetails.contactEmail}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {contractDetails.contactPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "active"
                              ? "default"
                              : status === "expiring"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {status === "active"
                            ? t("manpower.active")
                            : status === "expiring"
                              ? `${daysRemaining} ${t("manpower.daysLeft")}`
                              : t("manpower.expired")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {t("common.manage")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractorManagement;
