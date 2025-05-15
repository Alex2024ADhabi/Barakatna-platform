import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Plus,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Laptop,
  ClipboardList,
} from "lucide-react";
import PurchaseRequestList from "./PurchaseRequestList";
import PurchaseOrderList from "./PurchaseOrderList";
import InventoryManagement from "./InventoryManagement";
import EquipmentManagement from "./EquipmentManagement";
import EquipmentAudit from "./EquipmentAudit";
import SupplierManagement from "./SupplierManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import PurchaseRequestForm from "./PurchaseRequestForm";
import { PurchaseRequestFormDialog } from "./PurchaseRequestForm";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { PurchaseOrderFormDialog } from "./PurchaseOrderForm";

// Mock data for analytics
const procurementAnalytics = {
  totalSpend: 245000,
  pendingRequests: 12,
  pendingOrders: 8,
  lowStockItems: 5,
  monthlySpend: [
    { month: "Jan", amount: 18000 },
    { month: "Feb", amount: 22000 },
    { month: "Mar", amount: 17500 },
    { month: "Apr", amount: 24000 },
    { month: "May", amount: 19500 },
    { month: "Jun", amount: 26000 },
    { month: "Jul", amount: 21000 },
    { month: "Aug", amount: 23000 },
    { month: "Sep", amount: 25000 },
    { month: "Oct", amount: 28000 },
    { month: "Nov", amount: 22000 },
    { month: "Dec", amount: 19000 },
  ],
  topCategories: [
    { name: "Building Materials", amount: 85000 },
    { name: "Medical Equipment", amount: 65000 },
    { name: "Home Modifications", amount: 55000 },
    { name: "Safety Equipment", amount: 40000 },
  ],
  approvalRate: 85,
  avgProcessingTime: 3.2, // days
  inventoryValue: 175000,
};

const ProcurementManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateRequestDialogOpen, setIsCreateRequestDialogOpen] =
    useState(false);
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false);

  const handleAddAction = () => {
    // Handle action based on active tab
    switch (activeTab) {
      case "purchase-requests":
        setIsCreateRequestDialogOpen(true);
        break;
      case "purchase-orders":
        setIsCreateOrderDialogOpen(true);
        break;
      case "inventory":
        // Open add inventory item dialog
        break;
      case "equipment":
        // Open add equipment dialog
        break;
      case "equipment-audit":
        // Open new audit dialog
        break;
      case "suppliers":
        // Open add supplier dialog
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {t("procurement.title", "Procurement Management")}
            </CardTitle>
            <CardDescription>
              {t(
                "procurement.description",
                "Manage purchase requests, orders, inventory, and suppliers",
              )}
            </CardDescription>
          </div>
          {activeTab !== "dashboard" && (
            <Button onClick={handleAddAction}>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "purchase-requests"
                ? t("procurement.createRequest", "Create Request")
                : activeTab === "purchase-orders"
                  ? t("procurement.createOrder", "Create Order")
                  : activeTab === "inventory"
                    ? t("procurement.addItem", "Add Item")
                    : activeTab === "equipment"
                      ? t("procurement.addEquipment", "Add Equipment")
                      : activeTab === "equipment-audit"
                        ? t("procurement.newAudit", "New Audit")
                        : t("procurement.addSupplier", "Add Supplier")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("procurement.dashboard", "Dashboard")}
              </TabsTrigger>
              <TabsTrigger value="purchase-requests">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("procurement.purchaseRequests", "Purchase Requests")}
              </TabsTrigger>
              <TabsTrigger value="purchase-orders">
                <Package className="h-4 w-4 mr-2" />
                {t("procurement.purchaseOrders", "Purchase Orders")}
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Package className="h-4 w-4 mr-2" />
                {t("procurement.inventory", "Inventory")}
              </TabsTrigger>
              <TabsTrigger value="equipment">
                <Laptop className="h-4 w-4 mr-2" />
                {t("procurement.equipment", "Equipment")}
              </TabsTrigger>
              <TabsTrigger value="equipment-audit">
                <ClipboardList className="h-4 w-4 mr-2" />
                {t("procurement.equipmentAudit", "Equipment Audit")}
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                <Users className="h-4 w-4 mr-2" />
                {t("procurement.suppliers", "Suppliers")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("procurement.totalSpend", "Total Spend")}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {procurementAnalytics.totalSpend.toLocaleString()} AED
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("procurement.yearToDate", "Year to date")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("procurement.pendingApprovals", "Pending Approvals")}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {procurementAnalytics.pendingRequests}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "procurement.requestsAwaitingApproval",
                        "Requests awaiting approval",
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("procurement.lowStockItems", "Low Stock Items")}
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {procurementAnalytics.lowStockItems}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "procurement.itemsNeedingRestock",
                        "Items needing restock",
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("procurement.approvalRate", "Approval Rate")}
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {procurementAnalytics.approvalRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("procurement.requestsApproved", "Requests approved")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("procurement.monthlySpend", "Monthly Spend")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      {/* This would be a chart in a real implementation */}
                      <div className="flex h-full items-end gap-2">
                        {procurementAnalytics.monthlySpend.map((month) => {
                          const height = (month.amount / 30000) * 100;
                          return (
                            <div
                              key={month.month}
                              className="flex flex-col items-center flex-1"
                            >
                              <div
                                className="bg-primary/90 rounded-sm w-full"
                                style={{ height: `${height}%` }}
                              />
                              <span className="text-xs mt-2">
                                {month.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("procurement.spendByCategory", "Spend by Category")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {procurementAnalytics.topCategories.map((category) => {
                        const percentage =
                          (category.amount / procurementAnalytics.totalSpend) *
                          100;
                        return (
                          <div key={category.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {category.name}
                              </span>
                              <span className="text-sm font-medium">
                                {category.amount.toLocaleString()} AED (
                                {percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t(
                        "procurement.procurementMetrics",
                        "Procurement Metrics",
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t(
                            "procurement.avgProcessingTime",
                            "Avg. Processing Time",
                          )}
                        </span>
                        <span className="font-medium">
                          {procurementAnalytics.avgProcessingTime} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("procurement.pendingOrders", "Pending Orders")}
                        </span>
                        <span className="font-medium">
                          {procurementAnalytics.pendingOrders}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("procurement.inventoryValue", "Inventory Value")}
                        </span>
                        <span className="font-medium">
                          {procurementAnalytics.inventoryValue.toLocaleString()}{" "}
                          AED
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("procurement.recentRequests", "Recent Requests")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PR-2023-003</p>
                          <p className="text-sm text-muted-foreground">
                            Bedroom Mobility Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PR-2023-002</p>
                          <p className="text-sm text-muted-foreground">
                            Kitchen Accessibility Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Approved
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PR-2023-001</p>
                          <p className="text-sm text-muted-foreground">
                            Bathroom Safety Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Approved
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("procurement.recentOrders", "Recent Orders")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PO-2023-003</p>
                          <p className="text-sm text-muted-foreground">
                            Bedroom Mobility Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PO-2023-002</p>
                          <p className="text-sm text-muted-foreground">
                            Bathroom Safety Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Completed
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">PO-2023-001</p>
                          <p className="text-sm text-muted-foreground">
                            Kitchen Accessibility Equipment
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="purchase-requests" className="mt-6">
              <PurchaseRequestList />
            </TabsContent>

            <TabsContent value="purchase-orders" className="mt-6">
              <PurchaseOrderList />
            </TabsContent>

            <TabsContent value="inventory" className="mt-6">
              <InventoryManagement />
            </TabsContent>

            <TabsContent value="equipment" className="mt-6">
              <EquipmentManagement />
            </TabsContent>

            <TabsContent value="equipment-audit" className="mt-6">
              <EquipmentAudit />
            </TabsContent>

            <TabsContent value="suppliers" className="mt-6">
              <SupplierManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Purchase Request Dialog */}
      <Dialog
        open={isCreateRequestDialogOpen}
        onOpenChange={setIsCreateRequestDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("procurement.createRequest", "Create Purchase Request")}
            </DialogTitle>
          </DialogHeader>
          <PurchaseRequestForm
            onSave={() => setIsCreateRequestDialogOpen(false)}
            onCancel={() => setIsCreateRequestDialogOpen(false)}
            isDialog
          />
        </DialogContent>
      </Dialog>

      {/* Create Purchase Order Dialog */}
      <Dialog
        open={isCreateOrderDialogOpen}
        onOpenChange={setIsCreateOrderDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("procurement.createOrder", "Create Purchase Order")}
            </DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            onSave={() => setIsCreateOrderDialogOpen(false)}
            onCancel={() => setIsCreateOrderDialogOpen(false)}
            isDialog
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProcurementManagementDashboard;
