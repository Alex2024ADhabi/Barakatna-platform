import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { ReportTemplate } from "@/services/reporting/ReportTemplate";
import { ReportSection, ReportDataSource } from "@/services/reporting/ReportTypes";
import { Plus, Trash2, MoveVertical, Edit, Eye, Code, PaintBucket, LayoutGrid } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ReportTemplateEditorProps {
  template?: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  onPreview?: (template: ReportTemplate) => void;
}

export default function ReportTemplateEditor({
  template: initialTemplate,
  onSave,
  onPreview,
}: ReportTemplateEditorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [previewLanguage, setPreviewLanguage] = useState("en");
  
  // Template state
  const [template, setTemplate] = useState<ReportTemplate>(
    initialTemplate ||
      new ReportTemplate({
        id: uuidv4(),
        name: "",
        description: "",
        sections: [],
        dataSources: [],
      })
  );
  
  // Section editing state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<ReportSection | null>(null);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  
  // Data source editing state
  const [editingDataSourceId, setEditingDataSourceId] = useState<string | null>(null);
  const [editingDataSourceData, setEditingDataSourceData] = useState<Partial<ReportDataSource> | null>(null);
  const [isDataSourceDialogOpen, setIsDataSourceDialogOpen] = useState(false);
  
  // Conditional logic state
  const [conditionCode, setConditionCode] = useState("");
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  
  // Styling state
  const [isStylingDialogOpen, setIsStylingDialogOpen] = useState(false);
  const [currentStyles, setCurrentStyles] = useState<Record<string, string>>({}); 
  
  // Handle template basic info changes
  const handleTemplateChange = (field: keyof ReportTemplate, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle section reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(template.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTemplate((prev) => ({
      ...prev,
      sections: items,
    }));
  };
  
  // Add a new section
  const handleAddSection = () => {
    const newSection: ReportSection = {
      id: uuidv4(),
      type: "text",
      title: "New Section",
      content: "",
    };
    
    setEditingSectionData(newSection);
    setEditingSectionId(null); // null indicates a new section
    setIsSectionDialogOpen(true);
  };
  
  // Edit an existing section
  const handleEditSection = (sectionId: string) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (section) {
      setEditingSectionData({ ...section });
      setEditingSectionId(sectionId);
      setIsSectionDialogOpen(true);
    }
  };
  
  // Delete a section
  const handleDeleteSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };
  
  // Save section changes
  const handleSaveSection = () => {
    if (!editingSectionData) return;
    
    if (editingSectionId) {
      // Update existing section
      setTemplate((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === editingSectionId ? editingSectionData : s
        ),
      }));
    } else {
      // Add new section
      setTemplate((prev) => ({
        ...prev,
        sections: [...prev.sections, editingSectionData],
      }));
    }
    
    setIsSectionDialogOpen(false);
    setEditingSectionData(null);
    setEditingSectionId(null);
  };
  
  // Handle section field changes
  const handleSectionChange = (field: keyof ReportSection, value: any) => {
    if (!editingSectionData) return;
    
    setEditingSectionData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };
  
  // Add a new data source
  const handleAddDataSource = () => {
    const newDataSource: Partial<ReportDataSource> = {
      id: uuidv4(),
      name: "New Data Source",
      type: "api",
      config: {},
    };
    
    setEditingDataSourceData(newDataSource);
    setEditingDataSourceId(null); // null indicates a new data source
    setIsDataSourceDialogOpen(true);
  };
  
  // Edit an existing data source
  const handleEditDataSource = (dataSourceId: string) => {
    const dataSource = template.dataSources.find((ds) => ds.id === dataSourceId);
    if (dataSource) {
      setEditingDataSourceData({ ...dataSource });
      setEditingDataSourceId(dataSourceId);
      setIsDataSourceDialogOpen(true);
    }
  };
  
  // Delete a data source
  const handleDeleteDataSource = (dataSourceId: string) => {
    setTemplate((prev) => ({
      ...prev,
      dataSources: prev.dataSources.filter((ds) => ds.id !== dataSourceId),
    }));
  };
  
  // Save data source changes
  const handleSaveDataSource = () => {
    if (!editingDataSourceData) return;
    
    // Create a mock fetchData function for the data source
    const mockFetchData = async () => {
      return { message: "This is a mock data source for template editing" };
    };
    
    const completeDataSource: ReportDataSource = {
      ...(editingDataSourceData as any),
      fetchData: mockFetchData,
    };
    
    if (editingDataSourceId) {
      // Update existing data source
      setTemplate((prev) => ({
        ...prev,
        dataSources: prev.dataSources.map((ds) =>
          ds.id === editingDataSourceId ? completeDataSource : ds
        ),
      }));
    } else {
      // Add new data source
      setTemplate((prev) => ({
        ...prev,
        dataSources: [...prev.dataSources, completeDataSource],
      }));
    }
    
    setIsDataSourceDialogOpen(false);
    setEditingDataSourceData(null);
    setEditingDataSourceId(null);
  };
  
  // Handle data source field changes
  const handleDataSourceChange = (field: string, value: any) => {
    if (!editingDataSourceData) return;
    
    setEditingDataSourceData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };
  
  // Open condition editor for a section
  const handleEditCondition = (sectionId: string) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setConditionCode(section.condition || "");
      setIsConditionDialogOpen(true);
    }
  };
  
  // Save condition changes
  const handleSaveCondition = () => {
    if (!editingSectionId) return;
    
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === editingSectionId
          ? { ...s, condition: conditionCode || undefined }
          : s
      ),
    }));
    
    setIsConditionDialogOpen(false);
    setEditingSectionId(null);
    setConditionCode("");
  };
  
  // Open styling editor for a section
  const handleEditStyling = (sectionId: string) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setCurrentStyles(section.style || {});
      setIsStylingDialogOpen(true);
    }
  };
  
  // Save styling changes
  const handleSaveStyling = () => {
    if (!editingSectionId) return;
    
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === editingSectionId
          ? { ...s, style: Object.keys(currentStyles).length > 0 ? currentStyles : undefined }
          : s
      ),
    }));
    
    setIsStylingDialogOpen(false);
    setEditingSectionId(null);
    setCurrentStyles({});
  };
  
  // Handle style property change
  const handleStyleChange = (property: string, value: string) => {
    setCurrentStyles((prev) => ({
      ...prev,
      [property]: value,
    }));
  };
  
  // Handle style property deletion
  const handleDeleteStyle = (property: string) => {
    setCurrentStyles((prev) => {
      const newStyles = { ...prev };
      delete newStyles[property];
      return newStyles;
    });
  };
  
  // Add a new style property
  const handleAddStyle = (property: string, value: string) => {
    if (!property || !value) return;
    
    setCurrentStyles((prev) => ({
      ...prev,
      [property]: value,
    }));
  };
  
  // Preview the template
  const handlePreview = () => {
    if (onPreview) {
      onPreview(template);
    }
  };
  
  // Save the template
  const handleSaveTemplate = () => {
    onSave(template);
  };

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <CardTitle>
            {initialTemplate
              ? t("reporting.templateEditor.editTitle", "Edit Report Template")
              : t("reporting.templateEditor.createTitle", "Create Report Template")}
          </CardTitle>
          <CardDescription>
            {t(
              "reporting.templateEditor.description",
              "Design and customize report templates with sections, data sources, and styling",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                {t("reporting.templateEditor.general", "General")}
              </TabsTrigger>
              <TabsTrigger value="sections">
                {t("reporting.templateEditor.sections", "Sections")}
              </TabsTrigger>
              <TabsTrigger value="dataSources">
                {t("reporting.templateEditor.dataSources", "Data Sources")}
              </TabsTrigger>
              <TabsTrigger value="preview">
                {t("reporting.templateEditor.preview", "Preview")}
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.templateName", "Template Name")}
                  </label>
                  <Input
                    value={template.name}
                    onChange={(e) => handleTemplateChange("name", e.target.value)}
                    placeholder={t(
                      "reporting.templateEditor.templateNamePlaceholder",
                      "Enter template name",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.templateDescription", "Description")}
                  </label>
                  <Textarea
                    value={template.description}
                    onChange={(e) =>
                      handleTemplateChange("description", e.target.value)
                    }
                    placeholder={t(
                      "reporting.templateEditor.templateDescriptionPlaceholder",
                      "Enter template description",
                    )}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.supportedLanguages", "Supported Languages")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {template.supportedLanguages.map((lang) => (
                      <div
                        key={lang}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
                      >
                        {lang}
                        <button
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            handleTemplateChange(
                              "supportedLanguages",
                              template.supportedLanguages.filter((l) => l !== lang),
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const lang = prompt("Enter language code (e.g., en, ar)");
                        if (lang && !template.supportedLanguages.includes(lang)) {
                          handleTemplateChange("supportedLanguages", [
                            ...template.supportedLanguages,
                            lang,
                          ]);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t("reporting.templateEditor.addLanguage", "Add Language")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.defaultLanguage", "Default Language")}
                  </label>
                  <Select
                    value={template.defaultLanguage}
                    onValueChange={(value) =>
                      handleTemplateChange("defaultLanguage", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {template.supportedLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="space-y-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {t("reporting.templateEditor.reportSections", "Report Sections")}
                </h3>
                <Button onClick={handleAddSection}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("reporting.templateEditor.addSection", "Add Section")}
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {template.sections.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <p className="text-gray-500">
                            {t(
                              "reporting.templateEditor.noSections",
                              "No sections added yet. Click 'Add Section' to create your first section.",
                            )}
                          </p>
                        </div>
                      ) : (
                        template.sections.map((section, index) => (
                          <Draggable
                            key={section.id}
                            draggableId={section.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-md p-3 bg-white"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 cursor-move"
                                    >
                                      <MoveVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{section.title}</h4>
                                      <p className="text-sm text-gray-500">
                                        {t(`reporting.templateEditor.sectionType.${section.type}`, section.type)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditStyling(section.id)}
                                    >
                                      <PaintBucket className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCondition(section.id)}
                                    >
                                      <Code className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditSection(section.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSection(section.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                                {section.condition && (
                                  <div className="mt-2 text-xs bg-yellow-50 p-2 rounded">
                                    <span className="font-medium">Condition:</span> {section.condition}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>

            {/* Data Sources Tab */}
            <TabsContent value="dataSources" className="space-y-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {t("reporting.templateEditor.dataSources", "Data Sources")}
                </h3>
                <Button onClick={handleAddDataSource}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("reporting.templateEditor.addDataSource", "Add Data Source")}
                </Button>
              </div>

              {template.dataSources.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-gray-500">
                    {t(
                      "reporting.templateEditor.noDataSources",
                      "No data sources added yet. Click 'Add Data Source' to create your first data source.",
                    )}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("reporting.templateEditor.dataSourceName", "Name")}
                      </TableHead>
                      <TableHead>
                        {t("reporting.templateEditor.dataSourceType", "Type")}
                      </TableHead>
                      <TableHead>
                        {t("reporting.templateEditor.dataSourceId", "ID")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("reporting.templateEditor.actions", "Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {template.dataSources.map((dataSource) => (
                      <TableRow key={dataSource.id}>
                        <TableCell className="font-medium">
                          {dataSource.name}
                        </TableCell>
                        <TableCell>{dataSource.type}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {dataSource.id}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDataSource(dataSource.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDataSource(dataSource.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {t("reporting.templateEditor.templatePreview", "Template Preview")}
                </h3>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">
                    {t("reporting.templateEditor.previewLanguage", "Language")}:
                  </label>
                  <Select
                    value={previewLanguage}
                    onValueChange={setPreviewLanguage}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {template.supportedLanguages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-1" />
                    {t("reporting.templateEditor.preview", "Preview")}
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4 min-h-[400px] bg-gray-50">
                <div className="text-center p-8">
                  <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t(
                      "reporting.templateEditor.previewDescription",
                      "Click the Preview button to generate a preview of your report template.",
                    )}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSaveTemplate}>
            {t("common.save", "Save Template")}
          </Button>
        </CardFooter>
      </Card>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSectionId
                ? t("reporting.templateEditor.editSection", "Edit Section")
                : t("reporting.templateEditor.addSection", "Add Section")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "reporting.templateEditor.sectionDescription",
                "Configure the section properties and content.",
              )}
            </DialogDescription>
          </DialogHeader>

          {editingSectionData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("reporting.templateEditor.sectionTitle", "Section Title")}
                </label>
                <Input
                  value={editingSectionData.title as string}
                  onChange={(e) => handleSectionChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("reporting.templateEditor.sectionType", "Section Type")}
                </label>
                <Select
                  value={editingSectionData.type}
                  onValueChange={(value) => handleSectionChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      {t("reporting.templateEditor.sectionType.text", "Text")}
                    </SelectItem>
                    <SelectItem value="table">
                      {t("reporting.templateEditor.sectionType.table", "Table")}
                    </SelectItem>
                    <SelectItem value="chart">
                      {t("reporting.templateEditor.sectionType.chart", "Chart")}
                    </SelectItem>
                    <SelectItem value="metrics">
                      {t("reporting.templateEditor.sectionType.metrics", "Metrics")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingSectionData.type === "text" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.content", "Content")}
                  </label>
                  <Textarea
                    value={editingSectionData.content as string || ""}
                    onChange={(e) => handleSectionChange("content", e.target.value)}
                    rows={5}
                    placeholder={t(
                      "reporting.templateEditor.contentPlaceholder",
                      "Enter section content. You can use {{variable}} syntax to include dynamic data.",
                    )}
                  />
                </div>
              )}

              {(editingSectionData.type === "table" ||
                editingSectionData.type === "chart" ||
                editingSectionData.type === "metrics") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.dataSource", "Data Source")}
                  </label>
                  <Select
                    value={editingSectionData.dataSource || ""}
                    onValueChange={(value) => handleSectionChange("dataSource", value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "reporting.templateEditor.selectDataSource",
                          "Select a data source",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {template.dataSources.map((ds) => (
                        <SelectItem key={ds.id} value={ds.id}>
                          {ds.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingSectionData.type === "chart" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reporting.templateEditor.chartType", "Chart Type")}
                  </label>
                  <Select
                    value={editingSectionData.chartType || "bar"}
                    onValueChange={(value) =>
                      handleSectionChange("chartType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">
                        {t("reporting.templateEditor.chartType.bar", "Bar Chart")}
                      </SelectItem>
                      <SelectItem value="line">
                        {t("reporting.templateEditor.chartType.line", "Line Chart")}
                      </SelectItem>
                      <SelectItem value="pie">
                        {t("reporting.templateEditor.chartType.pie", "Pie Chart")}
                      </SelectItem>
                      <SelectItem value="scatter">
                        {t(
                          "reporting.templateEditor.chartType.scatter",
                          "Scatter Plot",
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSaveSection}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Source Dialog */}
      <Dialog
        open={isDataSourceDialogOpen}
        onOpenChange={setIsDataSourceDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingDataSourceId
                ? t("reporting.templateEditor.editDataSource", "Edit Data Source")
                : t("reporting.templateEditor.addDataSource", "Add Data Source")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "reporting.templateEditor.dataSourceDescription",
                "Configure the data source properties.",
              )}
            </DialogDescription>
          </DialogHeader>

          {editingDataSourceData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("reporting.templateEditor.dataSourceName", "Name")}
                </label>
                <Input
                  value={editingDataSourceData.name || ""}
                  onChange={(e) => handleDataSourceChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("reporting.templateEditor.dataSourceType", "Type")}
                </label>
                <Select
                  value={editingDataSourceData.type || "api"}
                  onValueChange={(value) => handleDataSourceChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">
                      {t("reporting.templateEditor.dataSourceType.api", "API")}
                    </SelectItem>
                    <SelectItem value="database">
                      {t(
                        "reporting.templateEditor.dataSourceType.database",
                        "Database",
                      )}
                    </SelectItem>
                    <SelectItem value="static">
                      {t(
                        "reporting.templateEditor.dataSourceType.static",
                        "Static Data",
                      )}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("reporting.templateEditor.dataSourceConfig", "Configuration")}
                </label>
                <Textarea
                  value={
                    editingDataSourceData.config
                      ? JSON.stringify(editingDataSourceData.config, null, 2)
                      : "{}"
                  }
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      handleDataSourceChange("config", config);
                    } catch (error) {
                      // Allow invalid JSON during editing
                    }
                  }}
                  rows={5}
                  placeholder={t(
                    "reporting.templateEditor.configPlaceholder",
                    "Enter configuration as JSON",
                  )}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDataSourceDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSaveDataSource}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Condition Dialog */}
      <Dialog
        open={isConditionDialogOpen}
        onOpenChange={setIsConditionDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {t("reporting.templateEditor.editCondition", "Edit Condition")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "reporting.templateEditor.conditionDescription",
                "Define a condition for when this section should be displayed. Use JavaScript expressions that evaluate to true or false.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              value={conditionCode}
              onChange={(e) => setConditionCode(e.target.value)}
              rows={5}
              placeholder="data.someValue > 100 || data.status === 'completed'"
              className="font-mono text-sm"
            />

            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">
                {t("reporting.templateEditor.examples", "Examples")}:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code>data.metrics.totalAmount > 1000</code> -{" "}
                  {t(
                    "reporting.templateEditor.exampleCondition1",
                    "Show when total amount exceeds 1000",
                  )}
                </li>
                <li>
                  <code>data.user.role === 'admin'</code> -{" "}
                  {t(
                    "reporting.templateEditor.exampleCondition2",
                    "Show only for admin users",
                  )}
                </li>
                <li>
                  <code>data.items && data.items.length > 0</code> -{" "}
                  {t(
                    "reporting.templateEditor.exampleCondition3",
                    "Show only when items exist",
                  )}
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConditionDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSaveCondition}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Styling Dialog */}
      <Dialog open={isStylingDialogOpen} onOpenChange={setIsStylingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {t("reporting.templateEditor.editStyling", "Edit Styling")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "reporting.templateEditor.stylingDescription",
                "Customize the appearance of this section with CSS properties.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("reporting.templateEditor.property", "Property")}
                    </TableHead>
                    <TableHead>
                      {t("reporting.templateEditor.value", "Value")}
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(currentStyles).map(([property, value]) => (
                    <TableRow key={property}>
                      <TableCell>
                        <Input
                          value={property}
                          onChange={(e) => {
                            const newStyles = { ...currentStyles };
                            delete newStyles[property];
                            newStyles[e.target.value] = value;
                            setCurrentStyles(newStyles);
                          }}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleStyleChange(property, e.target.value)
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStyle(property)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder={t(
                  "reporting.templateEditor.propertyPlaceholder",
                  "Property (e.g., color)",
                )}
                id="new-property"
              />
              <Input
                placeholder={t(
                  "reporting.templateEditor.valuePlaceholder",
                  "Value (e.g., #ff0000)",
                )}
                id="new-value"
              />
              <Button
                onClick={() => {
                  const property = (
                    document.getElementById("new-property") as HTMLInputElement
                  ).value;
                  const value = (
                    document.getElementById("new-value") as HTMLInputElement
                  ).value;
                  if (property && value) {
                    handleAddStyle(property, value);
                    (document.getElementById("new-property") as HTMLInputElement).value =
                      "";
                    (document.getElementById("new-value") as HTMLInputElement).value =
                      "";
                  }
                }}
              >
                {t("reporting.templateEditor.add", "Add")}
              </Button>
            </div>

            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">
                {t("reporting.templateEditor.commonProperties", "Common Properties")}:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <code>color</code>: #333333, red, etc.
                </div>
                <div>
                  <code>background-color</code>: #f5f5f5, white, etc.
                </div>
                <div>
                  <code>font-size</code>: 16px, 1.2rem, etc.
                </div>
                <div>
                  <code>font-weight</code>: bold, 600, etc.
                </div>
                <div>
                  <code>padding</code>: 10px, 1rem, etc.
                </div>
                <div>
                  <code>margin</code>: 10px, 1rem, etc.
                </div>
                <div>
                  <code>border</code>: 1px solid #ddd
                </div>
                <div>
                  <code>text-align</code>: left, center, right
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStylingDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSaveStyling}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
