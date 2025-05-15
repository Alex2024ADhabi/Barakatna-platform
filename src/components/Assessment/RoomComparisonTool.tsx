import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, AlertTriangle, ArrowRight } from "lucide-react";
import {
  RoomForComponent,
  MeasurementForComponent,
} from "@/hooks/useRoomAssessments";

interface RoomComparisonToolProps {
  rooms: RoomForComponent[];
  onSelectRoom?: (roomId: string) => void;
}

const RoomComparisonTool: React.FC<RoomComparisonToolProps> = ({
  rooms,
  onSelectRoom,
}) => {
  const { t } = useTranslation();
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Get selected rooms
  const selectedRooms = useMemo(() => {
    return rooms.filter((room) => selectedRoomIds.includes(room.id));
  }, [rooms, selectedRoomIds]);

  // Get all unique measurement types across selected rooms
  const allMeasurementTypes = useMemo(() => {
    const types = new Set<string>();
    selectedRooms.forEach((room) => {
      room.measurements.forEach((measurement) => {
        types.add(measurement.name);
      });
    });
    return Array.from(types).sort();
  }, [selectedRooms]);

  // Calculate compliance statistics
  const complianceStats = useMemo(() => {
    const stats = {
      totalMeasurements: 0,
      compliantMeasurements: 0,
      compliancePercentage: 0,
      criticalIssues: 0,
    };

    selectedRooms.forEach((room) => {
      room.measurements.forEach((measurement) => {
        stats.totalMeasurements++;
        if (measurement.isCompliant) {
          stats.compliantMeasurements++;
        } else if (
          measurement.name.toLowerCase().includes("safety") ||
          measurement.name.toLowerCase().includes("critical")
        ) {
          stats.criticalIssues++;
        }
      });
    });

    stats.compliancePercentage =
      stats.totalMeasurements > 0
        ? (stats.compliantMeasurements / stats.totalMeasurements) * 100
        : 0;

    return stats;
  }, [selectedRooms]);

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    if (selectedRoomIds.includes(roomId)) {
      setSelectedRoomIds(selectedRoomIds.filter((id) => id !== roomId));
    } else if (selectedRoomIds.length < 3) {
      // Limit to comparing 3 rooms at a time
      setSelectedRoomIds([...selectedRoomIds, roomId]);
    }
  };

  // Get measurement by name for a specific room
  const getMeasurementByName = (
    room: RoomForComponent,
    name: string,
  ): MeasurementForComponent | undefined => {
    return room.measurements.find((m) => m.name === name);
  };

  // Render compliance indicator
  const renderComplianceIndicator = (isCompliant: boolean | null) => {
    if (isCompliant === null) return <span className="text-gray-400">-</span>;
    return isCompliant ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  // Navigate to room detail
  const handleNavigateToRoom = (roomId: string) => {
    if (onSelectRoom) onSelectRoom(roomId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("Room Comparison Tool")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              {t("Select up to 3 rooms to compare their measurements")}
            </p>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant={
                    selectedRoomIds.includes(room.id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleRoomSelect(room.id)}
                >
                  {room.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedRooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-muted/20 p-3 rounded-md">
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  {t("Compliance Rate")}
                </span>
                <span className="text-2xl font-bold">
                  {Math.round(complianceStats.compliancePercentage)}%
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  {t("Measurements")}
                </span>
                <span className="text-2xl font-bold">
                  {complianceStats.compliantMeasurements}/
                  {complianceStats.totalMeasurements}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  {t("Critical Issues")}
                </span>
                <span className="text-2xl font-bold text-red-500">
                  {complianceStats.criticalIssues}
                </span>
              </div>
            </div>
          )}

          {selectedRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Measurement")}</TableHead>
                  {selectedRooms.map((room) => (
                    <TableHead key={room.id}>
                      <div className="flex flex-col">
                        <span>{room.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {room.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          onClick={() => handleNavigateToRoom(room.id)}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {t("View")}
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMeasurementTypes.map((measurementType) => (
                  <TableRow key={measurementType}>
                    <TableCell className="font-medium">
                      {measurementType}
                    </TableCell>
                    {selectedRooms.map((room) => {
                      const measurement = getMeasurementByName(
                        room,
                        measurementType,
                      );
                      return (
                        <TableCell key={`${room.id}-${measurementType}`}>
                          {measurement ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  measurement.isCompliant === false
                                    ? "text-red-500 font-medium"
                                    : ""
                                }
                              >
                                {measurement.value !== null
                                  ? measurement.value
                                  : "-"}{" "}
                                {measurement.unit}
                                {measurement.standard && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({t("std")}: {measurement.standard})
                                  </span>
                                )}
                              </span>
                              {renderComplianceIndicator(
                                measurement.isCompliant,
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("Select rooms to compare measurements")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomComparisonTool;
