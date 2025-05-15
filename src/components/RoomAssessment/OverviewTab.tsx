import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Measurement {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  standard: number;
  isCompliant: boolean | null;
}

interface Recommendation {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedCost: number;
  selected: boolean;
}

interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
}

interface OverviewTabProps {
  measurements: Measurement[];
  recommendations: Recommendation[];
  photos: Photo[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  measurements,
  recommendations,
  photos,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">Measurements</h3>
            <p className="text-sm text-muted-foreground">
              {measurements.filter((m) => m.isCompliant).length} of{" "}
              {measurements.length} compliant
            </p>
            <Progress
              value={
                (measurements.filter((m) => m.isCompliant).length /
                  measurements.length) *
                100
              }
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              {recommendations.filter((r) => r.selected).length} of{" "}
              {recommendations.length} selected
            </p>
            <Progress
              value={
                (recommendations.filter((r) => r.selected).length /
                  recommendations.length) *
                100
              }
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Photos</h3>
            <p className="text-sm text-muted-foreground">
              {photos.length} photos documented
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="font-medium">Estimated Costs</h3>
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span>Selected Modifications:</span>
              <span className="font-medium">
                $
                {recommendations
                  .filter((r) => r.selected)
                  .reduce((sum, r) => sum + r.estimatedCost, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
              <span>All Recommended Modifications:</span>
              <span>
                $
                {recommendations
                  .reduce((sum, r) => sum + r.estimatedCost, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
