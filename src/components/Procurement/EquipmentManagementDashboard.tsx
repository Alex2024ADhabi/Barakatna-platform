import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  BarChart3,
  Boxes,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Loader2,
  MapPin,
  Settings,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import EquipmentManagement from "./EquipmentManagement";
import InventoryUtilizationTracking from "./InventoryUtilizationTracking";
import LowStockAlerts from "./LowStockAlerts";

const EquipmentManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for the dashboard overview
  const dashboardData = {
    totalEquipment: 124,
    availableEquipment: 87,
    inUseEquipment: 28,
    maintenanceEquipment: 9,
    upcomingMaintenance: 12,
    overdueCheckIns: 5,
    lowStockItems: 14,
    recentTransactions: 37,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {t(
              "procurement.equipmentManagementDashboard",
              "Equipment Management Dashboard",
            )}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "procurement.equipmentManagementDescription",
              "Manage equipment, track inventory, and monitor utilization",
            )}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("procurement.overview", "Overview")}
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Wrench className="h-4 w-4 mr-2" />
            {t("procurement.equipment", "Equipment")}
          </TabsTrigger>
          <TabsTrigger value="utilization">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            {t("procurement.utilization", "Utilization")}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Boxes className="h-4 w-4 mr-2" />
            {t("procurement.stockAlerts", "Stock Alerts")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            {t("procurement.settings", "Settings")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.totalEquipment", "Total Equipment")}
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.totalEquipment}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("procurement.itemsInInventory", "Items in inventory")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.equipmentInUse", "Equipment In Use")}
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.inUseEquipment}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("procurement.itemsCheckedOut", "Items checked out")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.upcomingMaintenance", "Upcoming Maintenance")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.upcomingMaintenance}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "procurement.scheduledNext30Days",
                    "Scheduled in next 30 days",
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.lowStockItems", "Low Stock Items")}
                </CardTitle>
                <Boxes className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "procurement.itemsBelowThreshold",
                    "Items below threshold",
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("procurement.equipmentStatus", "Equipment Status")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "procurement.currentStatusDistribution",
                    "Current status distribution",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center">
                  <div className="space-y-2 w-full">
                    <div className="flex items-center">
                      <div className="w-full flex items-center gap-2">
                        <div
                          className="bg-primary h-2 rounded"
                          style={{
                            width: `${(dashboardData.availableEquipment / dashboardData.totalEquipment) * 100}%`,
                          }}
                        ></div>
                        <span className="text-sm">
                          {t("procurement.available", "Available")}
                        </span>
                        <span className="ml-auto text-sm font-medium">
                          {dashboardData.availableEquipment}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full flex items-center gap-2">
                        <div
                          className="bg-blue-500 h-2 rounded"
                          style={{
                            width: `${(dashboardData.inUseEquipment / dashboardData.totalEquipment) * 100}%`,
                          }}
                        ></div>
                        <span className="text-sm">
                          {t("procurement.inUse", "In Use")}
                        </span>
                        <span className="ml-auto text-sm font-medium">
                          {dashboardData.inUseEquipment}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full flex items-center gap-2">
                        <div
                          className="bg-yellow-500 h-2 rounded"
                          style={{
                            width: `${(dashboardData.maintenanceEquipment / dashboardData.totalEquipment) * 100}%`,
                          }}
                        ></div>
                        <span className="text-sm">
                          {t("procurement.maintenance", "Maintenance")}
                        </span>
                        <span className="ml-auto text-sm font-medium">
                          {dashboardData.maintenanceEquipment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("procurement.quickActions", "Quick Actions")}
                </CardTitle>
                <CardDescription>
                  {t("procurement.commonTasks", "Common tasks and operations")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveTab("equipment")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <UserCheck className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">
                        {t(
                          "procurement.checkoutEquipment",
                          "Checkout Equipment",
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveTab("equipment")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Wrench className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">
                        {t(
                          "procurement.scheduleMaintenance",
                          "Schedule Maintenance",
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveTab("alerts")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Truck className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">
                        {t(
                          "procurement.createPurchaseRequest",
                          "Create Purchase Request",
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveTab("equipment")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <MapPin className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">
                        {t("procurement.updateLocation", "Update Location")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("procurement.equipmentManagement", "Equipment Management")}
              </CardTitle>
              <CardDescription>
                {t(
                  "procurement.manageEquipmentInventory",
                  "Manage equipment inventory, maintenance, and tracking",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EquipmentManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("procurement.utilizationTracking", "Utilization Tracking")}
              </CardTitle>
              <CardDescription>
                {t(
                  "procurement.trackEquipmentUsage",
                  "Track equipment usage and transaction history",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryUtilizationTracking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("procurement.inventoryAlerts", "Inventory Alerts")}
              </CardTitle>
              <CardDescription>
                {t(
                  "procurement.lowStockAndReordering",
                  "Low stock alerts and reordering management",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LowStockAlerts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("procurement.settings", "Settings")}</CardTitle>
              <CardDescription>
                {t(
                  "procurement.configureEquipmentManagement",
                  "Configure equipment management settings",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  {t(
                    "procurement.settingsComingSoon",
                    "Settings configuration coming soon",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentManagementDashboard;
