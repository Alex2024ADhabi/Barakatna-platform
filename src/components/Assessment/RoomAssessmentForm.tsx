import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { measurementService } from "@/services/measurementService";

interface RoomAssessmentFormProps {
  language?: "en" | "ar";
  roomType?: string;
  onSave?: (data: any) => void;
  initialData?: any;
}

const RoomAssessmentForm: React.FC<RoomAssessmentFormProps> = ({
  language = "en",
  roomType = "bathroom",
  onSave = () => {},
  initialData,
}) => {
  const isRtl = language === "ar";

  const [formData, setFormData] = useState({
    roomType: roomType,
    measurements: [
      { name: "", value: "", unit: "inches", standard: "", notes: "" },
    ],
    observations: "",
    recommendations: [
      { description: "", priority: "medium", estimatedCost: "" },
    ],
    photos: [] as { id: string; dataUrl: string; description: string }[],
  });

  const handleMeasurementChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedMeasurements = [...formData.measurements];
    const measurement = updatedMeasurements[index];

    if (field === "value" && !isNaN(parseFloat(value))) {
      // Use measurement service to update the value and check compliance
      const numericValue = parseFloat(value);
      const measurementTypeId = measurement.measurementTypeId || index;
      const standardValue =
        measurement.standard ||
        measurementService.getStandardValue(
          measurementTypeId.toString(),
          "CASH",
        );

      // Check compliance if there's a standard value
      if (standardValue !== null && standardValue !== undefined) {
        const isCompliant = measurementService.checkCompliance(
          measurementTypeId.toString(),
          numericValue,
          parseFloat(standardValue),
        );

        updatedMeasurements[index] = {
          ...measurement,
          [field]: value,
          standard: standardValue.toString(),
          isCompliant: isCompliant,
        };
      } else {
        updatedMeasurements[index] = {
          ...measurement,
          [field]: value,
        };
      }
    } else {
      updatedMeasurements[index] = {
        ...measurement,
        [field]: value,
      };
    }

    setFormData({ ...formData, measurements: updatedMeasurements });
  };

  const handleRecommendationChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedRecommendations = [...formData.recommendations];
    updatedRecommendations[index] = {
      ...updatedRecommendations[index],
      [field]: value,
    };
    setFormData({ ...formData, recommendations: updatedRecommendations });
  };

  const addMeasurement = () => {
    // Generate a unique ID for the new measurement
    const newMeasurementId = Date.now();

    setFormData({
      ...formData,
      measurements: [
        ...formData.measurements,
        {
          name: "",
          value: "",
          unit: "inches",
          standard: "",
          notes: "",
          measurementTypeId: newMeasurementId,
          isCompliant: undefined,
        },
      ],
    });
  };

  const removeMeasurement = (index: number) => {
    const updatedMeasurements = formData.measurements.filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, measurements: updatedMeasurements });
  };

  const addRecommendation = () => {
    setFormData({
      ...formData,
      recommendations: [
        ...formData.recommendations,
        { description: "", priority: "medium", estimatedCost: "" },
      ],
    });
  };

  const removeRecommendation = (index: number) => {
    const updatedRecommendations = formData.recommendations.filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, recommendations: updatedRecommendations });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        const newPhoto = {
          id: Date.now().toString(),
          dataUrl: reader.result as string,
          description: "",
        };

        setFormData({
          ...formData,
          photos: [...formData.photos, newPhoto],
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const updatePhotoDescription = (id: string, description: string) => {
    const updatedPhotos = formData.photos.map((photo) =>
      photo.id === id ? { ...photo, description } : photo,
    );
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = formData.photos.filter((photo) => photo.id !== id);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const translations = {
    roomAssessment: {
      en: "Room Assessment Form",
      ar: "نموذج تقييم الغرفة",
    },
    roomType: {
      en: "Room Type",
      ar: "نوع الغرفة",
    },
    measurements: {
      en: "Measurements",
      ar: "القياسات",
    },
    addMeasurement: {
      en: "Add Measurement",
      ar: "إضافة قياس",
    },
    name: {
      en: "Name",
      ar: "الاسم",
    },
    value: {
      en: "Value",
      ar: "القيمة",
    },
    unit: {
      en: "Unit",
      ar: "الوحدة",
    },
    standard: {
      en: "Standard",
      ar: "المعيار",
    },
    notes: {
      en: "Notes",
      ar: "ملاحظات",
    },
    observations: {
      en: "Observations",
      ar: "الملاحظات",
    },
    recommendations: {
      en: "Recommendations",
      ar: "التوصيات",
    },
    addRecommendation: {
      en: "Add Recommendation",
      ar: "إضافة توصية",
    },
    description: {
      en: "Description",
      ar: "الوصف",
    },
    priority: {
      en: "Priority",
      ar: "الأولوية",
    },
    estimatedCost: {
      en: "Estimated Cost",
      ar: "التكلفة التقديرية",
    },
    photos: {
      en: "Photos",
      ar: "الصور",
    },
    uploadPhoto: {
      en: "Upload Photo",
      ar: "تحميل صورة",
    },
    save: {
      en: "Save Assessment",
      ar: "حفظ التقييم",
    },
    high: {
      en: "High",
      ar: "عالية",
    },
    medium: {
      en: "Medium",
      ar: "متوسطة",
    },
    low: {
      en: "Low",
      ar: "منخفضة",
    },
    inches: {
      en: "Inches",
      ar: "بوصة",
    },
    cm: {
      en: "Centimeters",
      ar: "سنتيمتر",
    },
    mm: {
      en: "Millimeters",
      ar: "ملليمتر",
    },
    bathroom: {
      en: "Bathroom",
      ar: "الحمام",
    },
    bedroom: {
      en: "Bedroom",
      ar: "غرفة النوم",
    },
    kitchen: {
      en: "Kitchen",
      ar: "المطبخ",
    },
    livingRoom: {
      en: "Living Room",
      ar: "غرفة المعيشة",
    },
    entrance: {
      en: "Entrance",
      ar: "المدخل",
    },
  };

  const t = (
    key: keyof typeof translations,
    subKey: "en" | "ar" = language,
  ) => {
    return translations[key]?.[subKey] || key;
  };

  return (
    <div className="bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("roomAssessment")}</CardTitle>
            <CardDescription>
              {t("roomType")}: {t(roomType as keyof typeof translations)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Measurements Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {t("measurements")}
                </h3>
                {formData.measurements.map((measurement, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-md"
                  >
                    <div>
                      <Label htmlFor={`measurement-name-${index}`}>
                        {t("name")}
                      </Label>
                      <Input
                        id={`measurement-name-${index}`}
                        value={measurement.name}
                        onChange={(e) =>
                          handleMeasurementChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`measurement-value-${index}`}>
                        {t("value")}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`measurement-value-${index}`}
                          type="number"
                          value={measurement.value}
                          onChange={(e) =>
                            handleMeasurementChange(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                          className={
                            measurement.isCompliant !== undefined
                              ? measurement.isCompliant
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : ""
                          }
                        />
                        {measurement.isCompliant !== undefined && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {measurement.isCompliant ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`measurement-unit-${index}`}>
                        {t("unit")}
                      </Label>
                      <Select
                        value={measurement.unit}
                        onValueChange={(value) =>
                          handleMeasurementChange(index, "unit", value)
                        }
                      >
                        <SelectTrigger id={`measurement-unit-${index}`}>
                          <SelectValue placeholder={t("unit")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inches">{t("inches")}</SelectItem>
                          <SelectItem value="cm">{t("cm")}</SelectItem>
                          <SelectItem value="mm">{t("mm")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`measurement-standard-${index}`}>
                        {t("standard")}
                      </Label>
                      <Input
                        id={`measurement-standard-${index}`}
                        type="number"
                        value={measurement.standard}
                        onChange={(e) =>
                          handleMeasurementChange(
                            index,
                            "standard",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMeasurement(index)}
                        disabled={formData.measurements.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMeasurement}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addMeasurement")}
                </Button>
              </div>

              <Separator />

              {/* Observations Section */}
              <div>
                <Label htmlFor="observations">{t("observations")}</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <Separator />

              {/* Recommendations Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {t("recommendations")}
                </h3>
                {formData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md"
                  >
                    <div className="md:col-span-2">
                      <Label htmlFor={`recommendation-desc-${index}`}>
                        {t("description")}
                      </Label>
                      <Input
                        id={`recommendation-desc-${index}`}
                        value={recommendation.description}
                        onChange={(e) =>
                          handleRecommendationChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`recommendation-priority-${index}`}>
                        {t("priority")}
                      </Label>
                      <Select
                        value={recommendation.priority}
                        onValueChange={(value) =>
                          handleRecommendationChange(index, "priority", value)
                        }
                      >
                        <SelectTrigger id={`recommendation-priority-${index}`}>
                          <SelectValue placeholder={t("priority")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t("high")}</SelectItem>
                          <SelectItem value="medium">{t("medium")}</SelectItem>
                          <SelectItem value="low">{t("low")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`recommendation-cost-${index}`}>
                          {t("estimatedCost")}
                        </Label>
                        <Input
                          id={`recommendation-cost-${index}`}
                          type="number"
                          value={recommendation.estimatedCost}
                          onChange={(e) =>
                            handleRecommendationChange(
                              index,
                              "estimatedCost",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeRecommendation(index)}
                        disabled={formData.recommendations.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRecommendation}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addRecommendation")}
                </Button>
              </div>

              <Separator />

              {/* Photos Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">{t("photos")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <img
                        src={photo.dataUrl}
                        alt="Room assessment"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <Input
                          placeholder={t("description")}
                          value={photo.description}
                          onChange={(e) =>
                            updatePhotoDescription(photo.id, e.target.value)
                          }
                          className="mb-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePhoto(photo.id)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === "en" ? "Remove" : "إزالة"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border border-dashed rounded-md flex flex-col items-center justify-center p-6 h-64">
                    <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("uploadPhoto")}
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          {language === "en" ? "Browse Files" : "تصفح الملفات"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoomAssessmentForm;
