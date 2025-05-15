import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Save } from "lucide-react";

interface Recommendation {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedCost: number;
  selected: boolean;
}

interface RecommendationsTabProps {
  recommendations: Recommendation[];
  onRecommendationToggle: (recommendationId: string) => void;
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  recommendations,
  onRecommendationToggle,
}) => {
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Modifications</CardTitle>
        <CardDescription>
          Select modifications to include in the assessment report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`border rounded-md p-4 ${recommendation.selected ? "border-primary bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {recommendation.description}
                    </h3>
                    <Badge
                      variant={getPriorityColor(recommendation.priority) as any}
                    >
                      {recommendation.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Estimated cost: $
                    {recommendation.estimatedCost.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant={recommendation.selected ? "default" : "outline"}
                  onClick={() => onRecommendationToggle(recommendation.id)}
                >
                  {recommendation.selected ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div>
            <p className="font-medium">
              Total Selected: $
              {recommendations
                .filter((r) => r.selected)
                .reduce((sum, r) => sum + r.estimatedCost, 0)
                .toLocaleString()}
            </p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsTab;
