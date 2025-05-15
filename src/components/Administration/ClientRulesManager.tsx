import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  Edit,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  clientRulesService,
  BusinessRule,
  RuleCategory,
  RuleOperator,
  RuleAction,
  RuleCondition,
  RuleActionConfig,
  RuleAuditEntry,
} from "@/lib/services/ClientRulesService";
import { ClientType } from "@/lib/forms/types";

const ClientRulesManager: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<RuleCategory>(
    RuleCategory.ELIGIBILITY,
  );
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [auditLog, setAuditLog] = useState<RuleAuditEntry[]>([]);

  // Form state for rule editing
  const [editForm, setEditForm] = useState<BusinessRule>(createEmptyRule());
  const [editConditions, setEditConditions] = useState<RuleCondition[]>([]);
  const [editActions, setEditActions] = useState<RuleActionConfig[]>([]);

  // Load rules on component mount and category change
  useEffect(() => {
    loadRules();
  }, [activeCategory]);

  function loadRules() {
    const categoryRules = clientRulesService.getRulesByCategory(activeCategory);
    setRules(categoryRules);
  }

  function createEmptyRule(): BusinessRule {
    return {
      id: "",
      name: "",
      description: "",
      category: activeCategory,
      clientTypes: [],
      conditions: [],
      actions: [],
      priority: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "current_user", // In a real app, get from auth context
      updatedBy: "current_user",
      version: 1,
    };
  }

  function handleCreateRule() {
    setEditForm(createEmptyRule());
    setEditConditions([]);
    setEditActions([]);
    setIsEditDialogOpen(true);
  }

  function handleEditRule(rule: BusinessRule) {
    setSelectedRule(rule);
    setEditForm({ ...rule });
    setEditConditions([...rule.conditions]);
    setEditActions([...rule.actions]);
    setIsEditDialogOpen(true);
  }

  function handleDeleteRule(rule: BusinessRule) {
    setSelectedRule(rule);
    setIsDeleteDialogOpen(true);
  }

  function handleViewAudit(rule: BusinessRule) {
    setSelectedRule(rule);
    const ruleAudit = clientRulesService.getRuleAuditLog(rule.id);
    setAuditLog(ruleAudit);
    setIsAuditDialogOpen(true);
  }

  function handleSaveRule() {
    const updatedRule: BusinessRule = {
      ...editForm,
      conditions: editConditions,
      actions: editActions,
      updatedAt: new Date(),
    };

    let success = false;

    if (updatedRule.id && clientRulesService.getRule(updatedRule.id)) {
      // Update existing rule
      success = clientRulesService.updateRule(
        updatedRule.id,
        updatedRule,
        "current_user", // In a real app, get from auth context
      );
    } else {
      // Create new rule with generated ID if empty
      if (!updatedRule.id) {
        updatedRule.id = `${updatedRule.category}-${Date.now()}`;
      }
      success = clientRulesService.createRule(updatedRule);
    }

    if (success) {
      setIsEditDialogOpen(false);
      loadRules();
    }
  }

  function handleConfirmDelete() {
    if (selectedRule) {
      const success = clientRulesService.deleteRule(
        selectedRule.id,
        "current_user", // In a real app, get from auth context
      );

      if (success) {
        setIsDeleteDialogOpen(false);
        loadRules();
      }
    }
  }

  function handleToggleRuleActive(rule: BusinessRule) {
    const success = clientRulesService.setRuleActive(
      rule.id,
      !rule.isActive,
      "current_user", // In a real app, get from auth context
    );

    if (success) {
      loadRules();
    }
  }

  function handleAddCondition() {
    const newCondition: RuleCondition = {
      field: "",
      operator: RuleOperator.EQUALS,
      value: "",
    };
    setEditConditions([...editConditions, newCondition]);
  }

  function handleUpdateCondition(
    index: number,
    field: keyof RuleCondition,
    value: any,
  ) {
    const updatedConditions = [...editConditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value,
    };
    setEditConditions(updatedConditions);
  }

  function handleRemoveCondition(index: number) {
    const updatedConditions = [...editConditions];
    updatedConditions.splice(index, 1);
    setEditConditions(updatedConditions);
  }

  function handleAddAction() {
    const newAction: RuleActionConfig = {
      type: RuleAction.APPROVE,
    };
    setEditActions([...editActions, newAction]);
  }

  function handleUpdateAction(
    index: number,
    field: keyof RuleActionConfig,
    value: any,
  ) {
    const updatedActions = [...editActions];
    updatedActions[index] = {
      ...updatedActions[index],
      [field]: value,
    };
    setEditActions(updatedActions);
  }

  function handleRemoveAction(index: number) {
    const updatedActions = [...editActions];
    updatedActions.splice(index, 1);
    setEditActions(updatedActions);
  }

  function handleExportRules() {
    const jsonData = clientRulesService.exportRulesToJson();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `business-rules-${activeCategory}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportRules() {
    const success = clientRulesService.importRulesFromJson(
      importJson,
      "current_user", // In a real app, get from auth context
    );

    if (success) {
      setIsImportDialogOpen(false);
      setImportJson("");
      loadRules();
    }
  }

  function renderClientTypeBadge(clientType: ClientType) {
    const colors: Record<ClientType, string> = {
      [ClientType.FDF]: "bg-blue-100 text-blue-800",
      [ClientType.ADHA]: "bg-green-100 text-green-800",
      [ClientType.CASH]: "bg-yellow-100 text-yellow-800",
      [ClientType.OTHER]: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge key={clientType} className={colors[clientType]}>
        {clientType}
      </Badge>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {t("administration.rules.title", "Business Rules Manager")}
        </CardTitle>
        <CardDescription>
          {t(
            "administration.rules.description",
            "Manage client-specific business rules and policies",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Tabs
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as RuleCategory)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value={RuleCategory.ELIGIBILITY}>
                {t(
                  "administration.rules.categories.eligibility",
                  "Eligibility",
                )}
              </TabsTrigger>
              <TabsTrigger value={RuleCategory.BUDGET}>
                {t("administration.rules.categories.budget", "Budget")}
              </TabsTrigger>
              <TabsTrigger value={RuleCategory.APPROVAL}>
                {t("administration.rules.categories.approval", "Approval")}
              </TabsTrigger>
              <TabsTrigger value={RuleCategory.SCHEDULING}>
                {t("administration.rules.categories.scheduling", "Scheduling")}
              </TabsTrigger>
              <TabsTrigger value={RuleCategory.DOCUMENT}>
                {t("administration.rules.categories.document", "Document")}
              </TabsTrigger>
            </TabsList>

            {/* Content for each tab */}
            {Object.values(RuleCategory).map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4"
              >
                <div className="flex justify-between mb-4">
                  <div className="space-x-2">
                    <Button onClick={handleCreateRule}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("administration.rules.actions.create", "Create Rule")}
                    </Button>
                    <Button variant="outline" onClick={handleExportRules}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("administration.rules.actions.export", "Export")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportDialogOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t("administration.rules.actions.import", "Import")}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>
                        {t("administration.rules.table.name", "Name")}
                      </TableHead>
                      <TableHead>
                        {t(
                          "administration.rules.table.description",
                          "Description",
                        )}
                      </TableHead>
                      <TableHead>
                        {t(
                          "administration.rules.table.clientTypes",
                          "Client Types",
                        )}
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        {t("administration.rules.table.priority", "Priority")}
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        {t("administration.rules.table.actions", "Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          {t(
                            "administration.rules.noRules",
                            "No rules found for this category",
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={rule.isActive}
                                onCheckedChange={() =>
                                  handleToggleRuleActive(rule)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {rule.name}
                          </TableCell>
                          <TableCell>{rule.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {rule.clientTypes.map((clientType) =>
                                renderClientTypeBadge(clientType),
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {rule.priority}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewAudit(rule)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRule(rule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRule(rule)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editForm.id
                ? t("administration.rules.edit.title", "Edit Rule")
                : t("administration.rules.create.title", "Create Rule")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "administration.rules.edit.description",
                "Configure the business rule properties, conditions, and actions.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">
                  {t("administration.rules.form.name", "Rule Name")}
                </Label>
                <Input
                  id="rule-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder={t(
                    "administration.rules.form.namePlaceholder",
                    "Enter rule name",
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-category">
                  {t("administration.rules.form.category", "Category")}
                </Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      category: value as RuleCategory,
                    })
                  }
                >
                  <SelectTrigger id="rule-category">
                    <SelectValue
                      placeholder={t(
                        "administration.rules.form.categoryPlaceholder",
                        "Select category",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RuleCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(
                          `administration.rules.categories.${category}`,
                          category,
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">
                {t("administration.rules.form.description", "Description")}
              </Label>
              <Textarea
                id="rule-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder={t(
                  "administration.rules.form.descriptionPlaceholder",
                  "Enter rule description",
                )}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t("administration.rules.form.clientTypes", "Client Types")}
                </Label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.values(ClientType).map((clientType) => (
                    <div
                      key={clientType}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`client-type-${clientType}`}
                        checked={editForm.clientTypes.includes(clientType)}
                        onCheckedChange={(checked) => {
                          const updatedTypes = checked
                            ? [...editForm.clientTypes, clientType]
                            : editForm.clientTypes.filter(
                                (type) => type !== clientType,
                              );
                          setEditForm({
                            ...editForm,
                            clientTypes: updatedTypes,
                          });
                        }}
                      />
                      <Label htmlFor={`client-type-${clientType}`}>
                        {clientType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-priority">
                  {t("administration.rules.form.priority", "Priority")}
                </Label>
                <Input
                  id="rule-priority"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  {t(
                    "administration.rules.form.priorityHelp",
                    "Higher values have higher priority (1-100).",
                  )}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Conditions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {t("administration.rules.form.conditions", "Conditions")}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("administration.rules.form.addCondition", "Add Condition")}
                </Button>
              </div>

              {editConditions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {t(
                    "administration.rules.form.noConditions",
                    "No conditions defined. Rule will always apply.",
                  )}
                </div>
              ) : (
                editConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center border p-2 rounded-md"
                  >
                    <div className="col-span-3">
                      <Label className="mb-1 block text-xs">
                        {t("administration.rules.form.field", "Field")}
                      </Label>
                      <Input
                        value={condition.field}
                        onChange={(e) =>
                          handleUpdateCondition(index, "field", e.target.value)
                        }
                        placeholder="e.g., beneficiary.age"
                      />
                    </div>

                    <div className="col-span-3">
                      <Label className="mb-1 block text-xs">
                        {t("administration.rules.form.operator", "Operator")}
                      </Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          handleUpdateCondition(index, "operator", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RuleOperator).map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-5">
                      <Label className="mb-1 block text-xs">
                        {t("administration.rules.form.value", "Value")}
                      </Label>
                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          handleUpdateCondition(index, "value", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCondition(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}

              {editConditions.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="condition-logic">
                    {t(
                      "administration.rules.form.conditionLogic",
                      "Condition Logic",
                    )}
                  </Label>
                  <Input
                    id="condition-logic"
                    value={editForm.conditionLogic || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        conditionLogic: e.target.value,
                      })
                    }
                    placeholder="e.g., (1 AND 2) OR 3"
                  />
                  <p className="text-sm text-gray-500">
                    {t(
                      "administration.rules.form.conditionLogicHelp",
                      "Use condition numbers (1, 2, 3...) with AND, OR, NOT operators. Leave empty for AND logic.",
                    )}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Actions Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {t("administration.rules.form.actions", "Actions")}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAction}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("administration.rules.form.addAction", "Add Action")}
                </Button>
              </div>

              {editActions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {t(
                    "administration.rules.form.noActions",
                    "No actions defined. Add at least one action.",
                  )}
                </div>
              ) : (
                editActions.map((action, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-start border p-2 rounded-md"
                  >
                    <div className="col-span-3">
                      <Label className="mb-1 block text-xs">
                        {t(
                          "administration.rules.form.actionType",
                          "Action Type",
                        )}
                      </Label>
                      <Select
                        value={action.type}
                        onValueChange={(value) =>
                          handleUpdateAction(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RuleAction).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Render different fields based on action type */}
                    {(action.type === RuleAction.SET_VALUE ||
                      action.type === RuleAction.CALCULATE) && (
                      <div className="col-span-4">
                        <Label className="mb-1 block text-xs">
                          {t(
                            "administration.rules.form.target",
                            "Target Field",
                          )}
                        </Label>
                        <Input
                          value={action.target || ""}
                          onChange={(e) =>
                            handleUpdateAction(index, "target", e.target.value)
                          }
                          placeholder="e.g., project.budget"
                        />
                      </div>
                    )}

                    {action.type === RuleAction.SET_VALUE && (
                      <div className="col-span-4">
                        <Label className="mb-1 block text-xs">
                          {t("administration.rules.form.value", "Value")}
                        </Label>
                        <Input
                          value={action.value || ""}
                          onChange={(e) =>
                            handleUpdateAction(index, "value", e.target.value)
                          }
                        />
                      </div>
                    )}

                    {action.type === RuleAction.CALCULATE && (
                      <div className="col-span-4">
                        <Label className="mb-1 block text-xs">
                          {t("administration.rules.form.formula", "Formula")}
                        </Label>
                        <Input
                          value={action.formula || ""}
                          onChange={(e) =>
                            handleUpdateAction(index, "formula", e.target.value)
                          }
                          placeholder="e.g., ${project.cost} * 1.05"
                        />
                      </div>
                    )}

                    {(action.type === RuleAction.APPROVE ||
                      action.type === RuleAction.REJECT ||
                      action.type === RuleAction.NOTIFY) && (
                      <div className="col-span-8">
                        <Label className="mb-1 block text-xs">
                          {t("administration.rules.form.message", "Message")}
                        </Label>
                        <Input
                          value={action.message || ""}
                          onChange={(e) =>
                            handleUpdateAction(index, "message", e.target.value)
                          }
                        />
                      </div>
                    )}

                    {action.type === RuleAction.REQUIRE_DOCUMENT && (
                      <div className="col-span-8">
                        <Label className="mb-1 block text-xs">
                          {t(
                            "administration.rules.form.documentTypes",
                            "Document Types (comma-separated)",
                          )}
                        </Label>
                        <Input
                          value={(action.documentTypes || []).join(", ")}
                          onChange={(e) =>
                            handleUpdateAction(
                              index,
                              "documentTypes",
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            )
                          }
                          placeholder="e.g., ID, Proof of Residence"
                        />
                      </div>
                    )}

                    {(action.type === RuleAction.SET_DEADLINE ||
                      action.type === RuleAction.SET_REMINDER) && (
                      <div className="col-span-4">
                        <Label className="mb-1 block text-xs">
                          {t("administration.rules.form.days", "Days")}
                        </Label>
                        <Input
                          type="number"
                          value={action.deadline || ""}
                          onChange={(e) =>
                            handleUpdateAction(
                              index,
                              "deadline",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    )}

                    {action.type === RuleAction.SET_REMINDER && (
                      <div className="col-span-4">
                        <Label className="mb-1 block text-xs">
                          {t(
                            "administration.rules.form.reminderDays",
                            "Reminder Days (comma-separated)",
                          )}
                        </Label>
                        <Input
                          value={(action.reminderDays || []).join(", ")}
                          onChange={(e) =>
                            handleUpdateAction(
                              index,
                              "reminderDays",
                              e.target.value
                                .split(",")
                                .map((s) => parseInt(s.trim()))
                                .filter(Boolean),
                            )
                          }
                          placeholder="e.g., 7, 3, 1"
                        />
                      </div>
                    )}

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAction(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={editActions.length === 0 || !editForm.name}
            >
              {editForm.id
                ? t("common.update", "Update")
                : t("common.create", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("administration.rules.delete.title", "Delete Rule")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "administration.rules.delete.description",
                "Are you sure you want to delete this rule? This action cannot be undone.",
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRule && (
            <div className="py-4">
              <p className="font-medium">{selectedRule.name}</p>
              <p className="text-sm text-gray-500">
                {selectedRule.description}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("administration.rules.audit.title", "Rule Audit Log")}
              {selectedRule && ` - ${selectedRule.name}`}
            </DialogTitle>
            <DialogDescription>
              {t(
                "administration.rules.audit.description",
                "History of changes and evaluations for this rule.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("administration.rules.audit.timestamp", "Timestamp")}
                  </TableHead>
                  <TableHead>
                    {t("administration.rules.audit.action", "Action")}
                  </TableHead>
                  <TableHead>
                    {t("administration.rules.audit.user", "User")}
                  </TableHead>
                  <TableHead>
                    {t("administration.rules.audit.details", "Details")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {t(
                        "administration.rules.audit.noEntries",
                        "No audit entries found for this rule",
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLog.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.timestamp.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.action === "evaluated"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.user}</TableCell>
                      <TableCell>
                        {entry.action === "evaluated" &&
                          entry.evaluationResult && (
                            <span className="flex items-center">
                              {entry.evaluationResult.matched ? (
                                <>
                                  <Check className="h-4 w-4 text-green-500 mr-1" />
                                  {t(
                                    "administration.rules.audit.matched",
                                    "Matched",
                                  )}
                                </>
                              ) : (
                                <>
                                  <X className="h-4 w-4 text-red-500 mr-1" />
                                  {t(
                                    "administration.rules.audit.notMatched",
                                    "Not Matched",
                                  )}
                                </>
                              )}
                            </span>
                          )}
                        {entry.action === "updated" && (
                          <span>
                            {t(
                              "administration.rules.audit.versionUpdate",
                              "Version updated to {{version}}",
                              {
                                version: entry.newVersion?.version,
                              },
                            )}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsAuditDialogOpen(false)}>
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("administration.rules.import.title", "Import Rules")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "administration.rules.import.description",
                "Paste JSON data to import business rules.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={t(
                "administration.rules.import.placeholder",
                "Paste JSON data here...",
              )}
              rows={10}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleImportRules} disabled={!importJson.trim()}>
              {t("administration.rules.import.button", "Import Rules")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClientRulesManager;
