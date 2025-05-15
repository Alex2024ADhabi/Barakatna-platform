import { useState } from "react";
import {
  Accessibility,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash2,
  Download,
  Upload,
  DoorOpen,
  Grip,
  ArrowUpRight,
  Lightbulb,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  recommendationId: number;
  roomAssessmentId: number;
  recommendationTypeId: number;
  recommendationTypeCode: string;
  recommendationTypeName: string;
  priorityLevel: number;
  description: string;
  reason: string;
  estimatedCost: number;
  isSelected: boolean;
  isApproved: boolean;
}

interface RecommendationType {
  recommendationTypeId: number;
  recommendationTypeCode: string;
  recommendationTypeName: string;
  description: string;
  priorityLevel: number;
  estimatedCost: number;
}

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  recommendationTypes?: RecommendationType[];
  roomTypeCode: string;
  roomTypeId?: number;
  clientType: string;
  defaultRecommendationTypeIds?: number[];
  onRecommendationUpdate: (recommendations: Recommendation[]) => void;
  isAdminMode?: boolean;
  onImportFromTemplate?: () => void;
  onExportAsTemplate?: () => void;
}

const RecommendationPanel = ({
  recommendations,
  recommendationTypes = [],
  roomTypeCode,
  roomTypeId,
  clientType,
  defaultRecommendationTypeIds = [],
  onRecommendationUpdate,
  isAdminMode = false,
  onImportFromTemplate,
  onExportAsTemplate,
}: RecommendationPanelProps) => {
  const { t } = useTranslation();
  const [expandedRecommendation, setExpandedRecommendation] = useState<
    number | null
  >(null);
  const [editingRecommendation, setEditingRecommendation] =
    useState<Recommendation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState<
    Partial<Recommendation>
  >({
    recommendationTypeCode: "",
    recommendationTypeName: "",
    priorityLevel: 3,
    description: "",
    reason: "",
    estimatedCost: 0,
    isSelected: true,
    isApproved: false,
  });

  const toggleExpand = (id: number) => {
    setExpandedRecommendation(expandedRecommendation === id ? null : id);
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const updatedRecommendations = recommendations.map((rec) =>
      rec.recommendationId === id ? { ...rec, isSelected: checked } : rec,
    );
    onRecommendationUpdate(updatedRecommendations);
  };

  const handleEditRecommendation = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
  };

  const handleSaveEdit = () => {
    if (editingRecommendation) {
      const updatedRecommendations = recommendations.map((rec) =>
        rec.recommendationId === editingRecommendation.recommendationId
          ? editingRecommendation
          : rec,
      );
      onRecommendationUpdate(updatedRecommendations);
      setEditingRecommendation(null);
    }
  };

  const handleDeleteRecommendation = (id: number) => {
    const updatedRecommendations = recommendations.filter(
      (rec) => rec.recommendationId !== id,
    );
    onRecommendationUpdate(updatedRecommendations);
  };

  const handleAddRecommendation = () => {
    const newId =
      Math.max(0, ...recommendations.map((r) => r.recommendationId)) + 1;
    const fullNewRecommendation = {
      ...newRecommendation,
      recommendationId: newId,
      roomAssessmentId: recommendations[0]?.roomAssessmentId || 1,
      recommendationTypeId: newId,
    } as Recommendation;

    onRecommendationUpdate([...recommendations, fullNewRecommendation]);
    setIsAddDialogOpen(false);
    setNewRecommendation({
      recommendationTypeCode: "",
      recommendationTypeName: "",
      priorityLevel: 3,
      description: "",
      reason: "",
      estimatedCost: 0,
      isSelected: true,
      isApproved: false,
    });
  };

  const handleAddDefaultRecommendations = () => {
    if (
      !recommendationTypes ||
      recommendationTypes.length === 0 ||
      !defaultRecommendationTypeIds
    ) {
      return;
    }

    // Filter out recommendation types that are already added
    const existingTypeIds = recommendations.map((r) => r.recommendationTypeId);
    const filteredDefaultTypeIds = defaultRecommendationTypeIds.filter(
      (typeId) => !existingTypeIds.includes(typeId),
    );

    if (filteredDefaultTypeIds.length === 0) {
      // All default recommendations are already added
      return;
    }

    const defaultRecommendations = recommendationTypes
      .filter((type) =>
        filteredDefaultTypeIds.includes(type.recommendationTypeId),
      )
      .map((type, index) => {
        const newId =
          Math.max(0, ...recommendations.map((r) => r.recommendationId)) +
          index +
          1;
        return {
          recommendationId: newId,
          roomAssessmentId: recommendations[0]?.roomAssessmentId || 1,
          recommendationTypeId: type.recommendationTypeId,
          recommendationTypeCode: type.recommendationTypeCode,
          recommendationTypeName: type.recommendationTypeName,
          priorityLevel: type.priorityLevel || 3,
          description: type.description || "",
          reason:
            clientType === "ADHA"
              ? "Required for ADHA compliance"
              : clientType === "FDF"
                ? "Recommended for FDF funding eligibility"
                : "Recommended for improved accessibility",
          estimatedCost: type.estimatedCost || 0,
          isSelected: true,
          isApproved: false,
        } as Recommendation;
      });

    onRecommendationUpdate([...recommendations, ...defaultRecommendations]);
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge className="bg-red-500">{t("High")}</Badge>;
      case 2:
        return <Badge className="bg-yellow-500">{t("Medium")}</Badge>;
      case 3:
        return <Badge className="bg-green-500">{t("Low")}</Badge>;
      default:
        return <Badge>{t("Unknown")}</Badge>;
    }
  };

  const getRecommendationIcon = (code: string) => {
    // Return different icons based on recommendation type code
    if (code.includes("DOOR") || code.includes("ENTRANCE")) {
      return <DoorOpen className="h-5 w-5" />;
    } else if (code.includes("GRAB") || code.includes("RAIL")) {
      return <Grip className="h-5 w-5" />;
    } else if (code.includes("RAMP") || code.includes("SLOPE")) {
      return <ArrowUpRight className="h-5 w-5" />;
    } else if (code.includes("LIGHT") || code.includes("VISUAL")) {
      return <Lightbulb className="h-5 w-5" />;
    } else if (code.includes("FLOOR") || code.includes("SURFACE")) {
      return <Square className="h-5 w-5" />;
    } else {
      return <Accessibility className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("Recommendations")}</h2>
        <div className="flex gap-2">
          {defaultRecommendationTypeIds &&
            defaultRecommendationTypeIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleAddDefaultRecommendations}
              >
                <Plus className="mr-2 h-4 w-4" />{" "}
                {t("Add Default Recommendations")}
              </Button>
            )}
          {isAdminMode && onImportFromTemplate && (
            <Button variant="outline" onClick={onImportFromTemplate}>
              <Download className="mr-2 h-4 w-4" /> {t("Import Template")}
            </Button>
          )}
          {isAdminMode && onExportAsTemplate && (
            <Button variant="outline" onClick={onExportAsTemplate}>
              <Upload className="mr-2 h-4 w-4" /> {t("Save as Template")}
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("Add Recommendation")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("Add New Recommendation")}</DialogTitle>
                <DialogDescription>
                  {t("Create a new recommendation for this room assessment.")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("Type")}
                  </Label>
                  {recommendationTypes && recommendationTypes.length > 0 ? (
                    <select
                      id="recommendation-type"
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={""}
                      onChange={(e) => {
                        const selectedType = recommendationTypes.find(
                          (type) =>
                            type.recommendationTypeId ===
                            parseInt(e.target.value),
                        );
                        if (selectedType) {
                          setNewRecommendation({
                            ...newRecommendation,
                            recommendationTypeName:
                              selectedType.recommendationTypeName,
                            recommendationTypeCode:
                              selectedType.recommendationTypeCode,
                            description: selectedType.description || "",
                            priorityLevel: selectedType.priorityLevel || 3,
                            estimatedCost: selectedType.estimatedCost || 0,
                          });
                        }
                      }}
                    >
                      <option value="">
                        {t("Select a recommendation type")}
                      </option>
                      {recommendationTypes
                        .filter((type) => {
                          // If room type has default recommendation types and not in admin mode, filter by them
                          if (
                            roomTypeId &&
                            defaultRecommendationTypeIds.length > 0 &&
                            !isAdminMode
                          ) {
                            return defaultRecommendationTypeIds.includes(
                              type.recommendationTypeId,
                            );
                          }
                          // Otherwise show all recommendation types
                          return true;
                        })
                        .map((type) => (
                          <option
                            key={type.recommendationTypeId}
                            value={type.recommendationTypeId}
                          >
                            {type.recommendationTypeName}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <Input
                      id="name"
                      className="col-span-3"
                      value={newRecommendation.recommendationTypeName}
                      onChange={(e) =>
                        setNewRecommendation({
                          ...newRecommendation,
                          recommendationTypeName: e.target.value,
                          recommendationTypeCode: e.target.value
                            .toUpperCase()
                            .replace(/\s+/g, "_"),
                        })
                      }
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddRecommendation}>
                  {t("Add Recommendation")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {t("No recommendations yet. Add one to get started.")}
          </CardContent>
        </Card>
      ) : (
        recommendations.map((recommendation) => (
          <Card
            key={recommendation.recommendationId}
            className="overflow-hidden"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`rec-${recommendation.recommendationId}`}
                    checked={recommendation.isSelected}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        recommendation.recommendationId,
                        checked as boolean,
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(
                      recommendation.recommendationTypeCode,
                    )}
                    <CardTitle className="text-lg">
                      {recommendation.recommendationTypeName}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(recommendation.priorityLevel)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleExpand(recommendation.recommendationId)
                    }
                  >
                    {expandedRecommendation ===
                    recommendation.recommendationId ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedRecommendation === recommendation.recommendationId && (
              <>
                <CardContent className="pb-2">
                  {editingRecommendation?.recommendationId ===
                  recommendation.recommendationId ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-description">
                          {t("Description")}
                        </Label>
                        <Textarea
                          id="edit-description"
                          value={editingRecommendation.description}
                          onChange={(e) =>
                            setEditingRecommendation({
                              ...editingRecommendation,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-reason">{t("Reason")}</Label>
                        <Textarea
                          id="edit-reason"
                          value={editingRecommendation.reason}
                          onChange={(e) =>
                            setEditingRecommendation({
                              ...editingRecommendation,
                              reason: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-cost">{t("Estimated Cost")}</Label>
                        <Input
                          id="edit-cost"
                          type="number"
                          value={editingRecommendation.estimatedCost}
                          onChange={(e) =>
                            setEditingRecommendation({
                              ...editingRecommendation,
                              estimatedCost: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-priority">
                          {t("Priority Level")}
                        </Label>
                        <select
                          id="edit-priority"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editingRecommendation.priorityLevel}
                          onChange={(e) =>
                            setEditingRecommendation({
                              ...editingRecommendation,
                              priorityLevel: parseInt(e.target.value),
                            })
                          }
                        >
                          <option value={1}>{t("High")}</option>
                          <option value={2}>{t("Medium")}</option>
                          <option value={3}>{t("Low")}</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="font-medium">{t("Description")}:</p>
                        <p className="text-muted-foreground">
                          {recommendation.description}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="font-medium">{t("Reason")}:</p>
                        <p className="text-muted-foreground">
                          {recommendation.reason}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">{t("Estimated Cost")}:</p>
                          <p className="text-muted-foreground">
                            {recommendation.estimatedCost.toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "SAR",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{t("Status")}:</p>
                          <p className="text-muted-foreground">
                            {recommendation.isApproved ? (
                              <span className="flex items-center text-green-600">
                                <Check className="mr-1 h-4 w-4" />{" "}
                                {t("Approved")}
                              </span>
                            ) : (
                              t("Pending Approval")
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {editingRecommendation?.recommendationId ===
                  recommendation.recommendationId ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit}>{t("Save")}</Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingRecommendation(null)}
                      >
                        {t("Cancel")}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecommendation(recommendation)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> {t("Edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() =>
                          handleDeleteRecommendation(
                            recommendation.recommendationId,
                          )
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> {t("Delete")}
                      </Button>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {clientType === "FDF" && recommendation.isSelected && (
                      <span className="text-blue-600">
                        {t("Eligible for FDF funding")}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        ))
      )}

      {recommendations.filter((r) => r.isSelected).length > 0 && (
        <div className="mt-4 flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">{t("Total Selected")}:</p>
            <p className="text-2xl font-bold">
              {recommendations
                .filter((r) => r.isSelected)
                .reduce((sum, r) => sum + r.estimatedCost, 0)
                .toLocaleString("en-US", {
                  style: "currency",
                  currency: "SAR",
                })}
            </p>
          </div>
          <Button>
            {t("Submit for Approval")} (
            {recommendations.filter((r) => r.isSelected).length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecommendationPanel;
