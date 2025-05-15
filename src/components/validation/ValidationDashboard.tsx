import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientType } from "@/lib/forms/types";
import { validationService } from "@/lib/validation/ClientAwareValidationService";
import {
  ValidationRule,
  ValidationRuleType,
  ValidationSeverity,
} from "@/lib/validation/types";
import ValidationRuleEditor from "./ValidationRuleEditor";

// Mock data for forms and fields
const mockForms = [
  { id: "initial-assessment-form", name: "Initial Assessment" },
  { id: "room-assessment-form", name: "Room Assessment" },
  { id: "project-creation-form", name: "Project Creation" },
];

const mockFields = [
  // Initial Assessment Form Fields
  {
    id: "beneficiaryId",
    name: "Beneficiary ID",
    formId: "initial-assessment-form",
  },
  {
    id: "assessmentDate",
    name: "Assessment Date",
    formId: "initial-assessment-form",
  },
  {
    id: "assessmentType",
    name: "Assessment Type",
    formId: "initial-assessment-form",
  },

  // Room Assessment Form Fields
  {
    id: "beneficiaryId",
    name: "Beneficiary ID",
    formId: "room-assessment-form",
  },
  { id: "roomType", name: "Room Type", formId: "room-assessment-form" },
  {
    id: "estimatedCost",
    name: "Estimated Cost",
    formId: "room-assessment-form",
  },

  // Project Creation Form Fields
  {
    id: "beneficiaryId",
    name: "Beneficiary ID",
    formId: "project-creation-form",
  },
  {
    id: "projectDescription",
    name: "Project Description",
    formId: "project-creation-form",
  },
  { id: "totalBudget", name: "Total Budget", formId: "project-creation-form" },
];

const ValidationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filters, setFilters] = useState({
    formId: "",
    ruleType: "",
    clientType: "",
    searchTerm: "",
  });

  // Load validation rules
  useEffect(() => {
    const loadRules = async () => {
      setLoading(true);
      await validationService.loadValidationRules();
      // For demo purposes, we'll use a timeout to simulate API call
      setTimeout(() => {
        const mockRules =
          require("@/lib/validation/mockValidationRules").default;
        setRules(mockRules);
        setLoading(false);
      }, 500);
    };

    loadRules();
  }, []);

  const handleSaveRule = async (rule: ValidationRule) => {
    try {
      const savedRule = await validationService.saveValidationRule(rule);

      // Update the rules list
      setRules((prevRules) => {
        const index = prevRules.findIndex((r) => r.id === savedRule.id);
        if (index >= 0) {
          // Update existing rule
          const updatedRules = [...prevRules];
          updatedRules[index] = savedRule;
          return updatedRules;
        } else {
          // Add new rule
          return [...prevRules, savedRule];
        }
      });

      setIsEditorOpen(false);
      setSelectedRule(null);
    } catch (error) {
      console.error("Failed to save rule:", error);
      alert("Failed to save validation rule");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        await validationService.deleteValidationRule(ruleId);
        setRules((prevRules) => prevRules.filter((rule) => rule.id !== ruleId));
      } catch (error) {
        console.error("Failed to delete rule:", error);
        alert("Failed to delete validation rule");
      }
    }
  };

  const handleEditRule = (rule: ValidationRule) => {
    setSelectedRule(rule);
    setIsEditorOpen(true);
  };

  const handleAddNewRule = () => {
    setSelectedRule(null);
    setIsEditorOpen(true);
  };

  const filteredRules = rules.filter((rule) => {
    // Apply filters
    if (filters.formId && rule.formId !== filters.formId) return false;
    if (filters.ruleType && rule.type !== filters.ruleType) return false;
    if (
      filters.clientType &&
      !rule.clientTypes.includes(filters.clientType as ClientType)
    )
      return false;
    if (
      filters.searchTerm &&
      !rule.message.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !rule.fieldId.toLowerCase().includes(filters.searchTerm.toLowerCase())
    )
      return false;

    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Validation Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="editor">Rule Editor</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Validation Rules</CardTitle>
                <Button onClick={handleAddNewRule}>Add New Rule</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="formFilter">Filter by Form</Label>
                  <Select
                    value={filters.formId}
                    onValueChange={(value) =>
                      setFilters({ ...filters, formId: value })
                    }
                  >
                    <SelectTrigger id="formFilter">
                      <SelectValue placeholder="All Forms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Forms</SelectItem>
                      {mockForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="typeFilter">Filter by Rule Type</Label>
                  <Select
                    value={filters.ruleType}
                    onValueChange={(value) =>
                      setFilters({ ...filters, ruleType: value })
                    }
                  >
                    <SelectTrigger id="typeFilter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {Object.values(ValidationRuleType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientFilter">Filter by Client Type</Label>
                  <Select
                    value={filters.clientType}
                    onValueChange={(value) =>
                      setFilters({ ...filters, clientType: value })
                    }
                  >
                    <SelectTrigger id="clientFilter">
                      <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Clients</SelectItem>
                      {Object.values(ClientType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="searchFilter">Search</Label>
                  <Input
                    id="searchFilter"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    placeholder="Search by field or message"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  Loading validation rules...
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rule Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRules.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No validation rules found
                          </td>
                        </tr>
                      ) : (
                        filteredRules.map((rule) => {
                          const form = mockForms.find(
                            (f) => f.id === rule.formId,
                          );
                          const field = mockFields.find(
                            (f) =>
                              f.formId === rule.formId && f.id === rule.fieldId,
                          );

                          return (
                            <tr key={rule.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {form?.name || rule.formId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {field?.name || rule.fieldId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {rule.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    rule.severity === ValidationSeverity.ERROR
                                      ? "bg-red-100 text-red-800"
                                      : rule.severity ===
                                          ValidationSeverity.WARNING
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {rule.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rule.message}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRule(rule)}
                                  className="mr-2"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <ValidationRuleEditor
                initialRule={selectedRule || undefined}
                onSave={handleSaveRule}
                availableForms={mockForms}
                availableFields={mockFields}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Deployment Management</h2>
                <p>
                  This section allows you to deploy validation rules to
                  different environments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-2">Development</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Test your validation rules in the development
                        environment
                      </p>
                      <div className="flex justify-end">
                        <Button>Deploy to Dev</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-2">Staging</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Validate your rules in a production-like environment
                      </p>
                      <div className="flex justify-end">
                        <Button variant="secondary">Deploy to Staging</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-2">Production</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Deploy validated rules to the production environment
                      </p>
                      <div className="flex justify-end">
                        <Button variant="default">Deploy to Production</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <ValidationRuleEditor
              initialRule={selectedRule || undefined}
              onSave={handleSaveRule}
              onCancel={() => setIsEditorOpen(false)}
              availableForms={mockForms}
              availableFields={mockFields}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationDashboard;
