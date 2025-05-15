import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectField, TextInput } from "@/components/ui/form-components";
import { formDependencyResolver } from "@/lib/services/FormDependencyResolver";
import {
  ClientType,
  FormDependency,
  FormField,
  FormMetadata,
} from "@/lib/forms/types";
import { formRegistry } from "@/lib/forms/registry";
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface ClientDependencyManagerProps {
  clientId?: string;
  clientType?: string | ClientType;
  clientTypeId?: number;
  readOnly?: boolean;
}

interface DependencyRule {
  id: string;
  sourceFormId: string;
  sourceFormName: string;
  sourceFieldId: string;
  sourceFieldName: string;
  targetFormId: string;
  targetFormName: string;
  targetFieldId: string;
  targetFieldName: string;
  condition: string;
  action: string;
  clientTypes: ClientType[];
  isActive: boolean;
}

const ClientDependencyManager: React.FC<ClientDependencyManagerProps> = ({
  clientId,
  clientType,
  clientTypeId,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  // Convert string clientType to enum if needed
  const effectiveClientType =
    typeof clientType === "string"
      ? (clientType as ClientType)
      : clientType || ClientType.FDF;

  const [activeTab, setActiveTab] = useState("dependencies");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormModule, setSelectedFormModule] = useState<string>("");
  const [dependencyRules, setDependencyRules] = useState<DependencyRule[]>([]);
  const [forms, setForms] = useState<FormMetadata[]>([]);
  const [selectedRule, setSelectedRule] = useState<DependencyRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch dependency data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use the formRegistry and formDependencyResolver

        // Get all forms
        const allForms = formRegistry.getAllForms();
        setForms(allForms);

        // Generate mock dependency rules
        const mockRules: DependencyRule[] = [
          {
            id: "rule1",
            sourceFormId: "assessment-form",
            sourceFormName: "Assessment Form",
            sourceFieldId: "mobility-score",
            sourceFieldName: "Mobility Score",
            targetFormId: "recommendation-form",
            targetFormName: "Recommendation Form",
            targetFieldId: "mobility-aids",
            targetFieldName: "Mobility Aids",
            condition: "mobilityScore < 3",
            action: "show",
            clientTypes: [ClientType.FDF, ClientType.ADHA],
            isActive: true,
          },
          {
            id: "rule2",
            sourceFormId: "client-registration",
            sourceFormName: "Client Registration",
            sourceFieldId: "age",
            sourceFieldName: "Age",
            targetFormId: "assessment-form",
            targetFormName: "Assessment Form",
            targetFieldId: "senior-specific-questions",
            targetFieldName: "Senior Specific Questions",
            condition: "age >= 65",
            action: "show",
            clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
            isActive: true,
          },
          {
            id: "rule3",
            sourceFormId: "assessment-form",
            sourceFormName: "Assessment Form",
            sourceFieldId: "bathroom-modification",
            sourceFieldName: "Bathroom Modification",
            targetFormId: "price-list",
            targetFormName: "Price List",
            targetFieldId: "bathroom-items",
            targetFieldName: "Bathroom Items",
            condition: "bathroomModification === true",
            action: "filter",
            clientTypes: [ClientType.FDF],
            isActive: true,
          },
        ];

        setDependencyRules(mockRules);
      } catch (err) {
        setError(t("common.errors.general"));
        console.error("Error fetching dependency data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t, clientId, clientTypeId, effectiveClientType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the rules in the render
  };

  const handleFormModuleChange = (value: string) => {
    setSelectedFormModule(value);
  };

  const handleAddRule = () => {
    setSelectedRule(null);
    setShowRuleDialog(true);
  };

  const handleEditRule = (rule: DependencyRule) => {
    setSelectedRule(rule);
    setShowRuleDialog(true);
  };

  const handleDeleteRule = (rule: DependencyRule) => {
    setSelectedRule(rule);
    setShowDeleteDialog(true);
  };

  const handleSaveRule = (rule: DependencyRule) => {
    // In a real implementation, this would be an API call
    if (selectedRule) {
      // Update existing rule
      setDependencyRules((prevRules) =>
        prevRules.map((r) => (r.id === selectedRule.id ? rule : r)),
      );
    } else {
      // Add new rule
      setDependencyRules((prevRules) => [
        ...prevRules,
        { ...rule, id: `rule${prevRules.length + 1}` },
      ]);
    }
    setShowRuleDialog(false);
  };

  const handleConfirmDelete = () => {
    if (selectedRule) {
      // In a real implementation, this would be an API call
      setDependencyRules((prevRules) =>
        prevRules.filter((r) => r.id !== selectedRule.id),
      );
      setShowDeleteDialog(false);
      setSelectedRule(null);
    }
  };

  const filteredRules = dependencyRules.filter((rule) => {
    const matchesSearch = searchTerm
      ? rule.sourceFormName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.targetFormName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.sourceFieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.targetFieldName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesModule = selectedFormModule
      ? rule.sourceFormId.startsWith(selectedFormModule) ||
        rule.targetFormId.startsWith(selectedFormModule)
      : true;

    const matchesClientType = rule.clientTypes.includes(effectiveClientType);

    return matchesSearch && matchesModule && matchesClientType;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {t("client.dependencyManager")}
          {effectiveClientType && (
            <span className="ml-2 text-lg font-normal text-gray-600">
              ({effectiveClientType})
            </span>
          )}
        </h2>
        <p className="text-gray-600">
          {t("client.dependencyManagerDescription")}
        </p>
      </div>

      <Tabs
        defaultValue="dependencies"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="dependencies">
            {t("client.formDependencies")}
          </TabsTrigger>
          <TabsTrigger value="validation">
            {t("client.validationRules")}
          </TabsTrigger>
          <TabsTrigger value="propagation">
            {t("client.dataPropagation")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dependencies" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-2"
              >
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder={t("common.buttons.search")}
                    className="border rounded-md pl-10 pr-3 py-2 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <SelectField
                  label=""
                  value={selectedFormModule}
                  onChange={handleFormModuleChange}
                  options={[
                    "",
                    "assessment",
                    "project",
                    "procurement",
                    "financial",
                  ]}
                  placeholder={t("client.selectModule")}
                />
                <Button type="submit" variant="outline" size="sm">
                  <Filter className="mr-2" size={16} />
                  {t("common.buttons.filter")}
                </Button>
              </form>

              <div className="flex items-center space-x-2">
                {!readOnly && (
                  <Button onClick={handleAddRule} variant="default" size="sm">
                    <Plus className="mr-2" size={16} />
                    {t("client.addDependencyRule")}
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.labels.sourceForm")}</TableHead>
                      <TableHead>{t("common.labels.sourceField")}</TableHead>
                      <TableHead></TableHead>
                      <TableHead>{t("common.labels.targetForm")}</TableHead>
                      <TableHead>{t("common.labels.targetField")}</TableHead>
                      <TableHead>{t("common.labels.condition")}</TableHead>
                      <TableHead>{t("common.labels.action")}</TableHead>
                      <TableHead>{t("common.labels.status")}</TableHead>
                      <TableHead>{t("common.labels.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          {t("common.noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.sourceFormName}</TableCell>
                          <TableCell>{rule.sourceFieldName}</TableCell>
                          <TableCell>
                            <ArrowRight className="mx-auto" size={16} />
                          </TableCell>
                          <TableCell>{rule.targetFormName}</TableCell>
                          <TableCell>{rule.targetFieldName}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {rule.condition}
                            </code>
                          </TableCell>
                          <TableCell>{rule.action}</TableCell>
                          <TableCell>
                            {rule.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check size={12} className="mr-1" />
                                {t("common.status.active")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <X size={12} className="mr-1" />
                                {t("common.status.inactive")}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => handleEditRule(rule)}
                                disabled={readOnly}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteRule(rule)}
                                disabled={readOnly}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-800">
                {t("client.validationRulesDescription")}
              </p>
            </div>

            {/* Validation rules content would go here */}
            <div className="text-center py-8 text-gray-500">
              {t("common.comingSoon")}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="propagation" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800">
                {t("client.dataPropagationDescription")}
              </p>
            </div>

            {/* Data propagation content would go here */}
            <div className="text-center py-8 text-gray-500">
              {t("common.comingSoon")}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule
                ? t("client.editDependencyRule")
                : t("client.addDependencyRule")}
            </DialogTitle>
            <DialogDescription>
              {t("client.dependencyRuleDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium">{t("client.sourceForm")}</h3>
              <SelectField
                label={t("common.labels.form")}
                value={selectedRule?.sourceFormId || ""}
                onChange={() => {}}
                options={forms.map((form) => ({
                  value: form.id,
                  label: form.title,
                }))}
                placeholder={t("client.selectForm")}
              />

              <SelectField
                label={t("common.labels.field")}
                value={selectedRule?.sourceFieldId || ""}
                onChange={() => {}}
                options={[
                  { value: "field1", label: "Field 1" },
                  { value: "field2", label: "Field 2" },
                ]}
                placeholder={t("client.selectField")}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">{t("client.targetForm")}</h3>
              <SelectField
                label={t("common.labels.form")}
                value={selectedRule?.targetFormId || ""}
                onChange={() => {}}
                options={forms.map((form) => ({
                  value: form.id,
                  label: form.title,
                }))}
                placeholder={t("client.selectForm")}
              />

              <SelectField
                label={t("common.labels.field")}
                value={selectedRule?.targetFieldId || ""}
                onChange={() => {}}
                options={[
                  { value: "field1", label: "Field 1" },
                  { value: "field2", label: "Field 2" },
                ]}
                placeholder={t("client.selectField")}
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <h3 className="font-medium">{t("client.ruleDetails")}</h3>

            <TextInput
              label={t("common.labels.condition")}
              value={selectedRule?.condition || ""}
              onChange={() => {}}
              placeholder="e.g. value > 10 || status === 'approved'"
            />

            <SelectField
              label={t("common.labels.action")}
              value={selectedRule?.action || ""}
              onChange={() => {}}
              options={[
                { value: "show", label: t("client.actions.show") },
                { value: "hide", label: t("client.actions.hide") },
                { value: "enable", label: t("client.actions.enable") },
                { value: "disable", label: t("client.actions.disable") },
                { value: "require", label: t("client.actions.require") },
                { value: "filter", label: t("client.actions.filter") },
              ]}
              placeholder={t("client.selectAction")}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("common.labels.clientTypes")}
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(ClientType).map((type) => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      checked={
                        selectedRule?.clientTypes.includes(
                          type as ClientType,
                        ) || false
                      }
                      onChange={() => {}}
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={() => {
                // In a real implementation, we would validate and save the rule
                if (selectedRule) {
                  handleSaveRule(selectedRule);
                } else {
                  // Create a new rule with mock data
                  handleSaveRule({
                    id: "",
                    sourceFormId: "assessment-form",
                    sourceFormName: "Assessment Form",
                    sourceFieldId: "new-field",
                    sourceFieldName: "New Field",
                    targetFormId: "recommendation-form",
                    targetFormName: "Recommendation Form",
                    targetFieldId: "target-field",
                    targetFieldName: "Target Field",
                    condition: "value > 0",
                    action: "show",
                    clientTypes: [effectiveClientType],
                    isActive: true,
                  });
                }
              }}
              className="ml-2"
            >
              {t("common.buttons.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("client.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("client.deleteRuleConfirmation")}
            </DialogDescription>
          </DialogHeader>

          {selectedRule && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <strong>{t("common.labels.sourceForm")}:</strong>{" "}
                {selectedRule.sourceFormName}
              </p>
              <p>
                <strong>{t("common.labels.sourceField")}:</strong>{" "}
                {selectedRule.sourceFieldName}
              </p>
              <p>
                <strong>{t("common.labels.targetForm")}:</strong>{" "}
                {selectedRule.targetFormName}
              </p>
              <p>
                <strong>{t("common.labels.targetField")}:</strong>{" "}
                {selectedRule.targetFieldName}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="ml-2"
            >
              {t("common.buttons.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ClientDependencyManager };
export default ClientDependencyManager;
