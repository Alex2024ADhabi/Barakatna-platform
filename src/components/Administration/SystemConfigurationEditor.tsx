import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  clientConfigService,
  ClientConfig,
} from "@/services/clientConfigService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  Save,
  Undo,
  Upload,
  Download,
  History,
  Settings,
  FileText,
  Bell,
  Link,
  Palette,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ClientTypeIndicator from "../Client/ClientTypeIndicator";
import { ClientType } from "@/lib/forms/types";

interface SystemConfigurationEditorProps {
  readOnly?: boolean;
}

const SystemConfigurationEditor: React.FC<SystemConfigurationEditorProps> = ({
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("general");
  const [clientConfigs, setClientConfigs] = useState<Map<number, ClientConfig>>(
    new Map(),
  );
  const [selectedClientTypeId, setSelectedClientTypeId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [configHistory, setConfigHistory] = useState<ClientConfig[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Load all client configurations
  useEffect(() => {
    const loadConfigs = async () => {
      setIsLoading(true);
      try {
        await clientConfigService.loadConfigurationsFromApi();
        const configs = clientConfigService.getAllClientConfigs();
        setClientConfigs(configs);

        // Select the first client type by default
        if (configs.size > 0 && !selectedClientTypeId) {
          setSelectedClientTypeId(Array.from(configs.keys())[0]);
        }
      } catch (error) {
        console.error("Error loading client configurations:", error);
        toast({
          title: t("error"),
          description: t("errorLoadingConfigurations"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, [t, toast, selectedClientTypeId]);

  // Load configuration history when a client type is selected
  useEffect(() => {
    if (selectedClientTypeId) {
      const history = clientConfigService.getConfigHistory(
        selectedClientTypeId,
        10,
      );
      setConfigHistory(history);
    }
  }, [selectedClientTypeId]);

  // Handle client type selection
  const handleClientTypeSelect = (clientTypeId: number) => {
    setSelectedClientTypeId(clientTypeId);
    setShowHistory(false);
  };

  // Get client type name based on ID
  const getClientTypeName = (clientTypeId: number): string => {
    switch (clientTypeId) {
      case 1:
        return t("clientType.fdf", "Family Development Foundation");
      case 2:
        return t("clientType.adha", "Abu Dhabi Housing Authority");
      case 3:
        return t("clientType.cash", "Cash Client");
      case 4:
        return t("clientType.other", "Other Client");
      default:
        return t("clientType.unknown", "Unknown Client");
    }
  };

  // Handle configuration update
  const updateClientConfig = async (
    clientTypeId: number,
    updates: Partial<ClientConfig>,
  ) => {
    if (readOnly) return;

    setIsSaving(true);
    try {
      const currentConfig = clientConfigs.get(clientTypeId);
      if (!currentConfig) return;

      const updatedConfig = {
        ...currentConfig,
        ...updates,
      };

      // Validate the configuration
      const isValid = clientConfigService.validateClientConfig(updatedConfig);
      if (!isValid) {
        toast({
          title: t("validationError"),
          description: t("configurationValidationFailed"),
          variant: "destructive",
        });
        return;
      }

      const success = await clientConfigService.saveClientConfig(
        updatedConfig,
        "system_admin", // In a real app, this would be the current user's ID or name
        "Configuration updated via System Configuration Editor",
      );

      if (success) {
        // Update local state
        const newConfigs = new Map(clientConfigs);
        newConfigs.set(clientTypeId, updatedConfig);
        setClientConfigs(newConfigs);

        // Refresh history
        const history = clientConfigService.getConfigHistory(clientTypeId, 10);
        setConfigHistory(history);

        toast({
          title: t("success"),
          description: t("configurationSaved"),
        });
      } else {
        toast({
          title: t("error"),
          description: t("errorSavingConfiguration"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating client configuration:", error);
      toast({
        title: t("error"),
        description: t("errorSavingConfiguration"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle configuration restore from history
  const restoreFromHistory = async (version: number) => {
    if (!selectedClientTypeId || readOnly) return;

    try {
      const historyItem = configHistory.find(
        (item) => item.version === version,
      );
      if (!historyItem) return;

      // In a real implementation, this would call the service to restore from history
      // For now, we'll just update the current configuration
      const newConfigs = new Map(clientConfigs);
      newConfigs.set(selectedClientTypeId, historyItem);
      setClientConfigs(newConfigs);

      toast({
        title: t("success"),
        description: t("configurationRestored", { version }),
      });

      setShowHistory(false);
    } catch (error) {
      console.error("Error restoring configuration:", error);
      toast({
        title: t("error"),
        description: t("errorRestoringConfiguration"),
        variant: "destructive",
      });
    }
  };

  // Handle configuration validation
  const validateConfiguration = (clientTypeId: number) => {
    const config = clientConfigs.get(clientTypeId);
    if (!config) return;

    const isValid = clientConfigService.validateClientConfig(config);

    if (isValid) {
      toast({
        title: t("validationSuccess"),
        description: t("configurationIsValid"),
      });
      setValidationErrors({});
    } else {
      // In a real implementation, we would get detailed validation errors
      // For now, we'll just show a generic error
      setValidationErrors({
        general: [t("configurationContainsErrors")],
      });
      toast({
        title: t("validationError"),
        description: t("configurationContainsErrors"),
        variant: "destructive",
      });
    }
  };

  // Filter configurations based on search term and category
  const filteredClientTypes = Array.from(clientConfigs.keys()).filter(
    (clientTypeId) => {
      const config = clientConfigs.get(clientTypeId);
      if (!config) return false;

      // Filter by search term
      if (
        searchTerm &&
        !JSON.stringify(config).toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by category
      if (filterCategory !== "all") {
        if (!config[filterCategory]) return false;
      }

      return true;
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {t("systemConfigurationEditor")}
          </h2>
          <p className="text-gray-500">{t("manageSystemWideSettings")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with client types */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("clientTypes")}</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder={t("search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  <SelectItem value="general">{t("general")}</SelectItem>
                  <SelectItem value="workflow">{t("workflow")}</SelectItem>
                  <SelectItem value="pricing">{t("pricing")}</SelectItem>
                  <SelectItem value="beneficiary">
                    {t("beneficiary")}
                  </SelectItem>
                  <SelectItem value="security">{t("security")}</SelectItem>
                  <SelectItem value="integration">
                    {t("integration")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredClientTypes.map((clientTypeId) => {
                  const config = clientConfigs.get(clientTypeId);
                  return (
                    <div
                      key={clientTypeId}
                      className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${selectedClientTypeId === clientTypeId ? "bg-primary/10" : "hover:bg-gray-100"}`}
                      onClick={() => handleClientTypeSelect(clientTypeId)}
                    >
                      <ClientTypeIndicator
                        clientType={clientTypeId}
                        size="sm"
                        showLabel={false}
                      />
                      <div>
                        <div className="font-medium">
                          {getClientTypeName(clientTypeId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("version")}: {config?.version}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredClientTypes.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    {t("noClientTypesFound")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedClientTypeId && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{t("actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => validateConfiguration(selectedClientTypeId)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t("validateConfiguration")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {showHistory ? t("hideHistory") : t("showHistory")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const config = clientConfigs.get(selectedClientTypeId);
                      if (config) {
                        const jsonStr =
                          clientConfigService.exportConfigToJson(
                            selectedClientTypeId,
                          );
                        if (jsonStr) {
                          const blob = new Blob([jsonStr], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `client-config-${selectedClientTypeId}-v${config.version}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("exportConfiguration")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {selectedClientTypeId && !showHistory ? (
            <div>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ClientTypeIndicator
                        clientType={selectedClientTypeId}
                        size="md"
                      />
                      <CardTitle>
                        {getClientTypeName(selectedClientTypeId)}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    {t("configureClientTypeSettings")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="general">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("general")}
                      </TabsTrigger>
                      <TabsTrigger value="workflow">
                        <History className="mr-2 h-4 w-4" />
                        {t("workflow")}
                      </TabsTrigger>
                      <TabsTrigger value="pricing">
                        <FileText className="mr-2 h-4 w-4" />
                        {t("pricing")}
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        <FileText className="mr-2 h-4 w-4" />
                        {t("security")}
                      </TabsTrigger>
                      <TabsTrigger value="integration">
                        <Link className="mr-2 h-4 w-4" />
                        {t("integration")}
                      </TabsTrigger>
                    </TabsList>

                    {/* General Settings Tab */}
                    <TabsContent value="general">
                      <div className="space-y-4">
                        {validationErrors.general && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("validationErrors")}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4">
                                {validationErrors.general.map(
                                  (error, index) => (
                                    <li key={index}>{error}</li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="notes">{t("notes")}</Label>
                            <Textarea
                              id="notes"
                              value={
                                clientConfigs.get(selectedClientTypeId)?.general
                                  .notes || ""
                              }
                              onChange={(e) => {
                                const config =
                                  clientConfigs.get(selectedClientTypeId);
                                if (!config) return;
                                updateClientConfig(selectedClientTypeId, {
                                  general: {
                                    ...config.general,
                                    notes: e.target.value,
                                  },
                                });
                              }}
                              disabled={readOnly}
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="language">{t("language")}</Label>
                              <Select
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.general.language || "en"
                                }
                                onValueChange={(value) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    general: {
                                      ...config.general,
                                      language: value,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue
                                    placeholder={t("selectLanguage")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="ar">العربية</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="rtlSupport">
                                {t("rtlSupport")}
                              </Label>
                              <Switch
                                id="rtlSupport"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.general.rtlSupport || false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    general: {
                                      ...config.general,
                                      rtlSupport: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="maxProjectsPerBeneficiary">
                                {t("maxProjectsPerBeneficiary")}
                              </Label>
                              <Input
                                id="maxProjectsPerBeneficiary"
                                type="number"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.general.maxProjectsPerBeneficiary || 0
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    general: {
                                      ...config.general,
                                      maxProjectsPerBeneficiary: parseInt(
                                        e.target.value,
                                      ),
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                                min="0"
                                max="10"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div>
                          <h3 className="text-lg font-medium mb-4">
                            {t("moduleActivation")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enableAssessments">
                                  {t("enableAssessments")}
                                </Label>
                                <Switch
                                  id="enableAssessments"
                                  checked={
                                    clientConfigs.get(selectedClientTypeId)
                                      ?.general.enableAssessments || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const config =
                                      clientConfigs.get(selectedClientTypeId);
                                    if (!config) return;
                                    updateClientConfig(selectedClientTypeId, {
                                      general: {
                                        ...config.general,
                                        enableAssessments: checked,
                                      },
                                    });
                                  }}
                                  disabled={readOnly}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enableProjects">
                                  {t("enableProjects")}
                                </Label>
                                <Switch
                                  id="enableProjects"
                                  checked={
                                    clientConfigs.get(selectedClientTypeId)
                                      ?.general.enableProjects || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const config =
                                      clientConfigs.get(selectedClientTypeId);
                                    if (!config) return;
                                    updateClientConfig(selectedClientTypeId, {
                                      general: {
                                        ...config.general,
                                        enableProjects: checked,
                                      },
                                    });
                                  }}
                                  disabled={readOnly}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enableFinancials">
                                  {t("enableFinancials")}
                                </Label>
                                <Switch
                                  id="enableFinancials"
                                  checked={
                                    clientConfigs.get(selectedClientTypeId)
                                      ?.general.enableFinancials || false
                                  }
                                  onCheckedChange={(checked) => {
                                    const config =
                                      clientConfigs.get(selectedClientTypeId);
                                    if (!config) return;
                                    updateClientConfig(selectedClientTypeId, {
                                      general: {
                                        ...config.general,
                                        enableFinancials: checked,
                                      },
                                    });
                                  }}
                                  disabled={readOnly}
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              {clientConfigs.get(selectedClientTypeId)
                                ?.features && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="enableCommittees">
                                      {t("enableCommittees")}
                                    </Label>
                                    <Switch
                                      id="enableCommittees"
                                      checked={
                                        clientConfigs.get(selectedClientTypeId)
                                          ?.features?.committees || false
                                      }
                                      onCheckedChange={(checked) => {
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (!config || !config.features) return;
                                        updateClientConfig(
                                          selectedClientTypeId,
                                          {
                                            features: {
                                              ...config.features,
                                              committees: checked,
                                            },
                                          },
                                        );
                                      }}
                                      disabled={readOnly}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="enableInventory">
                                      {t("enableInventory")}
                                    </Label>
                                    <Switch
                                      id="enableInventory"
                                      checked={
                                        clientConfigs.get(selectedClientTypeId)
                                          ?.features?.inventory || false
                                      }
                                      onCheckedChange={(checked) => {
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (!config || !config.features) return;
                                        updateClientConfig(
                                          selectedClientTypeId,
                                          {
                                            features: {
                                              ...config.features,
                                              inventory: checked,
                                            },
                                          },
                                        );
                                      }}
                                      disabled={readOnly}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="enableSupplierManagement">
                                      {t("enableSupplierManagement")}
                                    </Label>
                                    <Switch
                                      id="enableSupplierManagement"
                                      checked={
                                        clientConfigs.get(selectedClientTypeId)
                                          ?.features?.supplierManagement ||
                                        false
                                      }
                                      onCheckedChange={(checked) => {
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (!config || !config.features) return;
                                        updateClientConfig(
                                          selectedClientTypeId,
                                          {
                                            features: {
                                              ...config.features,
                                              supplierManagement: checked,
                                            },
                                          },
                                        );
                                      }}
                                      disabled={readOnly}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Workflow Tab */}
                    <TabsContent value="workflow">
                      <div className="space-y-4">
                        {validationErrors.workflow && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("validationErrors")}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4">
                                {validationErrors.workflow.map(
                                  (error, index) => (
                                    <li key={index}>{error}</li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="requiresCommitteeApproval">
                                {t("requiresCommitteeApproval")}
                              </Label>
                              <Switch
                                id="requiresCommitteeApproval"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.requiresCommitteeApproval ||
                                  false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      requiresCommitteeApproval: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="skipFinancialVerification">
                                {t("skipFinancialVerification")}
                              </Label>
                              <Switch
                                id="skipFinancialVerification"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.skipFinancialVerification ||
                                  false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      skipFinancialVerification: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="autoCloseProjects">
                                {t("autoCloseProjects")}
                              </Label>
                              <Switch
                                id="autoCloseProjects"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.autoCloseProjects || false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      autoCloseProjects: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="maxDaysToComplete">
                                {t("maxDaysToComplete")}
                              </Label>
                              <Input
                                id="maxDaysToComplete"
                                type="number"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.maxDaysToComplete || 0
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      maxDaysToComplete: parseInt(
                                        e.target.value,
                                      ),
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                                min="1"
                                max="365"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="approvalLevels">
                                {t("approvalLevels")}
                              </Label>
                              <Input
                                id="approvalLevels"
                                type="number"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.approvalLevels || 0
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      approvalLevels: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                                min="0"
                                max="5"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="notificationFrequency">
                                {t("notificationFrequency")}
                              </Label>
                              <Select
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.workflow.notificationFrequency || "daily"
                                }
                                onValueChange={(value) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    workflow: {
                                      ...config.workflow,
                                      notificationFrequency: value as
                                        | "daily"
                                        | "weekly"
                                        | "immediate",
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue
                                    placeholder={t(
                                      "selectNotificationFrequency",
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">
                                    {t("immediate")}
                                  </SelectItem>
                                  <SelectItem value="daily">
                                    {t("daily")}
                                  </SelectItem>
                                  <SelectItem value="weekly">
                                    {t("weekly")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing">
                      <div className="space-y-4">
                        {validationErrors.pricing && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("validationErrors")}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4">
                                {validationErrors.pricing.map(
                                  (error, index) => (
                                    <li key={index}>{error}</li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="usesCustomPriceList">
                                {t("usesCustomPriceList")}
                              </Label>
                              <Switch
                                id="usesCustomPriceList"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.usesCustomPriceList || false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      usesCustomPriceList: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="priceListId">
                                {t("priceListId")}
                              </Label>
                              <Input
                                id="priceListId"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.priceListId || ""
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      priceListId: e.target.value,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="discountPercentage">
                                {t("discountPercentage")}
                              </Label>
                              <Input
                                id="discountPercentage"
                                type="number"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.discountPercentage || 0
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      discountPercentage: parseInt(
                                        e.target.value,
                                      ),
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="taxPercentage">
                                {t("taxPercentage")}
                              </Label>
                              <Input
                                id="taxPercentage"
                                type="number"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.taxPercentage || 0
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      taxPercentage: parseInt(e.target.value),
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                                min="0"
                                max="30"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="allowNegotiation">
                                {t("allowNegotiation")}
                              </Label>
                              <Switch
                                id="allowNegotiation"
                                checked={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.allowNegotiation || false
                                }
                                onCheckedChange={(checked) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      allowNegotiation: checked,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="currency">{t("currency")}</Label>
                              <Input
                                id="currency"
                                value={
                                  clientConfigs.get(selectedClientTypeId)
                                    ?.pricing.currency || ""
                                }
                                onChange={(e) => {
                                  const config =
                                    clientConfigs.get(selectedClientTypeId);
                                  if (!config) return;
                                  updateClientConfig(selectedClientTypeId, {
                                    pricing: {
                                      ...config.pricing,
                                      currency: e.target.value,
                                    },
                                  });
                                }}
                                disabled={readOnly}
                                className="w-[180px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                      <div className="space-y-4">
                        {validationErrors.security && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("validationErrors")}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4">
                                {validationErrors.security.map(
                                  (error, index) => (
                                    <li key={index}>{error}</li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            {clientConfigs.get(selectedClientTypeId)
                              ?.security && (
                              <>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="twoFactorRequired">
                                    {t("twoFactorRequired")}
                                  </Label>
                                  <Switch
                                    id="twoFactorRequired"
                                    checked={
                                      clientConfigs.get(selectedClientTypeId)
                                        ?.security?.twoFactorRequired || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const config =
                                        clientConfigs.get(selectedClientTypeId);
                                      if (!config || !config.security) return;
                                      updateClientConfig(selectedClientTypeId, {
                                        security: {
                                          ...config.security,
                                          twoFactorRequired: checked,
                                        },
                                      });
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="dataRetentionPeriod">
                                    {t("dataRetentionPeriod")}
                                  </Label>
                                  <Input
                                    id="dataRetentionPeriod"
                                    type="number"
                                    value={
                                      clientConfigs.get(selectedClientTypeId)
                                        ?.security?.dataRetentionPeriod || 0
                                    }
                                    onChange={(e) => {
                                      const config =
                                        clientConfigs.get(selectedClientTypeId);
                                      if (!config || !config.security) return;
                                      updateClientConfig(selectedClientTypeId, {
                                        security: {
                                          ...config.security,
                                          dataRetentionPeriod: parseInt(
                                            e.target.value,
                                          ),
                                        },
                                      });
                                    }}
                                    disabled={readOnly}
                                    className="w-[180px]"
                                    min="1"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="approvalHierarchy">
                                    {t("approvalHierarchy")}
                                  </Label>
                                  <Input
                                    id="approvalHierarchy"
                                    value={
                                      clientConfigs.get(selectedClientTypeId)
                                        ?.security?.approvalHierarchy || ""
                                    }
                                    onChange={(e) => {
                                      const config =
                                        clientConfigs.get(selectedClientTypeId);
                                      if (!config || !config.security) return;
                                      updateClientConfig(selectedClientTypeId, {
                                        security: {
                                          ...config.security,
                                          approvalHierarchy: e.target.value,
                                        },
                                      });
                                    }}
                                    disabled={readOnly}
                                    className="w-[180px]"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div className="space-y-4">
                            {clientConfigs.get(selectedClientTypeId)
                              ?.security && (
                              <div>
                                <Label className="mb-2 block">
                                  {t("documentRequirements")}
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {clientConfigs
                                    .get(selectedClientTypeId)
                                    ?.security?.documentRequirements?.map(
                                      (doc, index) => (
                                        <Badge key={index} variant="secondary">
                                          {doc}
                                          {!readOnly && (
                                            <button
                                              className="ml-2 text-xs"
                                              onClick={() => {
                                                const config =
                                                  clientConfigs.get(
                                                    selectedClientTypeId,
                                                  );
                                                if (!config || !config.security)
                                                  return;
                                                const newDocs = [
                                                  ...config.security.documentRequirements!.filter(
                                                    (_, i) => i !== index,
                                                  ),
                                                ];
                                                updateClientConfig(
                                                  selectedClientTypeId,
                                                  {
                                                    security: {
                                                      ...config.security,
                                                      documentRequirements:
                                                        newDocs,
                                                    },
                                                  },
                                                );
                                              }}
                                            >
                                              ×
                                            </button>
                                          )}
                                        </Badge>
                                      ),
                                    )}
                                </div>
                                {!readOnly && (
                                  <div className="flex gap-2">
                                    <Input
                                      id="newSecurityDocument"
                                      placeholder={t("newDocumentName")}
                                      className="flex-1"
                                    />
                                    <Button
                                      onClick={() => {
                                        const input = document.getElementById(
                                          "newSecurityDocument",
                                        ) as HTMLInputElement;
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (
                                          input.value &&
                                          config &&
                                          config.security
                                        ) {
                                          const newDocs = [
                                            ...(config.security
                                              .documentRequirements || []),
                                            input.value,
                                          ];
                                          updateClientConfig(
                                            selectedClientTypeId,
                                            {
                                              security: {
                                                ...config.security,
                                                documentRequirements: newDocs,
                                              },
                                            },
                                          );
                                          input.value = "";
                                        }
                                      }}
                                    >
                                      {t("add")}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Integration Tab */}
                    <TabsContent value="integration">
                      <div className="space-y-4">
                        {validationErrors.integration && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{t("validationErrors")}</AlertTitle>
                            <AlertDescription>
                              <ul className="list-disc pl-4">
                                {validationErrors.integration.map(
                                  (error, index) => (
                                    <li key={index}>{error}</li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            {clientConfigs.get(selectedClientTypeId)
                              ?.integration && (
                              <div>
                                <Label className="mb-2 block">
                                  {t("externalSystems")}
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {clientConfigs
                                    .get(selectedClientTypeId)
                                    ?.integration?.externalSystems?.map(
                                      (system, index) => (
                                        <Badge key={index} variant="secondary">
                                          {system}
                                          {!readOnly && (
                                            <button
                                              className="ml-2 text-xs"
                                              onClick={() => {
                                                const config =
                                                  clientConfigs.get(
                                                    selectedClientTypeId,
                                                  );
                                                if (
                                                  !config ||
                                                  !config.integration
                                                )
                                                  return;
                                                const newSystems = [
                                                  ...config.integration.externalSystems!.filter(
                                                    (_, i) => i !== index,
                                                  ),
                                                ];
                                                updateClientConfig(
                                                  selectedClientTypeId,
                                                  {
                                                    integration: {
                                                      ...config.integration,
                                                      externalSystems:
                                                        newSystems,
                                                    },
                                                  },
                                                );
                                              }}
                                            >
                                              ×
                                            </button>
                                          )}
                                        </Badge>
                                      ),
                                    )}
                                </div>
                                {!readOnly && (
                                  <div className="flex gap-2">
                                    <Input
                                      id="newSystem"
                                      placeholder={t("newSystemName")}
                                      className="flex-1"
                                    />
                                    <Button
                                      onClick={() => {
                                        const input = document.getElementById(
                                          "newSystem",
                                        ) as HTMLInputElement;
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (
                                          input.value &&
                                          config &&
                                          config.integration
                                        ) {
                                          const newSystems = [
                                            ...(config.integration
                                              .externalSystems || []),
                                            input.value,
                                          ];
                                          updateClientConfig(
                                            selectedClientTypeId,
                                            {
                                              integration: {
                                                ...config.integration,
                                                externalSystems: newSystems,
                                              },
                                            },
                                          );
                                          input.value = "";
                                        }
                                      }}
                                    >
                                      {t("add")}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            {clientConfigs.get(selectedClientTypeId)
                              ?.integration && (
                              <div>
                                <Label className="mb-2 block">
                                  {t("webhookEndpoints")}
                                </Label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {clientConfigs
                                    .get(selectedClientTypeId)
                                    ?.integration?.webhookEndpoints?.map(
                                      (endpoint, index) => (
                                        <Badge key={index} variant="secondary">
                                          {endpoint}
                                          {!readOnly && (
                                            <button
                                              className="ml-2 text-xs"
                                              onClick={() => {
                                                const config =
                                                  clientConfigs.get(
                                                    selectedClientTypeId,
                                                  );
                                                if (
                                                  !config ||
                                                  !config.integration
                                                )
                                                  return;
                                                const newEndpoints = [
                                                  ...config.integration.webhookEndpoints!.filter(
                                                    (_, i) => i !== index,
                                                  ),
                                                ];
                                                updateClientConfig(
                                                  selectedClientTypeId,
                                                  {
                                                    integration: {
                                                      ...config.integration,
                                                      webhookEndpoints:
                                                        newEndpoints,
                                                    },
                                                  },
                                                );
                                              }}
                                            >
                                              ×
                                            </button>
                                          )}
                                        </Badge>
                                      ),
                                    )}
                                </div>
                                {!readOnly && (
                                  <div className="flex gap-2">
                                    <Input
                                      id="newEndpoint"
                                      placeholder="https://example.com/webhook"
                                      className="flex-1"
                                    />
                                    <Button
                                      onClick={() => {
                                        const input = document.getElementById(
                                          "newEndpoint",
                                        ) as HTMLInputElement;
                                        const config =
                                          clientConfigs.get(
                                            selectedClientTypeId,
                                          );
                                        if (
                                          input.value &&
                                          config &&
                                          config.integration
                                        ) {
                                          const newEndpoints = [
                                            ...(config.integration
                                              .webhookEndpoints || []),
                                            input.value,
                                          ];
                                          updateClientConfig(
                                            selectedClientTypeId,
                                            {
                                              integration: {
                                                ...config.integration,
                                                webhookEndpoints: newEndpoints,
                                              },
                                            },
                                          );
                                          input.value = "";
                                        }
                                      }}
                                    >
                                      {t("add")}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {clientConfigs.get(selectedClientTypeId)
                          ?.integration && (
                          <div className="mt-4">
                            <Label htmlFor="dataExportSchedule">
                              {t("dataExportSchedule")}
                            </Label>
                            <Select
                              value={
                                clientConfigs.get(selectedClientTypeId)
                                  ?.integration?.dataExportSchedule || "daily"
                              }
                              onValueChange={(value) => {
                                const config =
                                  clientConfigs.get(selectedClientTypeId);
                                if (!config || !config.integration) return;
                                updateClientConfig(selectedClientTypeId, {
                                  integration: {
                                    ...config.integration,
                                    dataExportSchedule: value,
                                  },
                                });
                              }}
                              disabled={readOnly}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t("selectExportSchedule")}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">
                                  {t("daily")}
                                </SelectItem>
                                <SelectItem value="weekly">
                                  {t("weekly")}
                                </SelectItem>
                                <SelectItem value="monthly">
                                  {t("monthly")}
                                </SelectItem>
                                <SelectItem value="manual">
                                  {t("manual")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : showHistory && selectedClientTypeId ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ClientTypeIndicator
                      clientType={selectedClientTypeId}
                      size="md"
                    />
                    <div>
                      <CardTitle>
                        {getClientTypeName(selectedClientTypeId)}
                      </CardTitle>
                      <CardDescription>
                        {t("configurationHistory")}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(false)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t("closeHistory")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {configHistory.length > 0 ? (
                  <div className="space-y-4">
                    {configHistory.map((historyItem) => (
                      <Card key={historyItem.version}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {t("version")}: {historyItem.version}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  historyItem.lastUpdated,
                                ).toLocaleString()}
                              </div>
                            </div>
                            {!readOnly && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  restoreFromHistory(historyItem.version)
                                }
                              >
                                {t("restore")}
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="text-sm">
                            <span className="font-medium">
                              {t("updatedBy")}:
                            </span>{" "}
                            {historyItem.updatedBy || t("unknown")}
                          </div>
                          {historyItem.general && historyItem.general.notes && (
                            <div className="mt-2">
                              <span className="font-medium">{t("notes")}:</span>
                              <p className="text-sm mt-1">
                                {historyItem.general.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t("noHistoryAvailable")}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500">{t("selectClientTypeToEdit")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationEditor;
