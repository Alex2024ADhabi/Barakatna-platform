import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import {
  ComparisonTool,
  ComparisonItem,
  ComparisonConfig,
} from "./ComparisonTool";
import { LineChart } from "./LineChart";
import { TimelineExplorer } from "./TimelineExplorer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { Badge } from "./badge";
import {
  Lightbulb,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

export interface BenchmarkMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  weight?: number;
  trend?: number[];
  trendLabels?: string[];
  bestPracticeThreshold?: number;
  improvementSuggestion?: string;
}

export interface PeerGroup {
  id: string;
  name: string;
  metrics: Record<string, number>;
}

export interface BenchmarkingToolProps {
  metrics: BenchmarkMetric[];
  peerGroups?: PeerGroup[];
  historicalData?: Array<{
    date: Date | string;
    metrics: Record<string, number>;
  }>;
  title?: string;
  className?: string;
  onGenerateRecommendations?: () => void;
  bestPractices?: Array<{
    id: string;
    title: string;
    description: string;
    relatedMetrics: string[];
    impact: "high" | "medium" | "low";
  }>;
}

/**
 * BenchmarkingTool component for performance comparison
 */
export function BenchmarkingTool({
  metrics = [],
  peerGroups = [],
  historicalData = [],
  title = "Benchmarking Tool",
  className = "",
  onGenerateRecommendations,
  bestPractices = [],
}: BenchmarkingToolProps) {
  const [activeTab, setActiveTab] = useState("performance");
  const [selectedPeerGroups, setSelectedPeerGroups] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<
    Array<{
      metric: string;
      suggestion: string;
      impact: "high" | "medium" | "low";
    }>
  >([]);

  // Calculate overall score
  const calculateScore = () => {
    if (metrics.length === 0) return 0;

    const totalWeight = metrics.reduce(
      (sum, metric) => sum + (metric.weight || 1),
      0,
    );
    const weightedSum = metrics.reduce((sum, metric) => {
      const ratio = metric.value / metric.target;
      const score = ratio > 1 ? 100 : ratio * 100;
      return sum + score * (metric.weight || 1);
    }, 0);

    return Math.round(weightedSum / totalWeight);
  };

  // Generate recommendations based on metrics
  useEffect(() => {
    const generateRecommendations = () => {
      const newRecommendations = metrics
        .filter((metric) => metric.value < metric.target * 0.9) // Focus on metrics below 90% of target
        .map((metric) => {
          // Find related best practices
          const relatedPractice = bestPractices.find((practice) =>
            practice.relatedMetrics.includes(metric.id),
          );

          return {
            metric: metric.name,
            suggestion:
              metric.improvementSuggestion ||
              (relatedPractice
                ? relatedPractice.description
                : `Consider reviewing your ${metric.name.toLowerCase()} processes to improve performance.`),
            impact:
              relatedPractice?.impact ||
              ("medium" as "high" | "medium" | "low"),
          };
        });

      setRecommendations(newRecommendations);
    };

    generateRecommendations();
  }, [metrics, bestPractices]);

  // Prepare data for comparison tool
  const comparisonItems: ComparisonItem[] = [
    {
      id: "current",
      name: "Current Performance",
      data: metrics.reduce(
        (acc, metric) => {
          acc[metric.id] = metric.value;
          return acc;
        },
        {} as Record<string, any>,
      ),
    },
    {
      id: "target",
      name: "Target Performance",
      data: metrics.reduce(
        (acc, metric) => {
          acc[metric.id] = metric.target;
          return acc;
        },
        {} as Record<string, any>,
      ),
    },
    ...peerGroups
      .filter((peer) => selectedPeerGroups.includes(peer.id))
      .map((peer) => ({
        id: peer.id,
        name: peer.name,
        data: peer.metrics,
      })),
  ];

  const comparisonConfig: ComparisonConfig = {
    fields: metrics.map((metric) => ({
      key: metric.id,
      label: metric.name,
      render: (value: any) => (
        <div className="flex items-center">
          <span>
            {value} {metric.unit}
          </span>
          {value !== undefined && metric.target !== undefined && (
            <Badge
              className={`ml-2 ${value >= metric.target ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {value >= metric.target ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {Math.round((value / metric.target) * 100)}%
            </Badge>
          )}
        </div>
      ),
    })),
  };

  // Prepare data for historical trends
  const trendData = historicalData.map((point) => {
    const data: Record<string, any> = {
      date: point.date instanceof Date ? point.date : new Date(point.date),
    };

    Object.entries(point.metrics).forEach(([key, value]) => {
      data[key] = value;
    });

    return data;
  });

  // Prepare timeline events for significant changes
  const timelineEvents = historicalData
    .map((point, index) => {
      if (index === 0) return null;

      const prevPoint = historicalData[index - 1];
      const significantChanges = Object.entries(point.metrics).filter(
        ([key, value]) => {
          const prevValue = prevPoint.metrics[key];
          const metric = metrics.find((m) => m.id === key);
          if (!metric || !prevValue) return false;

          // Check if there was a significant change (>10%)
          const change = Math.abs((value - prevValue) / prevValue);
          return change > 0.1;
        },
      );

      if (significantChanges.length === 0) return null;

      return {
        id: `event-${index}`,
        title: `Significant change in ${significantChanges.length} metrics`,
        description: significantChanges
          .map(([key, value]) => {
            const prevValue = prevPoint.metrics[key];
            const metric = metrics.find((m) => m.id === key);
            const change = ((value - prevValue) / prevValue) * 100;
            return `${metric?.name}: ${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
          })
          .join("\n"),
        date: point.date,
        importance: significantChanges.length,
      };
    })
    .filter(Boolean) as any[];

  // Render performance indicators
  const renderPerformanceIndicators = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">
              Overall Score
            </div>
            <div className="flex items-center mt-1">
              <div className="text-3xl font-bold">{calculateScore()}%</div>
              <div
                className={`ml-2 text-sm ${calculateScore() >= 80 ? "text-green-600" : calculateScore() >= 60 ? "text-amber-600" : "text-red-600"}`}
              >
                {calculateScore() >= 80
                  ? "Good"
                  : calculateScore() >= 60
                    ? "Average"
                    : "Needs Improvement"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">
              Metrics on Target
            </div>
            <div className="flex items-center mt-1">
              <div className="text-3xl font-bold">
                {metrics.filter((m) => m.value >= m.target).length}/
                {metrics.length}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                {Math.round(
                  (metrics.filter((m) => m.value >= m.target).length /
                    metrics.length) *
                    100,
                )}
                %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">
              Best Performing
            </div>
            {metrics.length > 0 ? (
              <div className="mt-1">
                <div className="text-lg font-medium">
                  {
                    metrics.reduce((best, metric) =>
                      metric.value / metric.target > best.value / best.target
                        ? metric
                        : best,
                    ).name
                  }
                </div>
                <div className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {Math.round(
                    (metrics.reduce((best, metric) =>
                      metric.value / metric.target > best.value / best.target
                        ? metric
                        : best,
                    ).value /
                      metrics.reduce((best, metric) =>
                        metric.value / metric.target > best.value / best.target
                          ? metric
                          : best,
                      ).target) *
                      100,
                  )}
                  % of target
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-1">
                No metrics available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-500">
              Needs Improvement
            </div>
            {metrics.length > 0 ? (
              <div className="mt-1">
                <div className="text-lg font-medium">
                  {
                    metrics.reduce((worst, metric) =>
                      metric.value / metric.target < worst.value / worst.target
                        ? metric
                        : worst,
                    ).name
                  }
                </div>
                <div className="text-sm text-red-600 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.round(
                    (metrics.reduce((worst, metric) =>
                      metric.value / metric.target < worst.value / worst.target
                        ? metric
                        : worst,
                    ).value /
                      metrics.reduce((worst, metric) =>
                        metric.value / metric.target <
                        worst.value / worst.target
                          ? metric
                          : worst,
                      ).target) *
                      100,
                  )}
                  % of target
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-1">
                No metrics available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className={`${className} bg-white`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            {peerGroups.length > 0 && (
              <Select
                value={selectedPeerGroups.join(",")}
                onValueChange={(value) =>
                  setSelectedPeerGroups(value ? value.split(",") : [])
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Compare with peers" />
                </SelectTrigger>
                <SelectContent>
                  {peerGroups.map((peer) => (
                    <SelectItem key={peer.id} value={peer.id}>
                      {peer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              onClick={
                onGenerateRecommendations ||
                (() => setActiveTab("recommendations"))
              }
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Recommendations
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderPerformanceIndicators()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
            <TabsTrigger value="bestPractices">Best Practices</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <ComparisonTool
              items={comparisonItems}
              config={comparisonConfig}
              title="Performance Comparison"
              maxItems={5}
              defaultSelectedIds={["current", "target"]}
              viewModes={[
                {
                  id: "table",
                  label: "Table",
                  render: (items, config) => (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left p-2 border-b">Metric</th>
                            {items.map((item) => (
                              <th
                                key={item.id}
                                className="text-left p-2 border-b"
                              >
                                {item.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {config.fields.map((field) => (
                            <tr
                              key={field.key}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2 font-medium">{field.label}</td>
                              {items.map((item) => (
                                <td
                                  key={`${item.id}-${field.key}`}
                                  className="p-2"
                                >
                                  {field.render
                                    ? field.render(item.data[field.key])
                                    : item.data[field.key]?.toString() || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ),
                },
                {
                  id: "radar",
                  label: "Radar Chart",
                  render: (items, config) => (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        Radar chart visualization would be displayed here
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            {historicalData.length > 0 ? (
              <div className="space-y-6">
                <TimelineExplorer
                  data={trendData}
                  events={timelineEvents}
                  dateKey="date"
                  series={metrics.map((metric) => ({
                    id: metric.id,
                    name: metric.name,
                    color:
                      metric.value >= metric.target ? "#10b981" : "#ef4444",
                  }))}
                  height={400}
                  title="Performance Trends"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.slice(0, 4).map((metric) => (
                    <Card key={metric.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {metric.name} Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <LineChart
                          data={trendData}
                          xAxisKey="date"
                          lines={[
                            {
                              dataKey: metric.id,
                              name: metric.name,
                              color:
                                metric.value >= metric.target
                                  ? "#10b981"
                                  : "#ef4444",
                            },
                          ]}
                          height={200}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No historical data available for trend analysis
              </div>
            )}
          </TabsContent>

          <TabsContent value="bestPractices" className="mt-4">
            {bestPractices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bestPractices.map((practice) => (
                  <Card key={practice.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {practice.title}
                        </CardTitle>
                        <Badge
                          className={`${practice.impact === "high" ? "bg-green-100 text-green-800" : practice.impact === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {practice.impact === "high"
                            ? "High Impact"
                            : practice.impact === "medium"
                              ? "Medium Impact"
                              : "Low Impact"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {practice.description}
                      </p>
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-500">
                          Related Metrics:
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {practice.relatedMetrics.map((metricId) => {
                            const metric = metrics.find(
                              (m) => m.id === metricId,
                            );
                            return metric ? (
                              <Badge key={metricId} variant="outline">
                                {metric.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No best practices available
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div
                          className={`p-2 rounded-full mr-4 ${rec.impact === "high" ? "bg-red-100" : rec.impact === "medium" ? "bg-amber-100" : "bg-blue-100"}`}
                        >
                          {rec.impact === "high" ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : rec.impact === "medium" ? (
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                          ) : (
                            <Lightbulb className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{rec.metric}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {rec.suggestion}
                          </p>
                          <div className="flex items-center mt-2">
                            <Badge
                              className={`${rec.impact === "high" ? "bg-red-100 text-red-800" : rec.impact === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                            >
                              {rec.impact === "high"
                                ? "High Priority"
                                : rec.impact === "medium"
                                  ? "Medium Priority"
                                  : "Low Priority"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recommendations available. All metrics are performing well!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}
