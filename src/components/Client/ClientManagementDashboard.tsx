import React, { useState, useEffect } from "react";
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
import { Badge } from "../ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Settings, FileText, Plus } from "lucide-react";
import { clientConfigService } from "@/services/clientConfigService";
import ClientTypeManager from "./ClientTypeManager";
import ClientRegistrationForm from "./ClientRegistrationForm";
import ClientConfigDisplay from "./ClientConfigDisplay";
import ClientConfigurationPanel from "./ClientConfigurationPanel";
import ClientTypeIndicator from "./ClientTypeIndicator";

interface ClientManagementDashboardProps {
  defaultTab?: string;
}

const ClientManagementDashboard: React.FC<ClientManagementDashboardProps> = ({
  defaultTab = "types",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [clientTypes, setClientTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClientType, setActiveClientType] = useState<any | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    fetchClientTypes();

    // Subscribe to client config changes
    const removeListener = clientConfigService.addChangeListener((event) => {
      if (event.configType === "active") {
        const activeId = clientConfigService.getActiveClientType();
        const active = clientTypes.find((ct) => ct.clientTypeId === activeId);
        setActiveClientType(active || null);
      }
      fetchClientTypes(); // Refresh client types when changes occur
    });

    return () => {
      try {
        removeListener();
      } catch (error) {
        console.error("Error removing listener:", error);
      }
    };
  }, []);

  const fetchClientTypes = async () => {
    setLoading(true);
    try {
      // Get client types from the service
      // Convert the Map to an array of client types
      const configsMap = clientConfigService.getAllClientConfigs();
      const types = [];

      // Convert client configs to client types
      configsMap.forEach((config, id) => {
        // Extract more meaningful names and codes from the config
        const typeCode = config.general?.code || `CT-${id}`;
        const typeNameEN =
          config.general?.nameEN ||
          config.general?.notes?.split(" ")[0] ||
          `Client Type ${id}`;
        const typeNameAR = config.general?.nameAR || `نوع العميل ${id}`;

        types.push({
          clientTypeId: id,
          typeCode: typeCode,
          typeNameEN: typeNameEN,
          typeNameAR: typeNameAR,
          description: config.general?.notes || "",
          isActive: true,
          createdBy: config.updatedBy || 1,
          createdDate: config.lastUpdated || new Date(),
        });
      });

      setClientTypes(types);

      // Set active client type
      try {
        const activeId = clientConfigService.getActiveClientType();
        if (activeId) {
          const active = types.find((ct) => ct.clientTypeId === activeId);
          setActiveClientType(active || null);
        }
      } catch (error) {
        console.error("Error getting active client type:", error);
      }
    } catch (error) {
      console.error("Error fetching client types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientTypeSelected = (clientType: any) => {
    setActiveClientType(clientType);
  };

  const handleClientRegistered = () => {
    fetchClientTypes();
    setShowRegistrationForm(false);
    setActiveTab("types");
  };

  const handleCancelRegistration = () => {
    setShowRegistrationForm(false);
  };

  const handleConfigurationSaved = (config: any) => {
    fetchClientTypes();
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {t("client.managementDashboard", "Client Management Dashboard")}
            </CardTitle>
            <CardDescription>
              {t(
                "client.managementDescription",
                "Manage client types, configurations, and registrations",
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {activeClientType && (
              <div className="flex items-center mr-4">
                <span className="text-sm text-muted-foreground mr-2">
                  {t("client.activeClient", "Active Client")}:
                </span>
                <div className="flex items-center gap-2">
                  <ClientTypeIndicator
                    clientType={activeClientType.clientTypeId}
                    showLabel={false}
                    size="sm"
                  />
                  <Badge variant="default">{activeClientType.typeNameEN}</Badge>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Input
                placeholder={t("client.searchClients", "Search clients...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Button
                variant="outline"
                onClick={() => setFilterActive(!filterActive)}
                className="flex items-center gap-2"
              >
                <span className="text-xs">
                  {filterActive
                    ? t("client.showAll", "Show All")
                    : t("client.showActive", "Show Active")}
                </span>
              </Button>
              <Button
                onClick={() => setShowRegistrationForm(true)}
                disabled={showRegistrationForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("client.registerNew", "Register New Client")}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t("common.loading", "Loading...")}</span>
          </div>
        ) : showRegistrationForm ? (
          <ClientRegistrationForm
            onSubmit={handleClientRegistered}
            onCancel={handleCancelRegistration}
            availableClientTypes={clientTypes}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="types">
                <Users className="h-4 w-4 mr-2" />
                {t("client.clientTypes", "Client Types")}
              </TabsTrigger>
              <TabsTrigger value="config" disabled={!activeClientType}>
                <Settings className="h-4 w-4 mr-2" />
                {t("client.configuration", "Configuration")}
              </TabsTrigger>
              <TabsTrigger value="display">
                <FileText className="h-4 w-4 mr-2" />
                {t("client.display", "Display")}
              </TabsTrigger>
              <TabsTrigger value="admin" disabled={!activeClientType}>
                <Shield className="h-4 w-4 mr-2" />
                {t("client.administration", "Administration")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="types" className="mt-4">
              <ClientTypeManager
                onClientTypeSelected={handleClientTypeSelected}
                clientTypes={clientTypes.filter(
                  (ct) =>
                    (filterActive ? ct.isActive : true) &&
                    (searchTerm
                      ? ct.typeNameEN
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        ct.typeNameAR.includes(searchTerm) ||
                        ct.typeCode
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        ct.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      : true),
                )}
                isLoading={false}
              />
            </TabsContent>

            <TabsContent value="config" className="mt-4">
              {activeClientType ? (
                <ClientConfigurationPanel
                  clientType={activeClientType}
                  onSave={handleConfigurationSaved}
                />
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">
                    {t(
                      "client.selectClientType",
                      "Please select a client type to configure",
                    )}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="display" className="mt-4">
              <ClientConfigDisplay />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientManagementDashboard;
