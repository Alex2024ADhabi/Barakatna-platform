import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Home,
  Bath,
  Bed,
  Sofa,
  DoorOpen,
  Car,
  Utensils,
  Warehouse,
} from "lucide-react";

// Alias Utensils as Kitchen since Kitchen icon is not available in lucide-react
const Kitchen = Utensils;
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface RoomType {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  defaultMeasurementTypeIds: number[];
  defaultRecommendationTypeIds: number[];
  clientTypeCode?: string;
}

interface MeasurementType {
  measurementTypeId: number;
  typeCode: string;
  typeName: string;
  description: string;
  defaultUnitOfMeasure: string;
  standardValue: number;
  minValue: number;
  maxValue: number;
}

interface RecommendationType {
  recommendationTypeId: number;
  recommendationTypeCode: string;
  recommendationTypeName: string;
  description: string;
  priorityLevel: number;
  estimatedCost: number;
}

interface RoomTypeConfigPanelProps {
  roomTypes: RoomType[];
  measurementTypes: MeasurementType[];
  recommendationTypes: RecommendationType[];
  clientType?: string;
  onRoomTypeAdd: (roomType: Omit<RoomType, "id">) => void;
  onRoomTypeUpdate: (roomType: RoomType) => void;
  onRoomTypeDelete: (id: number) => void;
}

