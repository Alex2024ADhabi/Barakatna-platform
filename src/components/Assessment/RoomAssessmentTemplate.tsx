import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Download, Upload, Plus, Trash2 } from "lucide-react";

interface MeasurementType {
  id: string;
  name: string;
  unit: string;
  standard: number;
  required: boolean;
}

interface RecommendationType {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedCost: number;
}

interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  clientType: string;
  measurementTypes: MeasurementType[];
  recommendationTypes: RecommendationType[];
}

interface RoomAssessmentTemplateProps {
  templates?: RoomTemplate[];
  onSaveTemplate?: (template: RoomTemplate) => void;
  onLoadTemplate?: (templateId: string) => void;
  clientType?: string;
}

const RoomAssessmentTemplate: React.FC<RoomAssessmentTemplateProps> = ({
  templates = [],
  onSaveTemplate,
  onLoadTemplate,
  clientType = "CASH",
}) => {
  const { t } = useTranslation();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [template, setTemplate] = useState<RoomTemplate>({
    id: "",
    name: "",
    description: "",
    clientType: clientType,
    measurementTypes: [],
    recommendationTypes: [],
  });
  const [newMeasurement, setNewMeasurement] = useState<
    Partial<MeasurementType>
  >({
    name: "",
    unit: "cm",
    standard: 0,
    required: false,
  });
  const [newRecommendation, setNewRecommendation] = useState<
    Partial<RecommendationType>
  >({
    name: "",
    description: "",
    priority: "medium",
    estimatedCost: 0,
  });

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      setTemplate({ ...selected });
    }
  };

  // Handle adding a new measurement type
  const handleAddMeasurement = () => {
    if (!newMeasurement.name) return;

    const measurement: MeasurementType = {
      id: `m-${Date.now()}`,
      name: newMeasurement.name || "",
      unit: newMeasurement.unit || "cm",
      standard: newMeasurement.standard || 0,
      required: newMeasurement.required || false,
    };

    setTemplate({
      ...template,
      measurementTypes: [...template.measurementTypes, measurement],
    });

    setNewMeasurement({
      name: "",
      unit: "cm",
      standard: 0,
      required: false,
    });
  };

  // Handle adding a new recommendation type
  const handleAddRecommendation = () => {
    if (!newRecommendation.name) return;

    const recommendation: RecommendationType = {
      id: `r-${Date.now()}`,
      name: newRecommendation.name || "",
      description: newRecommendation.description || "",
      priority: newRecommendation.priority || "medium",
      estimatedCost: newRecommendation.estimatedCost || 0,
    };

    setTemplate({
      ...template,
      recommendationTypes: [...template.recommendationTypes, recommendation],
    });

    setNewRecommendation({
      name: "",
      description: "",
      priority: "medium",
      estimatedCost: 0,
    });
  };

  // Handle removing a measurement type
  const handleRemoveMeasurement = (id: string) => {
    setTemplate({
      ...template,
      measurementTypes: template.measurementTypes.filter((m) => m.id !== id),
    });
  };

  // Handle removing a recommendation type
  const handleRemoveRecommendation = (id: string) => {
    setTemplate({
      ...template,
      recommendationTypes: template.recommendationTypes.filter(
        (r) => r.id !== id,
      ),
    });
  };

  // Handle saving the template
  const handleSaveTemplate = () => {
    if (!template.name) return;

    const templateToSave: RoomTemplate = {
      ...template,
      id: template.id || `template-${Date.now()}`,
    };

    if (onSaveTemplate) {
      onSaveTemplate(templateToSave);
    }
  };

  // Handle loading a template
  const handleLoadTemplate = () => {
    if (selectedTemplateId && onLoadTemplate) {
      onLoadTemplate(selectedTemplateId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Room Assessment Templates")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="template-select">{t("Load Template")}</Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("Select a template")} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLoadTemplate}
                  disabled={!selectedTemplateId}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("Load")}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="template-name">{t("Template Name")}</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) =>
                  setTemplate({ ...template, name: e.target.value })
                }
                placeholder={t("Enter template name")}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="template-description">{t("Description")}</Label>
            <Textarea
              id="template-description"
              value={template.description}
              onChange={(e) =>
                setTemplate({ ...template, description: e.target.value })
              }
              placeholder={t("Enter template description")}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="client-type">{t("Client Type")}</Label>
            <Select
              value={template.clientType}
              onValueChange={(value) =>
                setTemplate({ ...template, clientType: value })
              }
            >
              <SelectTrigger id="client-type" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FDF">FDF</SelectItem>
                <SelectItem value="ADHA">ADHA</SelectItem>
                <SelectItem value="CASH">CASH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("Measurement Types")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="measurement-name">{t("Name")}</Label>
                <Input
                  id="measurement-name"
                  value={newMeasurement.name}
                  onChange={(e) =>
                    setNewMeasurement({
                      ...newMeasurement,
                      name: e.target.value,
                    })
                  }
                  placeholder={t("Measurement name")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="measurement-unit">{t("Unit")}</Label>
                <Select
                  value={newMeasurement.unit}
                  onValueChange={(value) =>
                    setNewMeasurement({ ...newMeasurement, unit: value })
                  }
                >
                  <SelectTrigger id="measurement-unit" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="deg">deg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="measurement-standard">
                  {t("Standard Value")}
                </Label>
                <Input
                  id="measurement-standard"
                  type="number"
                  value={newMeasurement.standard}
                  onChange={(e) =>
                    setNewMeasurement({
                      ...newMeasurement,
                      standard: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="measurement-required"
                checked={newMeasurement.required}
                onCheckedChange={(checked) =>
                  setNewMeasurement({
                    ...newMeasurement,
                    required: checked === true,
                  })
                }
              />
              <Label htmlFor="measurement-required">
                {t("Required Measurement")}
              </Label>
            </div>

            <Button
              onClick={handleAddMeasurement}
              disabled={!newMeasurement.name}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Measurement Type")}
            </Button>

            {template.measurementTypes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {t("Added Measurement Types")}
                </h4>
                <ul className="space-y-2">
                  {template.measurementTypes.map((measurement) => (
                    <li
                      key={measurement.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div>
                        <span className="font-medium">{measurement.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({measurement.standard} {measurement.unit})
                          {measurement.required && (
                            <span className="ml-2 text-blue-500">*</span>
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-medium mb-4">
              {t("Recommendation Types")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="recommendation-name">{t("Name")}</Label>
                <Input
                  id="recommendation-name"
                  value={newRecommendation.name}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      name: e.target.value,
                    })
                  }
                  placeholder={t("Recommendation name")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="recommendation-priority">{t("Priority")}</Label>
                <Select
                  value={newRecommendation.priority}
                  onValueChange={(value: "high" | "medium" | "low") =>
                    setNewRecommendation({
                      ...newRecommendation,
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger id="recommendation-priority" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t("High")}</SelectItem>
                    <SelectItem value="medium">{t("Medium")}</SelectItem>
                    <SelectItem value="low">{t("Low")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="recommendation-description">
                {t("Description")}
              </Label>
              <Textarea
                id="recommendation-description"
                value={newRecommendation.description}
                onChange={(e) =>
                  setNewRecommendation({
                    ...newRecommendation,
                    description: e.target.value,
                  })
                }
                placeholder={t("Recommendation description")}
                className="mt-1"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="recommendation-cost">{t("Estimated Cost")}</Label>
              <Input
                id="recommendation-cost"
                type="number"
                value={newRecommendation.estimatedCost}
                onChange={(e) =>
                  setNewRecommendation({
                    ...newRecommendation,
                    estimatedCost: parseFloat(e.target.value),
                  })
                }
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleAddRecommendation}
              disabled={!newRecommendation.name}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("Add Recommendation Type")}
            </Button>

            {template.recommendationTypes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {t("Added Recommendation Types")}
                </h4>
                <ul className="space-y-2">
                  {template.recommendationTypes.map((recommendation) => (
                    <li
                      key={recommendation.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div>
                        <span className="font-medium">
                          {recommendation.name}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({recommendation.priority},{" "}
                          {recommendation.estimatedCost} AED)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveRecommendation(recommendation.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="border-t pt-4 mt-6 flex justify-end">
            <Button onClick={handleSaveTemplate} disabled={!template.name}>
              <Save className="h-4 w-4 mr-2" />
              {t("Save Template")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomAssessmentTemplate;
