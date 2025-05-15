import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Measurement {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  standard: number;
  isCompliant: boolean | null;
}

interface MeasurementsTabProps {
  measurements: Measurement[];
  onMeasurementUpdate: (measurementId: string, value: number) => void;
}

const MeasurementsTab: React.FC<MeasurementsTabProps> = ({
  measurements,
  onMeasurementUpdate,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Measurements</CardTitle>
        <CardDescription>
          Record and compare measurements against accessibility standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {measurements.map((measurement) => (
            <div key={measurement.id} className="border rounded-md p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">{measurement.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">
                      Standard: {measurement.standard} {measurement.unit}
                    </span>
                    {measurement.isCompliant !== null && (
                      <Badge
                        variant={
                          measurement.isCompliant ? "default" : "destructive"
                        }
                      >
                        {measurement.isCompliant
                          ? "Compliant"
                          : "Non-compliant"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-24 p-2 border rounded-md"
                    value={measurement.value || ""}
                    onChange={(e) =>
                      onMeasurementUpdate(
                        measurement.id,
                        parseFloat(e.target.value),
                      )
                    }
                  />
                  <span>{measurement.unit}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Standard requirement: {measurement.standard}{" "}
                          {measurement.unit} or greater
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Measurements
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementsTab;
