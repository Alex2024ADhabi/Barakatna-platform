import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InvoiceManagementDashboard from "./InvoiceManagementDashboard";
import BillingProfileManagement from "./BillingProfileManagement";
import InvoiceTemplateEditor from "./InvoiceTemplateEditor";
import FinancialReports from "./FinancialReports";

import { ClientType } from "@/lib/forms/types";

interface FinancialModuleDashboardProps {
  clientId?: string;
  clientType?: string | ClientType;
  projectId?: string;
}

const FinancialModuleDashboard: React.FC<FinancialModuleDashboardProps> = ({
  clientId,
  clientType,
  projectId,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-6">{t("Financial Management")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="invoices">{t("Invoice Management")}</TabsTrigger>
          <TabsTrigger value="billing">{t("Billing Profiles")}</TabsTrigger>
          <TabsTrigger value="templates">{t("Invoice Templates")}</TabsTrigger>
          <TabsTrigger value="reports">{t("Financial Reports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <InvoiceManagementDashboard
            clientId={clientId}
            clientType={clientType}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingProfileManagement
            clientId={clientId || "client-001"}
            clientType={clientType || ClientType.FDF}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <InvoiceTemplateEditor />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports
            clientId={clientId}
            clientType={clientType}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialModuleDashboard;
