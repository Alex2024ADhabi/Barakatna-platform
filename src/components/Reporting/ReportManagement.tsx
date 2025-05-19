import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
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
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import { ReportGenerator, ReportTemplateEditor } from "./index";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  module: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const mockReportTemplates: ReportTemplate[] = [
  {
    id: "RT001",
    name: "Beneficiary Assessment Summary",
    description: "Summary report of beneficiary assessments",
    module: "assessment",
    createdAt: "2023-10-15",
    updatedAt: "2023-11-20",
    isActive: true,
  },
  {
    id: "RT002",
    name: "Monthly Project Status",
    description: "Monthly status report for all active projects",
    module: "project",
    createdAt: "2023-09-05",
    updatedAt: "2023-11-15",
    isActive: true,
  },
  {
    id: "RT003",
    name: "Committee Decision Summary",
    description: "Summary of committee decisions and approvals",
    module: "committee",
    createdAt: "2023-08-20",
    updatedAt: "2023-10-30",
    isActive: true,
  },
  {
    id: "RT004",
    name: "Financial Expenditure Report",
    description: "Detailed breakdown of financial expenditures",
    module: "financial",
    createdAt: "2023-07-12",
    updatedAt: "2023-11-05",
    isActive: true,
  },
  {
    id: "RT005",
    name: "Procurement Status Report",
    description: "Status of all procurement activities",
    module: "procurement",
    createdAt: "2023-06-30",
    updatedAt: "2023-10-25",
    isActive: false,
  },
];

const ReportManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [templates, setTemplates] =
    useState<ReportTemplate[]>(mockReportTemplates);
  const [filteredTemplates, setFilteredTemplates] =
    useState<ReportTemplate[]>(mockReportTemplates);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    // Filter templates based on search query and module filter
    let filtered = templates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query),
      );
    }

    if (moduleFilter !== "all") {
      filtered = filtered.filter(
        (template) => template.module === moduleFilter,
      );
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, moduleFilter, templates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleModuleFilterChange = (value: string) => {
    setModuleFilter(value);
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setActiveTab("editor");
  };

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsGenerating(true);
    setActiveTab("generator");
  };

  const handleDeleteTemplate = (templateId: string) => {
    // In a real application, this would call an API to delete the template
    setTemplates(templates.filter((template) => template.id !== templateId));
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setActiveTab("editor");
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setIsGenerating(false);
    setActiveTab("templates");
  };

  const getModuleDisplayName = (moduleKey: string) => {
    const moduleNames: Record<string, string> = {
      assessment: "Assessment",
      project: "Project",
      committee: "Committee",
      financial: "Financial",
      procurement: "Procurement",
      beneficiary: "Beneficiary",
      program: "Program",
    };

    return (
      moduleNames[moduleKey] ||
      moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Report Management</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="editor" disabled={!isEditing}>
            Template Editor
          </TabsTrigger>
          <TabsTrigger value="generator" disabled={!isGenerating}>
            Report Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 w-full md:w-1/3">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-1/3">
              <Select
                value={moduleFilter}
                onValueChange={handleModuleFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="beneficiary">Beneficiary</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end w-full md:w-1/3">
              <Button onClick={handleCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" /> Create Template
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Manage report templates for different modules in the Barakatna
                platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No templates found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">
                              {template.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getModuleDisplayName(template.module)}
                        </TableCell>
                        <TableCell>{template.updatedAt}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {template.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGenerateReport(template)}
                              title="Generate Report"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit Template"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Delete Template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToTemplates}>
              Back to Templates
            </Button>
          </div>
          <ReportTemplateEditor
            template={selectedTemplate}
            onSave={() => {
              // In a real application, this would save the template
              handleBackToTemplates();
            }}
          />
        </TabsContent>

        <TabsContent value="generator">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToTemplates}>
              Back to Templates
            </Button>
          </div>
          {selectedTemplate && (
            <ReportGenerator
              templateId={selectedTemplate.id}
              templateName={selectedTemplate.name}
              module={selectedTemplate.module}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportManagement;
