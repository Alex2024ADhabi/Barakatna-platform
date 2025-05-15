import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";
import { Loader2, Save, Upload, Calendar } from "lucide-react";
import { clientConfigService } from "@/services/clientConfigService";
import { ClientType } from "@/lib/forms/types";

interface ClientRegistrationFormProps {
  onSubmit?: (clientData: any) => void;
  onCancel?: () => void;
  availableClientTypes?: any[];
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  availableClientTypes = [],
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client data state
  const [clientData, setClientData] = useState({
    // Basic information
    nameEN: "",
    nameAR: "",
    code: "",
    logo: null,
    email: "",
    phone: "",
    website: "",
    address: "",
    description: "",

    // Contract information
    contractStartDate: "",
    contractEndDate: "",
    renewalTerms: "",
    contractValue: "",
    paymentTerms: "",
    contractNotes: "",

    // Service level
    enabledModules: {
      assessment: true,
      project: true,
      financial: true,
      procurement: true,
      committee: true,
      reporting: true,
    },
    workflowOptions: {
      requireApproval: true,
      requireCommittee: true,
      autoCloseProjects: false,
    },

    // Integration settings
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    notificationEmail: "",
    notificationPreferences: {
      email: true,
      sms: false,
      inApp: true,
    },

    // Default parameters
    defaultParameters: {
      maxProjectsPerBeneficiary: 1,
      maxDaysToComplete: 90,
      discountPercentage: 0,
      taxPercentage: 5,
    },
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setClientData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBasicInputChange = (field: string, value: any) => {
    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModuleToggle = (module: string, enabled: boolean) => {
    setClientData((prev) => ({
      ...prev,
      enabledModules: {
        ...prev.enabledModules,
        [module]: enabled,
      },
    }));
  };

  const handleWorkflowToggle = (option: string, enabled: boolean) => {
    setClientData((prev) => ({
      ...prev,
      workflowOptions: {
        ...prev.workflowOptions,
        [option]: enabled,
      },
    }));
  };

  const handleNotificationToggle = (channel: string, enabled: boolean) => {
    setClientData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [channel]: enabled,
      },
    }));
  };

  const handleDefaultParameterChange = (parameter: string, value: any) => {
    setClientData((prev) => ({
      ...prev,
      defaultParameters: {
        ...prev.defaultParameters,
        [parameter]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload the file to a server
      // For now, we'll just store the file object
      setClientData((prev) => ({
        ...prev,
        logo: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!clientData.nameEN || !clientData.nameAR || !clientData.code) {
        toast({
          title: t("client.validationError", "Validation Error"),
          description: t(
            "client.requiredFieldsMissing",
            "Please fill in all required fields",
          ),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // In a real implementation, this would call an API to register the client
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new client type
      const newClientType = {
        clientTypeId: Math.floor(Math.random() * 1000) + 10, // Generate a random ID (in a real app, this would come from the server)
        typeCode: clientData.code,
        typeNameEN: clientData.nameEN,
        typeNameAR: clientData.nameAR,
        description: clientData.description,
        isActive: true,
        createdBy: 1, // Assuming user ID 1
        createdDate: new Date(),
      };

      // Add the client type to the client config service
      clientConfigService.addClientType(newClientType);

      // Update the client configuration
      const clientConfig = clientConfigService.getClientConfig(
        newClientType.clientTypeId,
      );
      if (clientConfig) {
        // Create a configuration object based on form data
        const configToSave = {
          theme: {
            primaryColor: "#2563eb",
            secondaryColor: "#1e40af",
          },
          features: {
            assessments: clientData.enabledModules.assessment,
            projects: clientData.enabledModules.project,
            committees: clientData.enabledModules.committee,
            financials: clientData.enabledModules.financial,
            inventory: clientData.enabledModules.procurement,
            reporting: clientData.enabledModules.reporting,
          },
          approvalLevels: clientData.workflowOptions.requireCommittee ? 3 : 1,
          requiresCommitteeApproval:
            clientData.workflowOptions.requireCommittee,
          skipFinancialVerification: false,
          autoCloseProjects: clientData.workflowOptions.autoCloseProjects,
          maxDaysToComplete: clientData.defaultParameters.maxDaysToComplete,
          autoAssignProjects: false,
          currency: "AED",
          taxRate: clientData.defaultParameters.taxPercentage,
          paymentTerms: "Net 30",
          budgetCycle: "annual",
          usesCustomPriceList: false,
          priceListId: `${clientData.code}-${new Date().getFullYear()}`,
          discountPercentage: clientData.defaultParameters.discountPercentage,
          allowNegotiation: false,
          customSupplierList: false,
          maxProjectsPerBeneficiary:
            clientData.defaultParameters.maxProjectsPerBeneficiary,
        };

        // Save the updated configuration
        await clientConfigService.saveClientConfig({
          clientTypeId: newClientType.clientTypeId,
          general: {
            enableAssessments: clientData.enabledModules.assessment,
            enableProjects: clientData.enabledModules.project,
            enableFinancials: clientData.enabledModules.financial,
            maxProjectsPerBeneficiary:
              clientData.defaultParameters.maxProjectsPerBeneficiary,
            requireApproval: clientData.workflowOptions.requireApproval,
            notes: clientData.description || "",
          },
          pricing: {
            usesCustomPriceList: false,
            priceListId: `${clientData.code}-${new Date().getFullYear()}`,
            discountPercentage: clientData.defaultParameters.discountPercentage,
            taxPercentage: clientData.defaultParameters.taxPercentage,
            allowNegotiation: false,
          },
          workflow: {
            requiresCommitteeApproval:
              clientData.workflowOptions.requireCommittee,
            skipFinancialVerification: false,
            autoCloseProjects: clientData.workflowOptions.autoCloseProjects,
            maxDaysToComplete: clientData.defaultParameters.maxDaysToComplete,
          },
        });
      }

      toast({
        title: t("client.registrationSuccess", "Registration Successful"),
        description: t(
          "client.clientRegistered",
          "Client has been successfully registered",
        ),
      });

      if (onSubmit) {
        onSubmit({
          ...clientData,
          clientTypeId: newClientType.clientTypeId,
        });
      }
    } catch (error) {
      console.error("Error registering client:", error);
      toast({
        title: t("client.registrationError", "Registration Error"),
        description: t(
          "client.errorOccurred",
          "An error occurred while registering the client",
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>
          {t("client.registerNewClient", "Register New Client")}
        </CardTitle>
        <CardDescription>
          {t(
            "client.registerDescription",
            "Enter client details to register a new client in the system",
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">
                {t("client.basicInformation", "Basic Information")}
              </TabsTrigger>
              <TabsTrigger value="contract">
                {t("client.contractInformation", "Contract Information")}
              </TabsTrigger>
              <TabsTrigger value="service">
                {t("client.serviceLevel", "Service Level")}
              </TabsTrigger>
              <TabsTrigger value="integration">
                {t("client.integrationSettings", "Integration Settings")}
              </TabsTrigger>
              <TabsTrigger value="parameters">
                {t("client.defaultParameters", "Default Parameters")}
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameEN">
                    {t("client.nameEN", "Name (English)")} *
                  </Label>
                  <Input
                    id="nameEN"
                    value={clientData.nameEN}
                    onChange={(e) =>
                      handleBasicInputChange("nameEN", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameAR">
                    {t("client.nameAR", "Name (Arabic)")} *
                  </Label>
                  <Input
                    id="nameAR"
                    value={clientData.nameAR}
                    onChange={(e) =>
                      handleBasicInputChange("nameAR", e.target.value)
                    }
                    required
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    {t("client.code", "Client Code")} *
                  </Label>
                  <Input
                    id="code"
                    value={clientData.code}
                    onChange={(e) =>
                      handleBasicInputChange("code", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">{t("client.logo", "Logo")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("client.uploadLogo", "Upload Logo")}
                    </Button>
                    {clientData.logo && (
                      <span className="text-sm text-muted-foreground">
                        {(clientData.logo as File).name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("common.email", "Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) =>
                      handleBasicInputChange("email", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("common.phone", "Phone")}</Label>
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) =>
                      handleBasicInputChange("phone", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    {t("common.website", "Website")}
                  </Label>
                  <Input
                    id="website"
                    value={clientData.website}
                    onChange={(e) =>
                      handleBasicInputChange("website", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    {t("common.address", "Address")}
                  </Label>
                  <Input
                    id="address"
                    value={clientData.address}
                    onChange={(e) =>
                      handleBasicInputChange("address", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("common.description", "Description")}
                </Label>
                <Textarea
                  id="description"
                  value={clientData.description}
                  onChange={(e) =>
                    handleBasicInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Contract Information Tab */}
            <TabsContent value="contract" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractStartDate">
                    {t("client.contractStartDate", "Contract Start Date")}
                  </Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="contractStartDate"
                      type="date"
                      value={clientData.contractStartDate}
                      onChange={(e) =>
                        handleBasicInputChange(
                          "contractStartDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">
                    {t("client.contractEndDate", "Contract End Date")}
                  </Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="contractEndDate"
                      type="date"
                      value={clientData.contractEndDate}
                      onChange={(e) =>
                        handleBasicInputChange(
                          "contractEndDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractValue">
                    {t("client.contractValue", "Contract Value")}
                  </Label>
                  <Input
                    id="contractValue"
                    type="text"
                    value={clientData.contractValue}
                    onChange={(e) =>
                      handleBasicInputChange("contractValue", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">
                    {t("client.paymentTerms", "Payment Terms")}
                  </Label>
                  <Input
                    id="paymentTerms"
                    type="text"
                    value={clientData.paymentTerms}
                    onChange={(e) =>
                      handleBasicInputChange("paymentTerms", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewalTerms">
                  {t("client.renewalTerms", "Renewal Terms")}
                </Label>
                <Textarea
                  id="renewalTerms"
                  value={clientData.renewalTerms}
                  onChange={(e) =>
                    handleBasicInputChange("renewalTerms", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractNotes">
                  {t("client.contractNotes", "Contract Notes")}
                </Label>
                <Textarea
                  id="contractNotes"
                  value={clientData.contractNotes}
                  onChange={(e) =>
                    handleBasicInputChange("contractNotes", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Service Level Tab */}
            <TabsContent value="service" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("client.enabledModules", "Enabled Modules")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleAssessment">
                        {t("client.moduleAssessment", "Assessment Module")}
                      </Label>
                      <Switch
                        id="moduleAssessment"
                        checked={clientData.enabledModules.assessment}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("assessment", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleAssessmentDescription",
                        "Enable assessment creation and management",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleProject">
                        {t("client.moduleProject", "Project Module")}
                      </Label>
                      <Switch
                        id="moduleProject"
                        checked={clientData.enabledModules.project}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("project", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleProjectDescription",
                        "Enable project creation and management",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleFinancial">
                        {t("client.moduleFinancial", "Financial Module")}
                      </Label>
                      <Switch
                        id="moduleFinancial"
                        checked={clientData.enabledModules.financial}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("financial", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleFinancialDescription",
                        "Enable financial tracking and reporting",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleProcurement">
                        {t("client.moduleProcurement", "Procurement Module")}
                      </Label>
                      <Switch
                        id="moduleProcurement"
                        checked={clientData.enabledModules.procurement}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("procurement", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleProcurementDescription",
                        "Enable procurement and inventory management",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleCommittee">
                        {t("client.moduleCommittee", "Committee Module")}
                      </Label>
                      <Switch
                        id="moduleCommittee"
                        checked={clientData.enabledModules.committee}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("committee", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleCommitteeDescription",
                        "Enable committee management and approvals",
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="moduleReporting">
                        {t("client.moduleReporting", "Reporting Module")}
                      </Label>
                      <Switch
                        id="moduleReporting"
                        checked={clientData.enabledModules.reporting}
                        onCheckedChange={(checked) =>
                          handleModuleToggle("reporting", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.moduleReportingDescription",
                        "Enable advanced reporting and analytics",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">
                  {t("client.workflowOptions", "Workflow Options")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireApproval">
                        {t("client.requireApproval", "Require Approval")}
                      </Label>
                      <Switch
                        id="requireApproval"
                        checked={clientData.workflowOptions.requireApproval}
                        onCheckedChange={(checked) =>
                          handleWorkflowToggle("requireApproval", checked)
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireCommittee">
                        {t(
                          "client.requireCommittee",
                          "Require Committee Approval",
                        )}
                      </Label>
                      <Switch
                        id="requireCommittee"
                        checked={clientData.workflowOptions.requireCommittee}
                        onCheckedChange={(checked) =>
                          handleWorkflowToggle("requireCommittee", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "client.requireCommitteeDescription",
                        "Require committee approval for projects",
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
                        checked={clientData.workflowOptions.autoCloseProjects}
                        onCheckedChange={(checked) =>
                          handleWorkflowToggle("autoCloseProjects", checked)
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
                </div>
              </div>
            </TabsContent>

            {/* Integration Settings Tab */}
            <TabsContent value="integration" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">
                    {t("client.apiKey", "API Key")}
                  </Label>
                  <Input
                    id="apiKey"
                    value={clientData.apiKey}
                    onChange={(e) =>
                      handleBasicInputChange("apiKey", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">
                    {t("client.apiSecret", "API Secret")}
                  </Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={clientData.apiSecret}
                    onChange={(e) =>
                      handleBasicInputChange("apiSecret", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">
                    {t("client.webhookUrl", "Webhook URL")}
                  </Label>
                  <Input
                    id="webhookUrl"
                    value={clientData.webhookUrl}
                    onChange={(e) =>
                      handleBasicInputChange("webhookUrl", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">
                    {t("client.notificationEmail", "Notification Email")}
                  </Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={clientData.notificationEmail}
                    onChange={(e) =>
                      handleBasicInputChange(
                        "notificationEmail",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">
                  {t(
                    "client.notificationPreferences",
                    "Notification Preferences",
                  )}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifyEmail">
                        {t("client.notifyEmail", "Email Notifications")}
                      </Label>
                      <Switch
                        id="notifyEmail"
                        checked={clientData.notificationPreferences.email}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("email", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifySms">
                        {t("client.notifySms", "SMS Notifications")}
                      </Label>
                      <Switch
                        id="notifySms"
                        checked={clientData.notificationPreferences.sms}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("sms", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifyInApp">
                        {t("client.notifyInApp", "In-App Notifications")}
                      </Label>
                      <Switch
                        id="notifyInApp"
                        checked={clientData.notificationPreferences.inApp}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("inApp", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Default Parameters Tab */}
            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    value={
                      clientData.defaultParameters.maxProjectsPerBeneficiary
                    }
                    onChange={(e) =>
                      handleDefaultParameterChange(
                        "maxProjectsPerBeneficiary",
                        parseInt(e.target.value) || 1,
                      )
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
                  <Label htmlFor="maxDaysToComplete">
                    {t("client.maxDaysToComplete", "Max Days to Complete")}
                  </Label>
                  <Input
                    id="maxDaysToComplete"
                    type="number"
                    min="1"
                    value={clientData.defaultParameters.maxDaysToComplete}
                    onChange={(e) =>
                      handleDefaultParameterChange(
                        "maxDaysToComplete",
                        parseInt(e.target.value) || 90,
                      )
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
                  <Label htmlFor="discountPercentage">
                    {t("client.discountPercentage", "Discount Percentage")}
                  </Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={clientData.defaultParameters.discountPercentage}
                    onChange={(e) =>
                      handleDefaultParameterChange(
                        "discountPercentage",
                        parseInt(e.target.value) || 0,
                      )
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
                    value={clientData.defaultParameters.taxPercentage}
                    onChange={(e) =>
                      handleDefaultParameterChange(
                        "taxPercentage",
                        parseInt(e.target.value) || 0,
                      )
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
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {t("client.registerClient", "Register Client")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ClientRegistrationForm;
