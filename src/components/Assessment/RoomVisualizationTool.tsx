import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RoomForComponent,
  MeasurementForComponent,
} from "@/hooks/useRoomAssessments";

interface RoomVisualizationToolProps {
  room: RoomForComponent;
  clientType?: string;
}

const RoomVisualizationTool: React.FC<RoomVisualizationToolProps> = ({
  room,
  clientType = "CASH",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("2d");
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (room.measurements.length > 0 && !selectedMeasurement) {
      setSelectedMeasurement(room.measurements[0].id);
    }
  }, [room.measurements, selectedMeasurement]);

  const getMeasurement = (
    id: string | null,
  ): MeasurementForComponent | undefined => {
    if (!id) return undefined;
    return room.measurements.find((m) => m.id === id);
  };

  const measurement = getMeasurement(selectedMeasurement);

  // This would be replaced with actual visualization components
  const render2DVisualization = () => {
    return (
      <div className="bg-muted rounded-md p-4 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {t("2D Room Visualization")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(
              "This would render a 2D floor plan of the room with measurements highlighted",
            )}
          </p>
          {measurement && (
            <div className="mt-4 p-2 bg-background rounded-md">
              <p className="font-medium">{measurement.name}</p>
              <p>
                {measurement.value !== null ? measurement.value : "-"}{" "}
                {measurement.unit}
                {measurement.isCompliant !== null && (
                  <span
                    className={`ml-2 ${measurement.isCompliant ? "text-green-500" : "text-red-500"}`}
                  >
                    {measurement.isCompliant
                      ? t("Compliant")
                      : t("Non-Compliant")}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const render3DVisualization = () => {
    return (
      <div className="bg-muted rounded-md p-4 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {t("3D Room Visualization")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(
              "This would render a 3D model of the room with measurements highlighted",
            )}
          </p>
          {measurement && (
            <div className="mt-4 p-2 bg-background rounded-md">
              <p className="font-medium">{measurement.name}</p>
              <p>
                {measurement.value !== null ? measurement.value : "-"}{" "}
                {measurement.unit}
                {measurement.isCompliant !== null && (
                  <span
                    className={`ml-2 ${measurement.isCompliant ? "text-green-500" : "text-red-500"}`}
                  >
                    {measurement.isCompliant
                      ? t("Compliant")
                      : t("Non-Compliant")}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderARVisualization = () => {
    return (
      <div className="bg-muted rounded-md p-4 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {t("AR Room Visualization")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(
              "This would provide AR visualization capabilities for on-site assessment",
            )}
          </p>
          <Button className="mt-4">{t("Launch AR Mode")}</Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("Room Visualization")}: {room.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select
            value={selectedMeasurement || ""}
            onValueChange={setSelectedMeasurement}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("Select measurement to highlight")} />
            </SelectTrigger>
            <SelectContent>
              {room.measurements.map((measurement) => (
                <SelectItem key={measurement.id} value={measurement.id}>
                  {measurement.name} ({measurement.value} {measurement.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="2d">{t("2D View")}</TabsTrigger>
            <TabsTrigger value="3d">{t("3D View")}</TabsTrigger>
            <TabsTrigger value="ar">{t("AR View")}</TabsTrigger>
          </TabsList>
          <TabsContent value="2d" className="mt-4">
            {render2DVisualization()}
          </TabsContent>
          <TabsContent value="3d" className="mt-4">
            {render3DVisualization()}
          </TabsContent>
          <TabsContent value="ar" className="mt-4">
            {renderARVisualization()}
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {t("Client Type")}: {clientType}
          </p>
          <p>
            {t("Room Type")}: {room.type}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomVisualizationTool;
