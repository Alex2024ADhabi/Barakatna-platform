import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientType } from "@/lib/forms/types";
import { validationService } from "@/lib/validation/ClientAwareValidationService";
import {
  ValidationRule,
  ValidationRuleType,
  ValidationSeverity,
} from "@/lib/validation/types";

interface ValidationRuleEditorProps {
  initialRule?: ValidationRule;
  onSave?: (rule: ValidationRule) => void;
  onCancel?: () => void;
  availableForms: { id: string; name: string }[];
  availableFields: { id: string; name: string; formId: string }[];
}

const defaultRule: Partial<ValidationRule> = {
  type: ValidationRuleType.REQUIRED,
  severity: ValidationSeverity.ERROR,
  message: "",
  clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
  isActive: true,
  createdBy: "current-user",
  updatedBy: "current-user",
};

const ValidationRuleEditor: React.FC<ValidationRuleEditorProps> = ({
  initialRule,
  onSave,
  onCancel,
  availableForms,
  availableFields,
}) => {
  const [rule, setRule] = useState<Partial<ValidationRule>>(
    initialRule || { ...defaultRule },
  );
  const [activeTab, setActiveTab] = useState("basic");
  const [formFields, setFormFields] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [testData, setTestData] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // Update available fields when form changes
  useEffect(() => {
    if (rule.formId) {
      const fieldsForForm = availableFields.filter(
        (field) => field.formId === rule.formId,
      );
      setFormFields(fieldsForForm);
    } else {
      setFormFields([]);
    }
  }, [rule.formId, availableFields]);

  const handleFormChange = (formId: string) => {
    setRule({ ...rule, formId, fieldId: undefined });
  };

  const handleFieldChange = (fieldId: string) => {
    setRule({ ...rule, fieldId });
  };

  const handleClientTypeToggle = (clientType: ClientType) => {
    const currentTypes = rule.clientTypes || [];
    if (currentTypes.includes(clientType)) {
      setRule({
        ...rule,
        clientTypes: currentTypes.filter((type) => type !== clientType),
      });
    } else {
      setRule({
        ...rule,
        clientTypes: [...currentTypes, clientType],
      });
    }
  };

  const handleRuleTypeChange = (type: ValidationRuleType) => {
    // Reset params when changing rule type
    setRule({ ...rule, type, params: {} });
  };

  const handleParamChange = (paramName: string, value: any) => {
    setRule({
      ...rule,
      params: { ...(rule.params || {}), [paramName]: value },
    });
  };

  const handleSave = () => {
    if (!rule.formId || !rule.fieldId || !rule.message) {
      alert("Please fill in all required fields");
      return;
    }

    const completeRule: ValidationRule = {
      id: rule.id || `rule_${Date.now()}`,
      formId: rule.formId,
      fieldId: rule.fieldId,
      type: rule.type || ValidationRuleType.REQUIRED,
      severity: rule.severity || ValidationSeverity.ERROR,
      message: rule.message,
      clientTypes: rule.clientTypes || [ClientType.FDF],
      params: rule.params,
      customValidationFn: rule.customValidationFn,
      dependentField: rule.dependentField,
      dependentCondition: rule.dependentCondition,
      isActive: rule.isActive !== undefined ? rule.isActive : true,
      createdAt: rule.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: rule.createdBy || "current-user",
      updatedBy: "current-user",
      version: rule.version || 1,
    };

    if (onSave) {
      onSave(completeRule);
    }
  };

  const handleTestRule = () => {
    if (!rule.formId || !rule.fieldId) {
      alert("Please select a form and field first");
      return;
    }

    // Create a temporary complete rule for testing
    const testRule: ValidationRule = {
      id: rule.id || "test_rule",
      formId: rule.formId,
      fieldId: rule.fieldId,
      type: rule.type || ValidationRuleType.REQUIRED,
      severity: rule.severity || ValidationSeverity.ERROR,
      message: rule.message || "Validation failed",
      clientTypes: rule.clientTypes || [ClientType.FDF],
      params: rule.params,
      customValidationFn: rule.customValidationFn,
      dependentField: rule.dependentField,
      dependentCondition: rule.dependentCondition,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "test-user",
      updatedBy: "test-user",
      version: 1,
    };

    const result = validationService.testValidationRule(
      testRule,
      testData,
      ClientType.FDF, // Default to FDF for testing
    );

    setTestResult(result);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {initialRule ? "Edit Validation Rule" : "Create Validation Rule"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            <TabsTrigger value="test">Test Rule</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="formId">Form</Label>
                <Select value={rule.formId} onValueChange={handleFormChange}>
                  <SelectTrigger id="formId">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fieldId">Field</Label>
                <Select
                  value={rule.fieldId}
                  onValueChange={handleFieldChange}
                  disabled={!rule.formId}
                >
                  <SelectTrigger id="fieldId">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {formFields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ruleType">Rule Type</Label>
                <Select
                  value={rule.type}
                  onValueChange={(value) =>
                    handleRuleTypeChange(value as ValidationRuleType)
                  }
                >
                  <SelectTrigger id="ruleType">
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ValidationRuleType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={rule.severity}
                  onValueChange={(value) =>
                    setRule({ ...rule, severity: value as ValidationSeverity })
                  }
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ValidationSeverity).map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Error Message</Label>
                <Input
                  id="message"
                  value={rule.message || ""}
                  onChange={(e) =>
                    setRule({ ...rule, message: e.target.value })
                  }
                  placeholder="Enter error message"
                />
              </div>

              <div>
                <Label className="mb-2 block">Client Types</Label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(ClientType).map((clientType) => (
                    <div
                      key={clientType}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        id={`client-${clientType}`}
                        checked={
                          rule.clientTypes?.includes(clientType) || false
                        }
                        onCheckedChange={() =>
                          handleClientTypeToggle(clientType)
                        }
                      />
                      <Label htmlFor={`client-${clientType}`}>
                        {clientType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={rule.isActive}
                  onCheckedChange={(checked) =>
                    setRule({ ...rule, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 pt-4">
            {/* Advanced settings based on rule type */}
            {rule.type === ValidationRuleType.CUSTOM && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customFn">Custom Validation Function</Label>
                  <Textarea
                    id="customFn"
                    value={rule.customValidationFn || ""}
                    onChange={(e) =>
                      setRule({ ...rule, customValidationFn: e.target.value })
                    }
                    placeholder="return value !== undefined && value !== null;"
                    className="h-32 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Function parameters: value, formData, context
                  </p>
                </div>
              </div>
            )}

            {rule.type === ValidationRuleType.PATTERN && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pattern">Regex Pattern</Label>
                  <Input
                    id="pattern"
                    value={rule.params?.pattern || ""}
                    onChange={(e) =>
                      handleParamChange("pattern", e.target.value)
                    }
                    placeholder="e.g. ^[A-Za-z0-9]+$"
                  />
                </div>
              </div>
            )}

            {(rule.type === ValidationRuleType.MIN_LENGTH ||
              rule.type === ValidationRuleType.MAX_LENGTH) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="length">
                    {rule.type === ValidationRuleType.MIN_LENGTH
                      ? "Minimum"
                      : "Maximum"}{" "}
                    Length
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    value={
                      rule.params?.[
                        rule.type === ValidationRuleType.MIN_LENGTH
                          ? "minLength"
                          : "maxLength"
                      ] || ""
                    }
                    onChange={(e) =>
                      handleParamChange(
                        rule.type === ValidationRuleType.MIN_LENGTH
                          ? "minLength"
                          : "maxLength",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
            )}

            {(rule.type === ValidationRuleType.MIN_VALUE ||
              rule.type === ValidationRuleType.MAX_VALUE) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="value">
                    {rule.type === ValidationRuleType.MIN_VALUE
                      ? "Minimum"
                      : "Maximum"}{" "}
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={
                      rule.params?.[
                        rule.type === ValidationRuleType.MIN_VALUE
                          ? "minValue"
                          : "maxValue"
                      ] || ""
                    }
                    onChange={(e) =>
                      handleParamChange(
                        rule.type === ValidationRuleType.MIN_VALUE
                          ? "minValue"
                          : "maxValue",
                        parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="testData">Test Data (JSON)</Label>
                <Textarea
                  id="testData"
                  className="h-32 font-mono text-sm"
                  value={JSON.stringify(testData, null, 2)}
                  onChange={(e) => {
                    try {
                      setTestData(JSON.parse(e.target.value));
                    } catch (error) {
                      // Allow invalid JSON during editing
                    }
                  }}
                  placeholder='{"fieldName": "value"}'
                />
              </div>

              <Button onClick={handleTestRule}>Test Rule</Button>

              {testResult && (
                <div
                  className={`p-4 mt-4 rounded-md ${testResult.isValid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  <p className="font-medium">
                    {testResult.isValid
                      ? "✓ Validation Passed"
                      : "✗ Validation Failed"}
                  </p>
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>Save Rule</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationRuleEditor;