const RoomTypeConfigPanel: React.FC<RoomTypeConfigPanelProps> = ({
  roomTypes = [],
  measurementTypes = [],
  recommendationTypes = [],
  clientType = "",
  onRoomTypeAdd,
  onRoomTypeUpdate,
  onRoomTypeDelete,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [newRoomType, setNewRoomType] = useState<Omit<RoomType, "id">>({
    code: "",
    name: "",
    description: "",
    icon: "home",
    defaultMeasurementTypeIds: [],
    defaultRecommendationTypeIds: [],
    clientTypeCode: clientType,
  });

  const [selectedIcon, setSelectedIcon] = useState<string>("home");
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState<boolean>(false);

  const availableIcons = [
    { name: "home", label: t("Home") },
    { name: "bathroom", label: t("Bathroom") },
    { name: "kitchen", label: t("Kitchen") },
    { name: "bedroom", label: t("Bedroom") },
    { name: "living", label: t("Living Room") },
    { name: "entrance", label: t("Entrance") },
    { name: "garage", label: t("Garage") },
    { name: "dining", label: t("Dining Room") },
    { name: "storage", label: t("Storage") },
  ];

  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<
    number[]
  >([]);
  const [selectedRecommendationTypes, setSelectedRecommendationTypes] =
    useState<number[]>([]);

  useEffect(() => {
    if (editingRoomType) {
      setSelectedMeasurementTypes([
        ...editingRoomType.defaultMeasurementTypeIds,
      ]);
      setSelectedRecommendationTypes([
        ...editingRoomType.defaultRecommendationTypeIds,
      ]);
    } else {
      setSelectedMeasurementTypes([]);
      setSelectedRecommendationTypes([]);
    }
  }, [editingRoomType]);

  const handleAddRoomType = () => {
    const roomTypeToAdd = {
      ...newRoomType,
      defaultMeasurementTypeIds: selectedMeasurementTypes,
      defaultRecommendationTypeIds: selectedRecommendationTypes,
    };
    onRoomTypeAdd(roomTypeToAdd);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateRoomType = () => {
    if (editingRoomType) {
      const updatedRoomType = {
        ...editingRoomType,
        defaultMeasurementTypeIds: selectedMeasurementTypes,
        defaultRecommendationTypeIds: selectedRecommendationTypes,
      };
      onRoomTypeUpdate(updatedRoomType);
      setEditingRoomType(null);
      resetForm();
    }
  };

  const handleEditStart = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setSelectedMeasurementTypes([...roomType.defaultMeasurementTypeIds]);
    setSelectedRecommendationTypes([...roomType.defaultRecommendationTypeIds]);
  };

  const handleEditCancel = () => {
    setEditingRoomType(null);
    resetForm();
  };

  const resetForm = () => {
    setNewRoomType({
      code: "",
      name: "",
      description: "",
      icon: "home",
      defaultMeasurementTypeIds: [],
      defaultRecommendationTypeIds: [],
      clientTypeCode: clientType,
    });
    setSelectedMeasurementTypes([]);
    setSelectedRecommendationTypes([]);
    setSelectedIcon("home");
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "bathroom":
        return <Bath className="h-5 w-5" />;
      case "kitchen":
        return <Kitchen className="h-5 w-5" />;
      case "bedroom":
        return <Bed className="h-5 w-5" />;
      case "living":
        return <Sofa className="h-5 w-5" />;
      case "entrance":
        return <DoorOpen className="h-5 w-5" />;
      case "garage":
        return <Car className="h-5 w-5" />;
      case "dining":
        return <Utensils className="h-5 w-5" />;
      case "storage":
        return <Warehouse className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const toggleMeasurementType = (id: number) => {
    if (selectedMeasurementTypes.includes(id)) {
      setSelectedMeasurementTypes(
        selectedMeasurementTypes.filter((typeId) => typeId !== id),
      );
    } else {
      setSelectedMeasurementTypes([...selectedMeasurementTypes, id]);
    }
  };

  const toggleRecommendationType = (id: number) => {
    if (selectedRecommendationTypes.includes(id)) {
      setSelectedRecommendationTypes(
        selectedRecommendationTypes.filter((typeId) => typeId !== id),
      );
    } else {
      setSelectedRecommendationTypes([...selectedRecommendationTypes, id]);
    }
  };

  const renderRoomTypeForm = (isEditing: boolean) => {
    const currentRoomType = isEditing ? editingRoomType : newRoomType;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="room-name">{t("Name")}</Label>
            <Input
              id="room-name"
              value={isEditing ? editingRoomType?.name : newRoomType.name}
              onChange={(e) => {
                if (isEditing && editingRoomType) {
                  setEditingRoomType({
                    ...editingRoomType,
                    name: e.target.value,
                  });
                } else {
                  setNewRoomType({ ...newRoomType, name: e.target.value });
                  // Auto-generate code from name if code is empty
                  if (!newRoomType.code) {
                    const generatedCode = e.target.value
                      .toUpperCase()
                      .replace(/\s+/g, "_")
                      .replace(/[^A-Z0-9_]/g, "");
                    setNewRoomType((prev) => ({
                      ...prev,
                      code: generatedCode,
                    }));
                  }
                }
              }}
              placeholder={t("Enter room type name")}
            />
          </div>
          <div>
            <Label htmlFor="room-code">{t("Code")}</Label>
            <Input
              id="room-code"
              value={isEditing ? editingRoomType?.code : newRoomType.code}
              onChange={(e) => {
                if (isEditing && editingRoomType) {
                  setEditingRoomType({
                    ...editingRoomType,
                    code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  });
                } else {
                  setNewRoomType({
                    ...newRoomType,
                    code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  });
                }
              }}
              placeholder={t("Enter room type code")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="room-icon">{t("Icon")}</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsIconSelectorOpen(!isIconSelectorOpen)}
            >
              {getIconComponent(
                isEditing ? editingRoomType?.icon || "home" : selectedIcon,
              )}
              <span>
                {isEditing ? editingRoomType?.icon || "home" : selectedIcon}
              </span>
            </Button>
          </div>

          {isIconSelectorOpen && (
            <div className="grid grid-cols-3 gap-2 mt-2 p-2 border rounded-md">
              {availableIcons.map((icon) => (
                <Button
                  key={icon.name}
                  type="button"
                  variant="ghost"
                  className="flex items-center justify-start gap-2"
                  onClick={() => {
                    if (isEditing && editingRoomType) {
                      setEditingRoomType({
                        ...editingRoomType,
                        icon: icon.name,
                      });
                    } else {
                      setNewRoomType({ ...newRoomType, icon: icon.name });
                      setSelectedIcon(icon.name);
                    }
                    setIsIconSelectorOpen(false);
                  }}
                >
                  {getIconComponent(icon.name)}
                  <span>{icon.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="room-description">{t("Description")}</Label>
          <Textarea
            id="room-description"
            value={
              isEditing ? editingRoomType?.description : newRoomType.description
            }
            onChange={(e) => {
              if (isEditing && editingRoomType) {
                setEditingRoomType({
                  ...editingRoomType,
                  description: e.target.value,
                });
              } else {
                setNewRoomType({ ...newRoomType, description: e.target.value });
              }
            }}
            placeholder={t("Enter room type description")}
          />
        </div>

        <div>
          <Label>{t("Default Measurement Types")}</Label>
          <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
            {measurementTypes.map((type) => (
              <div
                key={type.measurementTypeId}
                className="flex items-center space-x-2 py-1"
              >
                <input
                  type="checkbox"
                  id={`measurement-${type.measurementTypeId}`}
                  checked={selectedMeasurementTypes.includes(
                    type.measurementTypeId,
                  )}
                  onChange={() => toggleMeasurementType(type.measurementTypeId)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`measurement-${type.measurementTypeId}`}
                  className="text-sm"
                >
                  {type.typeName} ({type.defaultUnitOfMeasure})
                </label>
              </div>
            ))}
            {measurementTypes.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">
                {t(
                  "No measurement types available. Add them in the Measurement Type Configuration.",
                )}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>{t("Default Recommendation Types")}</Label>
          <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
            {recommendationTypes.map((type) => (
              <div
                key={type.recommendationTypeId}
                className="flex items-center space-x-2 py-1"
              >
                <input
                  type="checkbox"
                  id={`recommendation-${type.recommendationTypeId}`}
                  checked={selectedRecommendationTypes.includes(
                    type.recommendationTypeId,
                  )}
                  onChange={() =>
                    toggleRecommendationType(type.recommendationTypeId)
                  }
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`recommendation-${type.recommendationTypeId}`}
                  className="text-sm"
                >
                  {type.recommendationTypeName}
                </label>
              </div>
            ))}
            {recommendationTypes.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">
                {t("No recommendation types available.")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("Room Type Configuration")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("Add Room Type")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("Add New Room Type")}</DialogTitle>
              <DialogDescription>
                {t(
                  "Create a new room type with default measurements and recommendations.",
                )}
              </DialogDescription>
            </DialogHeader>
            {renderRoomTypeForm(false)}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddRoomType}>{t("Add Room Type")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {roomTypes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {t("No room types configured yet. Add one to get started.")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("Configured Room Types")}</CardTitle>
            <CardDescription>
              {t(
                "Manage room types and their default measurements and recommendations.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead>{t("Code")}</TableHead>
                  <TableHead>{t("Description")}</TableHead>
                  <TableHead>{t("Measurements")}</TableHead>
                  <TableHead>{t("Recommendations")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((roomType) => (
                  <TableRow key={roomType.id}>
                    <TableCell className="font-medium">
                      {roomType.name}
                    </TableCell>
                    <TableCell>{roomType.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {roomType.description}
                    </TableCell>
                    <TableCell>
                      {roomType.defaultMeasurementTypeIds.length}
                    </TableCell>
                    <TableCell>
                      {roomType.defaultRecommendationTypeIds.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(roomType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onRoomTypeDelete(roomType.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {editingRoomType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("Edit Room Type")}: {editingRoomType.name}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderRoomTypeForm(true)}</CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleEditCancel}>
              <X className="mr-2 h-4 w-4" /> {t("Cancel")}
            </Button>
            <Button onClick={handleUpdateRoomType}>
              <Save className="mr-2 h-4 w-4" /> {t("Save Changes")}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default RoomTypeConfigPanel;
