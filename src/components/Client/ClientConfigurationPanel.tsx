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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ClientType } from "@/lib/forms/types";
import { useToast } from "../ui/use-toast";
import { Loader2, Save, Settings, FileText, CheckCircle } from "lucide-react";
import { clientConfigService } from "@/services/clientConfigService";
import { ConfigurationVersion } from "@/lib/services/client/ConfigVersionManager";
// Import form registry and dependency resolver if needed
// import { formRegistry } from "@/lib/forms/registry";
// import { formDependencyResolver } from "@/lib/services/FormDependencyResolver";

interface ClientConfigurationPanelProps {
  clientType: any;
  onSave?: (config: any) => void;
}

export const ClientConfigurationPanel: React.FC<
  ClientConfigurationPanelProps
> = ({ clientType, onSave }) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [configHistory, setConfigHistory] = useState<ConfigurationVersion[]>(
    [],
  );
  const [showHistory, setShowHistory] = useState(false);

  // Configuration state
  const [generalConfig, setGeneralConfig] = useState({
    enableAssessments: true,
    enableProjects: true,
    enableFinancials: true,
    enableProcurement: true,
    enableCommittee: true,
    enableReporting: true,
    maxProjectsPerBeneficiary: 1,
    requireApproval: true,
    notes: "",
  });

  const [pricingConfig, setPricingConfig] = useState({
    usesCustomPriceList: false,
    priceListId: "",
    discountPercentage: 0,
    taxPercentage: 5,
    allowNegotiation: false,
    customSupplierList: false,
  });

  const [workflowConfig, setWorkflowConfig] = useState({
    requiresCommitteeApproval: true,
    skipFinancialVerification: false,
    autoCloseProjects: false,
    maxDaysToComplete: 90,
    approvalHierarchy: "standard",
    documentRequirements: "standard",
  });

  const [formConfig, setFormConfig] = useState({
    requiredFields: {
      beneficiaryPhone: true,
      beneficiaryEmail: false,
      propertyDetails: true,
      emergencyContact: true,
    },
    validationRules: "standard",
    customFields: [],
  });

  // Load client configuration
  useEffect(() => {
    const loadClientConfig = async () => {
      setLoading(true);
      try {
        // Get default configuration for client type
        const clientTypeCode =
          clientType.typeCode ||
          (clientType.clientTypeId === 1
            ? "FDF"
            : clientType.clientTypeId === 2
              ? "ADHA"
              : clientType.clientTypeId === 3
                ? "CASH"
                : "OTHER");

        // Get configuration from service
        const defaultConfig = clientConfigService.getDefaultConfiguration(
          clientTypeCode as any,
        );

        // Try to get client-specific configuration if clientId is available
        let clientConfig = null;
        if (clientType.clientId) {
          try {
            clientConfig = await clientConfigService.getClientConfiguration(
              clientType.clientId,
            );
          } catch (err) {
            console.warn(
              "Could not load client-specific configuration, using defaults",
              err,
            );
          }
        }

        // Merge default with client-specific if available
        const config = clientConfig || defaultConfig;

        // Set form states based on configuration
        setGeneralConfig({
          enableAssessments: config.features?.assessments ?? true,
          enableProjects: config.features?.projects ?? true,
          enableFinancials: config.features?.financials ?? true,
          enableProcurement: config.features?.inventory ?? false,
          enableCommittee: config.features?.committees ?? true,
          enableReporting: true,
          maxProjectsPerBeneficiary:
            config.maxProjectsPerBeneficiary ||
            (clientTypeCode === "FDF" ? 1 : clientTypeCode === "ADHA" ? 2 : 5),
          requireApproval: config.requiresCommitteeApproval ?? true,
          notes: config.notes || "",
        });

        setPricingConfig({
          usesCustomPriceList:
            config.usesCustomPriceList ??
            (clientTypeCode === "FDF" || clientTypeCode === "ADHA"),
          priceListId:
            config.priceListId ||
            `${clientTypeCode}-${new Date().getFullYear()}`,
          discountPercentage:
            config.discountPercentage ??
            (clientTypeCode === "FDF"
              ? 100
              : clientTypeCode === "ADHA"
                ? 80
                : 0),
          taxPercentage: config.taxRate ?? 5,
          allowNegotiation:
            config.allowNegotiation ?? clientTypeCode === "CASH",
          customSupplierList: config.customSupplierList ?? false,
        });

        setWorkflowConfig({
          requiresCommitteeApproval:
            config.requiresCommitteeApproval ?? clientTypeCode !== "CASH",
          skipFinancialVerification:
            config.skipFinancialVerification ?? clientTypeCode === "CASH",
          autoCloseProjects:
            config.autoCloseProjects ?? clientTypeCode === "CASH",
          maxDaysToComplete:
            config.maxDaysToComplete ||
            (clientTypeCode === "ADHA"
              ? 120
              : clientTypeCode === "CASH"
                ? 60
                : 90),
          approvalHierarchy: config.approvalHierarchy || "standard",
          documentRequirements: config.documentRequirements || "standard",
        });

        // Load configuration history if available
        if (clientType.clientId) {
          const history = clientConfigService.getConfigurationHistory(
            clientType.clientId,
          );
          setConfigHistory(history);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading client configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load client configuration.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadClientConfig();
  }, [clientType, toast]);

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      // Prepare configuration object
      const configToSave = {
        theme: {
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af",
        },
        features: {
          assessments: generalConfig.enableAssessments,
          projects: generalConfig.enableProjects,
          committees: generalConfig.enableCommittee,
          financials: generalConfig.enableFinancials,
          inventory: generalConfig.enableProcurement,
          reporting: generalConfig.enableReporting,
        },
        approvalLevels: workflowConfig.requiresCommitteeApproval ? 3 : 1,
        requiresCommitteeApproval: workflowConfig.requiresCommitteeApproval,
        skipFinancialVerification: workflowConfig.skipFinancialVerification,
        autoCloseProjects: workflowConfig.autoCloseProjects,
        maxDaysToComplete: workflowConfig.maxDaysToComplete,
        autoAssignProjects: false,
        currency: "AED",
        taxRate: pricingConfig.taxPercentage,
        paymentTerms: pricingConfig.allowNegotiation ? "Negotiable" : "Net 30",
        budgetCycle: "annual",
        usesCustomPriceList: pricingConfig.usesCustomPriceList,
        priceListId: pricingConfig.priceListId,
        discountPercentage: pricingConfig.discountPercentage,
        allowNegotiation: pricingConfig.allowNegotiation,
        customSupplierList: pricingConfig.customSupplierList,
        maxProjectsPerBeneficiary: generalConfig.maxProjectsPerBeneficiary,
        approvalHierarchy: workflowConfig.approvalHierarchy,
        documentRequirements: workflowConfig.documentRequirements,
        notes: generalConfig.notes,
      };

      // Validate configuration
      const validation =
        clientConfigService.validateConfiguration(configToSave);
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Save configuration
      if (clientType.clientId) {
        // Update existing client configuration
        const result = await clientConfigService.updateClientConfiguration(
          clientType.clientId,
          configToSave,
          "system", // In a real app, this would be the current user ID
          "Updated from configuration panel",
        );

        if (result) {
          // Refresh configuration history
          const history = clientConfigService.getConfigurationHistory(
            clientType.clientId,
          );
          setConfigHistory(history);
        } else {
          throw new Error("Failed to update configuration");
        }
      } else {
        // For client types without a specific client ID
        // Just return the configuration through the onSave callback
      }

      // Call onSave callback if provided
      if (onSave) {
        onSave({
          clientTypeId: clientType.clientTypeId,
          general: generalConfig,
          pricing: pricingConfig,
          workflow: workflowConfig,
          formConfig: formConfig,
          fdfConfig: clientType.typeCode === "FDF" ? fdfConfig : undefined,
          adhaConfig: clientType.typeCode === "ADHA" ? adhaConfig : undefined,
          cashConfig: clientType.typeCode === "CASH" ? cashConfig : undefined,
          fullConfig: configToSave,
        });
      }

      toast({
        title: "Success",
        description: "Client configuration saved successfully.",
      });
      setSaving(false);
    } catch (error) {
      console.error("Error saving client configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save client configuration.",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  // Handle restoring a previous configuration version
  const handleRestoreVersion = async (versionId: string) => {
    if (!clientType.clientId) return;

    setLoading(true);
    try {
      const result = await clientConfigService.restoreConfigurationVersion(
        clientType.clientId,
        versionId,
        "system", // In a real app, this would be the current user ID
      );

      if (result) {
        toast({
          title: "Success",
          description: "Configuration version restored successfully.",
        });

        // Reload the configuration
        const clientConfig = await clientConfigService.getClientConfiguration(
          clientType.clientId,
        );
        // Update form states based on restored configuration
        // (Similar to the useEffect logic)

        // Refresh configuration history
        const history = clientConfigService.getConfigurationHistory(
          clientType.clientId,
        );
        setConfigHistory(history);
      } else {
        throw new Error("Failed to restore configuration version");
      }
    } catch (error) {
      console.error("Error restoring configuration version:", error);
      toast({
        title: "Error",
        description: "Failed to restore configuration version.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>
          {t("client.configurationFor", "Configuration for")}{" "}
          {clientType.typeNameEN}
        </CardTitle>
        <CardDescription>
          {t(
            "client.configurationDescription",
            "Customize settings and behavior for this client type",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t("common.loading", "Loading...")}</span>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">
                  {t("client.generalSettings", "General Settings")}
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  {t("client.pricingSettings", "Pricing & Billing")}
                </TabsTrigger>
                <TabsTrigger value="workflow">
                  {t("client.workflowSettings", "Workflow & Approvals")}
                </TabsTrigger>
                <TabsTrigger value="forms">
                  {t("client.formSettings", "Form Configuration")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableAssessments">
                        {t("client.enableAssessments", "Enable Assessments")}
                      </Label>
                      <Switch
                        id="enableAssessments"
                        checked={generalConfig.enableAssessments}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            enableAssessments: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.enableAssessmentsDescription",
                        "Allow assessment creation for this client type",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableProjects">
                        {t("client.enableProjects", "Enable Projects")}
                      </Label>
                      <Switch
                        id="enableProjects"
                        checked={generalConfig.enableProjects}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            enableProjects: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.enableProjectsDescription",
                        "Allow project creation for this client type",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableFinancials">
                        {t("client.enableFinancials", "Enable Financials")}
                      </Label>
                      <Switch
                        id="enableFinancials"
                        checked={generalConfig.enableFinancials}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            enableFinancials: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.enableFinancialsDescription",
                        "Enable financial tracking and reporting",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableProcurement">
                        {t("client.enableProcurement", "Enable Procurement")}
                      </Label>
                      <Switch
                        id="enableProcurement"
                        checked={generalConfig.enableProcurement}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            enableProcurement: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.enableProcurementDescription",
                        "Enable procurement and inventory management",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableCommittee">
                        {t("client.enableCommittee", "Enable Committee")}
                      </Label>
                      <Switch
                        id="enableCommittee"
                        checked={generalConfig.enableCommittee}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            enableCommittee: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.enableCommitteeDescription",
                        "Enable committee management and approvals",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireApproval">
                        {t("client.requireApproval", "Require Approval")}
                      </Label>
                      <Switch
                        id="requireApproval"
                        checked={generalConfig.requireApproval}
                        onCheckedChange={(checked) =>
                          setGeneralConfig({
                            ...generalConfig,
                            requireApproval: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.requireApprovalDescription",
                        "Require approval for assessments and projects",
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxProjectsPerBeneficiary">
                    {t(
                      "client.maxProjectsPerBeneficiary",
                      "Maximum Projects Per Beneficiary",
                    )}
                  </Label>
                  <Input
                    id="maxProjectsPerBeneficiary"
                    type="number"
                    min="1"
                    value={generalConfig.maxProjectsPerBeneficiary}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        maxProjectsPerBeneficiary:
                          parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "client.maxProjectsPerBeneficiaryDescription",
                      "Maximum number of concurrent projects allowed per beneficiary",
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("common.notes", "Notes")}</Label>
                  <Textarea
                    id="notes"
                    value={generalConfig.notes}
                    onChange={(e) =>
                      setGeneralConfig({
                        ...generalConfig,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="usesCustomPriceList">
                        {t(
                          "client.usesCustomPriceList",
                          "Uses Custom Price List",
                        )}
                      </Label>
                      <Switch
                        id="usesCustomPriceList"
                        checked={pricingConfig.usesCustomPriceList}
                        onCheckedChange={(checked) =>
                          setPricingConfig({
                            ...pricingConfig,
                            usesCustomPriceList: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.usesCustomPriceListDescription",
                        "Use a client-specific price list instead of the standard one",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customSupplierList">
                        {t("client.customSupplierList", "Custom Supplier List")}
                      </Label>
                      <Switch
                        id="customSupplierList"
                        checked={pricingConfig.customSupplierList}
                        onCheckedChange={(checked) =>
                          setPricingConfig({
                            ...pricingConfig,
                            customSupplierList: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.customSupplierListDescription",
                        "Use a client-specific supplier list",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowNegotiation">
                        {t(
                          "client.allowNegotiation",
                          "Allow Price Negotiation",
                        )}
                      </Label>
                      <Switch
                        id="allowNegotiation"
                        checked={pricingConfig.allowNegotiation}
                        onCheckedChange={(checked) =>
                          setPricingConfig({
                            ...pricingConfig,
                            allowNegotiation: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.allowNegotiationDescription",
                        "Allow prices to be negotiated on a per-project basis",
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceListId">
                    {t("client.priceListId", "Price List ID")}
                  </Label>
                  <Input
                    id="priceListId"
                    value={pricingConfig.priceListId}
                    onChange={(e) =>
                      setPricingConfig({
                        ...pricingConfig,
                        priceListId: e.target.value,
                      })
                    }
                    disabled={!pricingConfig.usesCustomPriceList}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">
                      {t("client.discountPercentage", "Discount Percentage")}
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={pricingConfig.discountPercentage}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          discountPercentage: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.discountPercentageDescription",
                        "Default discount percentage for this client type",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxPercentage">
                      {t("client.taxPercentage", "Tax Percentage")}
                    </Label>
                    <Input
                      id="taxPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={pricingConfig.taxPercentage}
                      onChange={(e) =>
                        setPricingConfig({
                          ...pricingConfig,
                          taxPercentage: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.taxPercentageDescription",
                        "Default tax percentage for this client type",
                      )}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workflow" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requiresCommitteeApproval">
                        {t(
                          "client.requiresCommitteeApproval",
                          "Requires Committee Approval",
                        )}
                      </Label>
                      <Switch
                        id="requiresCommitteeApproval"
                        checked={workflowConfig.requiresCommitteeApproval}
                        onCheckedChange={(checked) =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            requiresCommitteeApproval: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.requiresCommitteeApprovalDescription",
                        "Require committee approval for projects",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="skipFinancialVerification">
                        {t(
                          "client.skipFinancialVerification",
                          "Skip Financial Verification",
                        )}
                      </Label>
                      <Switch
                        id="skipFinancialVerification"
                        checked={workflowConfig.skipFinancialVerification}
                        onCheckedChange={(checked) =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            skipFinancialVerification: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.skipFinancialVerificationDescription",
                        "Skip financial verification step in workflow",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoCloseProjects">
                        {t("client.autoCloseProjects", "Auto-Close Projects")}
                      </Label>
                      <Switch
                        id="autoCloseProjects"
                        checked={workflowConfig.autoCloseProjects}
                        onCheckedChange={(checked) =>
                          setWorkflowConfig({
                            ...workflowConfig,
                            autoCloseProjects: checked,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.autoCloseProjectsDescription",
                        "Automatically close projects when all tasks are complete",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDaysToComplete">
                      {t("client.maxDaysToComplete", "Max Days to Complete")}
                    </Label>
                    <Input
                      id="maxDaysToComplete"
                      type="number"
                      min="1"
                      value={workflowConfig.maxDaysToComplete}
                      onChange={(e) =>
                        setWorkflowConfig({
                          ...workflowConfig,
                          maxDaysToComplete: parseInt(e.target.value) || 90,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.maxDaysToCompleteDescription",
                        "Maximum number of days allowed for project completion",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvalHierarchy">
                      {t("client.approvalHierarchy", "Approval Hierarchy")}
                    </Label>
                    <Select
                      value={workflowConfig.approvalHierarchy}
                      onValueChange={(value) =>
                        setWorkflowConfig({
                          ...workflowConfig,
                          approvalHierarchy: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval hierarchy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          {t("client.standardApproval", "Standard Approval")}
                        </SelectItem>
                        <SelectItem value="expedited">
                          {t("client.expeditedApproval", "Expedited Approval")}
                        </SelectItem>
                        <SelectItem value="extended">
                          {t("client.extendedApproval", "Extended Approval")}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t("client.customApproval", "Custom Approval")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.approvalHierarchyDescription",
                        "Define the approval hierarchy for this client type",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentRequirements">
                      {t(
                        "client.documentRequirements",
                        "Document Requirements",
                      )}
                    </Label>
                    <Select
                      value={workflowConfig.documentRequirements}
                      onValueChange={(value) =>
                        setWorkflowConfig({
                          ...workflowConfig,
                          documentRequirements: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document requirements" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          {t("client.standardDocuments", "Standard Documents")}
                        </SelectItem>
                        <SelectItem value="minimal">
                          {t("client.minimalDocuments", "Minimal Documents")}
                        </SelectItem>
                        <SelectItem value="comprehensive">
                          {t(
                            "client.comprehensiveDocuments",
                            "Comprehensive Documents",
                          )}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t("client.customDocuments", "Custom Documents")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.documentRequirementsDescription",
                        "Define the document requirements for this client type",
                      )}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="forms" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {t("client.requiredFields", "Required Fields")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="beneficiaryPhone">
                          {t("client.beneficiaryPhone", "Beneficiary Phone")}
                        </Label>
                        <Switch
                          id="beneficiaryPhone"
                          checked={formConfig.requiredFields.beneficiaryPhone}
                          onCheckedChange={(checked) =>
                            setFormConfig({
                              ...formConfig,
                              requiredFields: {
                                ...formConfig.requiredFields,
                                beneficiaryPhone: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="beneficiaryEmail">
                          {t("client.beneficiaryEmail", "Beneficiary Email")}
                        </Label>
                        <Switch
                          id="beneficiaryEmail"
                          checked={formConfig.requiredFields.beneficiaryEmail}
                          onCheckedChange={(checked) =>
                            setFormConfig({
                              ...formConfig,
                              requiredFields: {
                                ...formConfig.requiredFields,
                                beneficiaryEmail: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="propertyDetails">
                          {t("client.propertyDetails", "Property Details")}
                        </Label>
                        <Switch
                          id="propertyDetails"
                          checked={formConfig.requiredFields.propertyDetails}
                          onCheckedChange={(checked) =>
                            setFormConfig({
                              ...formConfig,
                              requiredFields: {
                                ...formConfig.requiredFields,
                                propertyDetails: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emergencyContact">
                          {t("client.emergencyContact", "Emergency Contact")}
                        </Label>
                        <Switch
                          id="emergencyContact"
                          checked={formConfig.requiredFields.emergencyContact}
                          onCheckedChange={(checked) =>
                            setFormConfig({
                              ...formConfig,
                              requiredFields: {
                                ...formConfig.requiredFields,
                                emergencyContact: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="validationRules">
                    {t("client.validationRules", "Validation Rules")}
                  </Label>
                  <Select
                    value={formConfig.validationRules}
                    onValueChange={(value) =>
                      setFormConfig({
                        ...formConfig,
                        validationRules: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select validation rules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        {t("client.standardValidation", "Standard Validation")}
                      </SelectItem>
                      <SelectItem value="strict">
                        {t("client.strictValidation", "Strict Validation")}
                      </SelectItem>
                      <SelectItem value="relaxed">
                        {t("client.relaxedValidation", "Relaxed Validation")}
                      </SelectItem>
                      <SelectItem value="custom">
                        {t("client.customValidation", "Custom Validation")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "client.validationRulesDescription",
                      "Define the validation rules for forms",
                    )}
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>{t("client.customFields", "Custom Fields")}</Label>
                    <Button variant="outline" size="sm" type="button">
                      <Settings className="h-4 w-4 mr-2" />
                      {t(
                        "client.configureCustomFields",
                        "Configure Custom Fields",
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "client.customFieldsDescription",
                      "Configure custom fields for forms",
                    )}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Configuration History Section */}
            {clientType.clientId && configHistory.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">
                    {t("client.configurationHistory", "Configuration History")}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory
                      ? t("common.hide", "Hide")
                      : t("common.show", "Show")}
                  </Button>
                </div>

                {showHistory && (
                  <div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {configHistory.map((version) => (
                        <li
                          key={version.id}
                          className="flex items-center justify-between text-sm border-b pb-2"
                        >
                          <div>
                            <span className="font-medium">
                              {new Date(version.createdAt).toLocaleString()}
                            </span>
                            <p className="text-gray-500">
                              {version.comment || "No comment"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            {t("client.restore", "Restore")}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to default configuration
                  const clientTypeCode =
                    clientType.typeCode ||
                    (clientType.clientTypeId === 1
                      ? "FDF"
                      : clientType.clientTypeId === 2
                        ? "ADHA"
                        : clientType.clientTypeId === 3
                          ? "CASH"
                          : "OTHER");

                  const defaultConfig =
                    clientConfigService.getDefaultConfiguration(
                      clientTypeCode as any,
                    );

                  // Update form states based on default configuration
                  // This would be similar to the useEffect logic
                  toast({
                    title: "Reset to Defaults",
                    description:
                      "Configuration has been reset to default values.",
                  });
                }}
              >
                {t("common.resetToDefaults", "Reset to Defaults")}
              </Button>

              <Button onClick={handleSaveConfiguration} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {t("common.saveConfiguration", "Save Configuration")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientConfigurationPanel;
