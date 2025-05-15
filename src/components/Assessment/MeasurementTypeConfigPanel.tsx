import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MeasurementType {
  measurementTypeId: number;
  typeCode: string;
  typeName: string;
  description: string;
  defaultUnitOfMeasure: string;
  standardValue: number;
  minValue: number;
  maxValue: number;
  clientTypeCode?: string;
}

interface MeasurementTypeConfigPanelProps {
  measurementTypes: MeasurementType[];
  clientType?: string;
  onMeasurementTypeAdd: (
    measurementType: Omit<MeasurementType, "measurementTypeId">,
  ) => void;
  onMeasurementTypeUpdate: (measurementType: MeasurementType) => void;
  onMeasurementTypeDelete: (id: number) => void;
}

const MeasurementTypeConfigPanel: React.FC<MeasurementTypeConfigPanelProps> = ({
  measurementTypes = [],
  clientType = "",
  onMeasurementTypeAdd,
  onMeasurementTypeUpdate,
  onMeasurementTypeDelete,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMeasurementType, setEditingMeasurementType] =
    useState<MeasurementType | null>(null);
  const [newMeasurementType, setNewMeasurementType] = useState<
    Omit<MeasurementType, "measurementTypeId">
  >({
    typeCode: "",
    typeName: "",
    description: "",
    defaultUnitOfMeasure: "cm",
    standardValue: 0,
    minValue: 0,
    maxValue: 100,
    clientTypeCode: clientType,
  });

  const unitOptions = ["cm", "m", "mm", "in", "ft", "deg", "kg", "lb"];

  const handleAddMeasurementType = () => {
    onMeasurementTypeAdd(newMeasurementType);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateMeasurementType = () => {
    if (editingMeasurementType) {
      onMeasurementTypeUpdate(editingMeasurementType);
      setEditingMeasurementType(null);
    }
  };

  const handleEditStart = (measurementType: MeasurementType) => {
    setEditingMeasurementType(measurementType);
  };

  const handleEditCancel = () => {
    setEditingMeasurementType(null);
  };

  const resetForm = () => {
    setNewMeasurementType({
      typeCode: "",
      typeName: "",
      description: "",
      defaultUnitOfMeasure: "cm",
      standardValue: 0,
      minValue: 0,
      maxValue: 100,
      clientTypeCode: clientType,
    });
  };

  const generateCodeFromName = (name: string) => {
    return name.toUpperCase().replace(/\s+/g, "_");
  };

  const renderMeasurementTypeForm = (isEditing: boolean) => {
    const currentType = isEditing ? editingMeasurementType : newMeasurementType;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="measurement-name">{t("Name")}</Label>
            <Input
              id="measurement-name"
              value={
                isEditing
                  ? editingMeasurementType?.typeName
                  : newMeasurementType.typeName
              }
              onChange={(e) => {
                const name = e.target.value;
                const code = generateCodeFromName(name);
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    typeName: name,
                    typeCode: code,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    typeName: name,
                    typeCode: code,
                  });
                }
              }}
              placeholder={t("Enter measurement type name")}
            />
          </div>
          <div>
            <Label htmlFor="measurement-code">{t("Code")}</Label>
            <Input
              id="measurement-code"
              value={
                isEditing
                  ? editingMeasurementType?.typeCode
                  : newMeasurementType.typeCode
              }
              onChange={(e) => {
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    typeCode: e.target.value,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    typeCode: e.target.value,
                  });
                }
              }}
              placeholder={t("Enter measurement type code")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="measurement-description">{t("Description")}</Label>
          <Textarea
            id="measurement-description"
            value={
              isEditing
                ? editingMeasurementType?.description
                : newMeasurementType.description
            }
            onChange={(e) => {
              if (isEditing && editingMeasurementType) {
                setEditingMeasurementType({
                  ...editingMeasurementType,
                  description: e.target.value,
                });
              } else {
                setNewMeasurementType({
                  ...newMeasurementType,
                  description: e.target.value,
                });
              }
            }}
            placeholder={t("Enter measurement type description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="measurement-unit">{t("Unit of Measure")}</Label>
            <Select
              value={
                isEditing
                  ? editingMeasurementType?.defaultUnitOfMeasure
                  : newMeasurementType.defaultUnitOfMeasure
              }
              onValueChange={(value) => {
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    defaultUnitOfMeasure: value,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    defaultUnitOfMeasure: value,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Select unit")} />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="measurement-standard">{t("Standard Value")}</Label>
            <Input
              id="measurement-standard"
              type="number"
              value={
                isEditing
                  ? editingMeasurementType?.standardValue
                  : newMeasurementType.standardValue
              }
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    standardValue: value,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    standardValue: value,
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="measurement-min">{t("Minimum Value")}</Label>
            <Input
              id="measurement-min"
              type="number"
              value={
                isEditing
                  ? editingMeasurementType?.minValue
                  : newMeasurementType.minValue
              }
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    minValue: value,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    minValue: value,
                  });
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="measurement-max">{t("Maximum Value")}</Label>
            <Input
              id="measurement-max"
              type="number"
              value={
                isEditing
                  ? editingMeasurementType?.maxValue
                  : newMeasurementType.maxValue
              }
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (isEditing && editingMeasurementType) {
                  setEditingMeasurementType({
                    ...editingMeasurementType,
                    maxValue: value,
                  });
                } else {
                  setNewMeasurementType({
                    ...newMeasurementType,
                    maxValue: value,
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {t("Measurement Type Configuration")}
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t("Add Measurement Type")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("Add New Measurement Type")}</DialogTitle>
              <DialogDescription>
                {t(
                  "Create a new measurement type with standard values and units.",
                )}
              </DialogDescription>
            </DialogHeader>
            {renderMeasurementTypeForm(false)}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddMeasurementType}>
                {t("Add Measurement Type")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {measurementTypes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {t("No measurement types configured yet. Add one to get started.")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("Configured Measurement Types")}</CardTitle>
            <CardDescription>
              {t("Manage measurement types, their units, and standard values.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead>{t("Code")}</TableHead>
                  <TableHead>{t("Unit")}</TableHead>
                  <TableHead>{t("Standard Value")}</TableHead>
                  <TableHead>{t("Range")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurementTypes.map((type) => (
                  <TableRow key={type.measurementTypeId}>
                    <TableCell className="font-medium">
                      {type.typeName}
                    </TableCell>
                    <TableCell>{type.typeCode}</TableCell>
                    <TableCell>{type.defaultUnitOfMeasure}</TableCell>
                    <TableCell>{type.standardValue}</TableCell>
                    <TableCell>
                      {type.minValue} - {type.maxValue}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            onMeasurementTypeDelete(type.measurementTypeId)
                          }
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

      {editingMeasurementType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("Edit Measurement Type")}: {editingMeasurementType.typeName}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderMeasurementTypeForm(true)}</CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleEditCancel}>
              <X className="mr-2 h-4 w-4" /> {t("Cancel")}
            </Button>
            <Button onClick={handleUpdateMeasurementType}>
              <Save className="mr-2 h-4 w-4" /> {t("Save Changes")}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MeasurementTypeConfigPanel;
