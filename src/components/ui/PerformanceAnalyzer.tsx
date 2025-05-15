import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import { Progress } from "./progress";
import { Slider } from "./slider";
import { Badge } from "./badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import {
  Activity,
  AlertCircle,
  Clock,
  Zap,
  Users,
  DollarSign,
  BarChart,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

export interface ProcessStep {
  id: string;
  name: string;
  duration: number;
  efficiency: number;
  bottleneck: boolean;
  dependencies: string[];
  resources: string[];
  qualityIssues: string[];
  cost: number;
}

export interface Resource {
  id: string;
  name: string;
  utilization: number;
  capacity: number;
  cost: number;
  skills: string[];
  assignedTo: string[];
}

export interface QualityIssue {
  id: string;
  name: string;
  frequency: number;
  impact: "high" | "medium" | "low";
  relatedSteps: string[];
  potentialSolutions: string[];
}

export interface CostItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  relatedSteps: string[];
  reducibleBy?: number;
}

export interface PerformanceAnalyzerProps {
  processSteps?: ProcessStep[];
  resources?: Resource[];
  qualityIssues?: QualityIssue[];
  costItems?: CostItem[];
  title?: string;
  className?: string;
  onOptimize?: (optimizationConfig: any) => void;
}

/**
 * PerformanceAnalyzer component for process efficiency analysis
 */
export function PerformanceAnalyzer({
  processSteps = [],
  resources = [],
  qualityIssues = [],
  costItems = [],
  title = "Performance Analyzer",
  className = "",
  onOptimize,
}: PerformanceAnalyzerProps) {
  const [activeTab, setActiveTab] = useState("efficiency");
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [optimizationTarget, setOptimizationTarget] = useState<
    "time" | "cost" | "quality"
  >("time");
  const [optimizationLevel, setOptimizationLevel] = useState<number>(50);
  const [optimizationResults, setOptimizationResults] = useState<any | null>(
    null,
  );

  // Calculate overall process metrics
  const calculateProcessMetrics = () => {
    if (processSteps.length === 0)
      return { efficiency: 0, duration: 0, bottlenecks: 0, cost: 0 };

    const totalDuration = processSteps.reduce(
      (sum, step) => sum + step.duration,
      0,
    );
    const weightedEfficiency = processSteps.reduce(
      (sum, step) => sum + step.efficiency * (step.duration / totalDuration),
      0,
    );
    const bottlenecksCount = processSteps.filter(
      (step) => step.bottleneck,
    ).length;
    const totalCost = processSteps.reduce((sum, step) => sum + step.cost, 0);

    return {
      efficiency: Math.round(weightedEfficiency * 100),
      duration: totalDuration,
      bottlenecks: bottlenecksCount,
      cost: totalCost,
    };
  };

  // Calculate resource utilization
  const calculateResourceUtilization = () => {
    if (resources.length === 0) return 0;

    const totalUtilization = resources.reduce(
      (sum, resource) => sum + resource.utilization / resource.capacity,
      0,
    );

    return Math.round((totalUtilization / resources.length) * 100);
  };

  // Calculate quality score
  const calculateQualityScore = () => {
    if (qualityIssues.length === 0) return 100;

    // Lower score for more frequent and higher impact issues
    const qualityDeduction = qualityIssues.reduce((sum, issue) => {
      const impactFactor =
        issue.impact === "high" ? 1 : issue.impact === "medium" ? 0.6 : 0.3;

      return sum + issue.frequency * impactFactor;
    }, 0);

    // Normalize to 0-100 scale
    const normalizedScore = Math.max(0, 100 - qualityDeduction * 10);
    return Math.round(normalizedScore);
  };

  // Calculate cost efficiency
  const calculateCostEfficiency = () => {
    if (costItems.length === 0 || processSteps.length === 0) return 0;

    const totalCost = costItems.reduce((sum, item) => sum + item.amount, 0);
    const reducibleCost = costItems.reduce(
      (sum, item) => sum + (item.reducibleBy || 0),
      0,
    );

    return Math.round((reducibleCost / totalCost) * 100);
  };

  // Process metrics
  const processMetrics = calculateProcessMetrics();
  const resourceUtilization = calculateResourceUtilization();
  const qualityScore = calculateQualityScore();
  const costEfficiency = calculateCostEfficiency();

  // Generate process flow
  const generateProcessFlow = () => {
    // Create a map of steps by ID for quick lookup
    const stepsMap = processSteps.reduce(
      (map, step) => {
        map[step.id] = step;
        return map;
      },
      {} as Record<string, ProcessStep>,
    );

    // Find root steps (those with no dependencies)
    const rootSteps = processSteps.filter(
      (step) =>
        step.dependencies.length === 0 ||
        step.dependencies.every((depId) => !stepsMap[depId]),
    );

    // Build the process flow
    const buildFlow = (steps: ProcessStep[], level = 0): any[] => {
      if (steps.length === 0) return [];

      return steps.map((step) => {
        // Find all steps that depend on this one
        const nextSteps = processSteps.filter((s) =>
          s.dependencies.includes(step.id),
        );

        return {
          ...step,
          level,
          next: buildFlow(nextSteps, level + 1),
        };
      });
    };

    return buildFlow(rootSteps);
  };

  // Handle optimization
  const handleOptimize = () => {
    // Simulate optimization results based on selected parameters
    const optimizeTime = () => {
      const bottlenecks = processSteps.filter((step) => step.bottleneck);
      const improvements = bottlenecks.map((step) => ({
        stepId: step.id,
        stepName: step.name,
        currentDuration: step.duration,
        improvedDuration: Math.round(
          step.duration * (1 - (optimizationLevel / 100) * 0.5),
        ),
        improvement: Math.round((optimizationLevel / 100) * 50) + "%",
        action: `Optimize ${step.name} by adding resources or streamlining the process`,
      }));

      const totalCurrentDuration = processSteps.reduce(
        (sum, step) => sum + step.duration,
        0,
      );
      const totalImprovedDuration = processSteps.reduce((sum, step) => {
        const improved = improvements.find((imp) => imp.stepId === step.id);
        return sum + (improved ? improved.improvedDuration : step.duration);
      }, 0);

      return {
        improvements,
        summary: {
          currentDuration: totalCurrentDuration,
          improvedDuration: totalImprovedDuration,
          improvement:
            Math.round(
              ((totalCurrentDuration - totalImprovedDuration) /
                totalCurrentDuration) *
                100,
            ) + "%",
          impact: `Reduce overall process time by ${Math.round(((totalCurrentDuration - totalImprovedDuration) / totalCurrentDuration) * 100)}%`,
        },
      };
    };

    const optimizeCost = () => {
      const reducibleCosts = costItems.filter(
        (item) => item.reducibleBy && item.reducibleBy > 0,
      );
      const improvements = reducibleCosts.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        currentCost: item.amount,
        improvedCost: Math.round(
          item.amount *
            (1 - ((item.reducibleBy || 0) * (optimizationLevel / 100)) / 100),
        ),
        improvement:
          Math.round((item.reducibleBy || 0) * (optimizationLevel / 100)) + "%",
        action: `Reduce ${item.name} costs by optimizing related processes`,
      }));

      const totalCurrentCost = costItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const totalImprovedCost = costItems.reduce((sum, item) => {
        const improved = improvements.find((imp) => imp.itemId === item.id);
        return sum + (improved ? improved.improvedCost : item.amount);
      }, 0);

      return {
        improvements,
        summary: {
          currentCost: totalCurrentCost,
          improvedCost: totalImprovedCost,
          improvement:
            Math.round(
              ((totalCurrentCost - totalImprovedCost) / totalCurrentCost) * 100,
            ) + "%",
          impact: `Reduce overall costs by ${Math.round(((totalCurrentCost - totalImprovedCost) / totalCurrentCost) * 100)}%`,
        },
      };
    };

    const optimizeQuality = () => {
      const highImpactIssues = qualityIssues.filter(
        (issue) => issue.impact === "high" || issue.impact === "medium",
      );
      const improvements = highImpactIssues.map((issue) => ({
        issueId: issue.id,
        issueName: issue.name,
        currentFrequency: issue.frequency,
        improvedFrequency: Math.round(
          issue.frequency * (1 - (optimizationLevel / 100) * 0.7),
        ),
        improvement: Math.round((optimizationLevel / 100) * 70) + "%",
        action:
          issue.potentialSolutions[0] || `Address root causes of ${issue.name}`,
      }));

      const currentQualityScore = qualityScore;
      const improvedQualityScore = Math.min(
        100,
        currentQualityScore + Math.round((optimizationLevel / 100) * 30),
      );

      return {
        improvements,
        summary: {
          currentQualityScore,
          improvedQualityScore,
          improvement: improvedQualityScore - currentQualityScore + " points",
          impact: `Increase quality score from ${currentQualityScore} to ${improvedQualityScore}`,
        },
      };
    };

    let results;
    switch (optimizationTarget) {
      case "time":
        results = optimizeTime();
        break;
      case "cost":
        results = optimizeCost();
        break;
      case "quality":
        results = optimizeQuality();
        break;
    }

    setOptimizationResults(results);

    if (onOptimize) {
      onOptimize({
        target: optimizationTarget,
        level: optimizationLevel,
        results,
      });
    }
  };

  // Render process flow visualization
  const renderProcessFlow = () => {
    const flow = generateProcessFlow();

    const renderStep = (step: any, index: number) => {
      const isSelected = selectedStep === step.id;
      const hasBottleneck = step.bottleneck;

      return (
        <div key={step.id} className="relative">
          <div
            className={`
              p-3 rounded-md border transition-all
              ${isSelected ? "border-blue-500 shadow-md" : "border-gray-200"}
              ${hasBottleneck ? "bg-red-50" : "bg-white"}
              cursor-pointer hover:border-blue-300
            `}
            onClick={() => setSelectedStep(step.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{step.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Duration: {step.duration} min
                </div>
              </div>
              {hasBottleneck && (
                <Badge variant="destructive" className="ml-2">
                  Bottleneck
                </Badge>
              )}
            </div>
            <Progress
              value={step.efficiency * 100}
              className="mt-2"
              indicatorColor={
                step.efficiency > 0.7
                  ? "bg-green-600"
                  : step.efficiency > 0.4
                    ? "bg-amber-500"
                    : "bg-red-500"
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              Efficiency: {Math.round(step.efficiency * 100)}%
            </div>
          </div>

          {step.next && step.next.length > 0 && (
            <div className="flex items-center justify-center my-2">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          )}

          {step.next && step.next.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {step.next.map((nextStep: any, nextIndex: number) =>
                renderStep(nextStep, nextIndex),
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {flow.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {flow.map((step, index) => renderStep(step, index))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No process steps defined
          </div>
        )}
      </div>
    );
  };

  // Render step details when selected
  const renderStepDetails = () => {
    if (!selectedStep) return null;

    const step = processSteps.find((s) => s.id === selectedStep);
    if (!step) return null;

    const stepResources = resources.filter((r) =>
      step.resources.includes(r.id),
    );
    const stepQualityIssues = qualityIssues.filter((i) =>
      i.relatedSteps.includes(step.id),
    );
    const stepCosts = costItems.filter((c) => c.relatedSteps.includes(step.id));

    return (
      <div className="border rounded-md p-4 mt-4">
        <h3 className="text-lg font-medium mb-4">{step.name} Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Efficiency</span>
                  <span>{Math.round(step.efficiency * 100)}%</span>
                </div>
                <Progress value={step.efficiency * 100} className="mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{step.duration} min</span>
                </div>
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <div className="text-sm">
                    {step.duration > 30 ? "Long duration" : "Normal duration"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Cost</span>
                  <span>${step.cost}</span>
                </div>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                  <div className="text-sm">
                    {step.cost > 1000 ? "High cost" : "Normal cost"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Resources</h4>
            {stepResources.length > 0 ? (
              <div className="space-y-2">
                {stepResources.map((resource) => (
                  <div key={resource.id} className="border rounded p-2">
                    <div className="font-medium">{resource.name}</div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Utilization</span>
                      <span>
                        {Math.round(
                          (resource.utilization / resource.capacity) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(resource.utilization / resource.capacity) * 100}
                      className="mt-1"
                      indicatorColor={
                        resource.utilization / resource.capacity > 0.9
                          ? "bg-red-600"
                          : resource.utilization / resource.capacity > 0.7
                            ? "bg-amber-500"
                            : "bg-green-600"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No resources assigned</div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Quality Issues</h4>
          {stepQualityIssues.length > 0 ? (
            <div className="space-y-2">
              {stepQualityIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start border rounded p-2"
                >
                  <div
                    className={`p-1 rounded-full mr-2 ${issue.impact === "high" ? "bg-red-100" : issue.impact === "medium" ? "bg-amber-100" : "bg-blue-100"}`}
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${issue.impact === "high" ? "text-red-600" : issue.impact === "medium" ? "text-amber-600" : "text-blue-600"}`}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{issue.name}</div>
                    <div className="text-sm text-gray-500">
                      Frequency: {issue.frequency} per 100 units
                    </div>
                    {issue.potentialSolutions.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Solution: </span>
                        {issue.potentialSolutions[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No quality issues reported
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render optimization results
  const renderOptimizationResults = () => {
    if (!optimizationResults) return null;

    return (
      <div className="border rounded-md p-4 mt-6">
        <h3 className="text-lg font-medium mb-4">Optimization Results</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="font-medium text-blue-800">Summary</div>
          <div className="text-sm text-blue-700 mt-1">
            {optimizationResults.summary.impact}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm">
              <span className="text-gray-600">Improvement: </span>
              <span className="font-medium">
                {optimizationResults.summary.improvement}
              </span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {optimizationTarget === "time"
                ? "Time Optimization"
                : optimizationTarget === "cost"
                  ? "Cost Optimization"
                  : "Quality Optimization"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recommended Actions</h4>
          {optimizationResults.improvements.map(
            (improvement: any, index: number) => (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between">
                  <div className="font-medium">
                    {improvement.stepName ||
                      improvement.itemName ||
                      improvement.issueName}
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {improvement.improvement} improvement
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {improvement.action}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Current: </span>
                    <span>
                      {optimizationTarget === "time"
                        ? `${improvement.currentDuration} min`
                        : optimizationTarget === "cost"
                          ? `$${improvement.currentCost}`
                          : `${improvement.currentFrequency} per 100`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Improved: </span>
                    <span className="text-green-600 font-medium">
                      {optimizationTarget === "time"
                        ? `${improvement.improvedDuration} min`
                        : optimizationTarget === "cost"
                          ? `$${improvement.improvedCost}`
                          : `${improvement.improvedFrequency} per 100`}
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`${className} bg-white`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Process Efficiency
              </div>
              <div className="flex items-center mt-1">
                <div className="text-3xl font-bold">
                  {processMetrics.efficiency}%
                </div>
                <div
                  className={`ml-2 text-sm ${processMetrics.efficiency >= 80 ? "text-green-600" : processMetrics.efficiency >= 60 ? "text-amber-600" : "text-red-600"}`}
                >
                  {processMetrics.efficiency >= 80
                    ? "Good"
                    : processMetrics.efficiency >= 60
                      ? "Average"
                      : "Poor"}
                </div>
              </div>
              <Progress
                value={processMetrics.efficiency}
                className="mt-2"
                indicatorColor={
                  processMetrics.efficiency >= 80
                    ? "bg-green-600"
                    : processMetrics.efficiency >= 60
                      ? "bg-amber-500"
                      : "bg-red-600"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Resource Utilization
              </div>
              <div className="flex items-center mt-1">
                <div className="text-3xl font-bold">{resourceUtilization}%</div>
                <div
                  className={`ml-2 text-sm ${resourceUtilization <= 85 && resourceUtilization >= 60 ? "text-green-600" : resourceUtilization > 85 ? "text-amber-600" : "text-red-600"}`}
                >
                  {resourceUtilization <= 85 && resourceUtilization >= 60
                    ? "Optimal"
                    : resourceUtilization > 85
                      ? "Over-utilized"
                      : "Under-utilized"}
                </div>
              </div>
              <Progress
                value={resourceUtilization}
                className="mt-2"
                indicatorColor={
                  resourceUtilization <= 85 && resourceUtilization >= 60
                    ? "bg-green-600"
                    : resourceUtilization > 85
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Quality Score
              </div>
              <div className="flex items-center mt-1">
                <div className="text-3xl font-bold">{qualityScore}</div>
                <div
                  className={`ml-2 text-sm ${qualityScore >= 80 ? "text-green-600" : qualityScore >= 60 ? "text-amber-600" : "text-red-600"}`}
                >
                  {qualityScore >= 80
                    ? "High"
                    : qualityScore >= 60
                      ? "Medium"
                      : "Low"}
                </div>
              </div>
              <Progress
                value={qualityScore}
                className="mt-2"
                indicatorColor={
                  qualityScore >= 80
                    ? "bg-green-600"
                    : qualityScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-600"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Cost Efficiency
              </div>
              <div className="flex items-center mt-1">
                <div className="text-3xl font-bold">{costEfficiency}%</div>
                <div
                  className={`ml-2 text-sm ${costEfficiency >= 15 ? "text-green-600" : costEfficiency >= 5 ? "text-amber-600" : "text-gray-600"}`}
                >
                  {costEfficiency >= 15
                    ? "High savings"
                    : costEfficiency >= 5
                      ? "Moderate savings"
                      : "Low savings"}
                </div>
              </div>
              <Progress
                value={costEfficiency}
                className="mt-2"
                indicatorColor={
                  costEfficiency >= 15
                    ? "bg-green-600"
                    : costEfficiency >= 5
                      ? "bg-amber-500"
                      : "bg-gray-400"
                }
              />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="efficiency">
              <Activity className="h-4 w-4 mr-2" />
              Process Efficiency
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Users className="h-4 w-4 mr-2" />
              Resource Allocation
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <Zap className="h-4 w-4 mr-2" />
              Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="efficiency" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Process Flow</h3>
                <div className="flex items-center text-sm">
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>High Efficiency</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                    <span>Medium Efficiency</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span>Low Efficiency</span>
                  </div>
                </div>
              </div>

              {renderProcessFlow()}
              {renderStepDetails()}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resource Allocation</h3>

              {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <div className="text-sm text-gray-500 mt-1">
                              Cost: ${resource.cost} | Capacity:{" "}
                              {resource.capacity} units
                            </div>
                          </div>
                          <Badge
                            className={
                              resource.utilization / resource.capacity > 0.9
                                ? "bg-red-100 text-red-800"
                                : resource.utilization / resource.capacity > 0.7
                                  ? "bg-amber-100 text-amber-800"
                                  : resource.utilization / resource.capacity <
                                      0.4
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                            }
                          >
                            {resource.utilization / resource.capacity > 0.9
                              ? "Overloaded"
                              : resource.utilization / resource.capacity > 0.7
                                ? "High Load"
                                : resource.utilization / resource.capacity < 0.4
                                  ? "Underutilized"
                                  : "Optimal"}
                          </Badge>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm">
                            <span>Utilization</span>
                            <span>
                              {Math.round(
                                (resource.utilization / resource.capacity) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (resource.utilization / resource.capacity) * 100
                            }
                            className="mt-1"
                            indicatorColor={
                              resource.utilization / resource.capacity > 0.9
                                ? "bg-red-600"
                                : resource.utilization / resource.capacity > 0.7
                                  ? "bg-amber-500"
                                  : resource.utilization / resource.capacity <
                                      0.4
                                    ? "bg-blue-500"
                                    : "bg-green-600"
                            }
                          />
                        </div>

                        {resource.assignedTo.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium">
                              Assigned to:
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {resource.assignedTo.map((stepId) => {
                                const step = processSteps.find(
                                  (s) => s.id === stepId,
                                );
                                return step ? (
                                  <Badge key={stepId} variant="outline">
                                    {step.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No resources defined
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="mt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Optimization Settings</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Optimization Target
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={
                          optimizationTarget === "time" ? "default" : "outline"
                        }
                        onClick={() => setOptimizationTarget("time")}
                        className="flex items-center justify-center"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Time
                      </Button>
                      <Button
                        variant={
                          optimizationTarget === "cost" ? "default" : "outline"
                        }
                        onClick={() => setOptimizationTarget("cost")}
                        className="flex items-center justify-center"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cost
                      </Button>
                      <Button
                        variant={
                          optimizationTarget === "quality"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setOptimizationTarget("quality")}
                        className="flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Quality
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        Optimization Level
                      </label>
                      <span className="text-sm">{optimizationLevel}%</span>
                    </div>
                    <Slider
                      value={[optimizationLevel]}
                      min={10}
                      max={100}
                      step={10}
                      onValueChange={(value) => setOptimizationLevel(value[0])}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  <Button onClick={handleOptimize} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Optimization Plan
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Optimization Focus
                  </h3>

                  {optimizationTarget === "time" && (
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-amber-100 mr-3">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Time Optimization</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Focus on reducing process duration by identifying
                            and addressing bottlenecks. This will improve
                            overall throughput and reduce cycle time.
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm font-medium mb-2">
                          Current Bottlenecks
                        </div>
                        {processSteps.filter((step) => step.bottleneck).length >
                        0 ? (
                          <div className="space-y-2">
                            {processSteps
                              .filter((step) => step.bottleneck)
                              .map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center"
                                >
                                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                  <span>
                                    {step.name} - {step.duration} min
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No bottlenecks identified
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {optimizationTarget === "cost" && (
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Cost Optimization</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Focus on reducing operational costs by identifying
                            inefficiencies and optimizing resource allocation.
                            This will improve profitability and ROI.
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm font-medium mb-2">
                          Cost Reduction Opportunities
                        </div>
                        {costItems.filter(
                          (item) => item.reducibleBy && item.reducibleBy > 0,
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {costItems
                              .filter(
                                (item) =>
                                  item.reducibleBy && item.reducibleBy > 0,
                              )
                              .sort(
                                (a, b) =>
                                  (b.reducibleBy || 0) - (a.reducibleBy || 0),
                              )
                              .slice(0, 3)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    <span>{item.name}</span>
                                  </div>
                                  <span className="text-green-600">
                                    Up to {item.reducibleBy}% savings
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No cost reduction opportunities identified
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {optimizationTarget === "quality" && (
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-blue-100 mr-3">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Quality Optimization</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Focus on improving output quality by addressing
                            quality issues and implementing best practices. This
                            will enhance customer satisfaction and reduce
                            rework.
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm font-medium mb-2">
                          Quality Issues
                        </div>
                        {qualityIssues.filter(
                          (issue) => issue.impact === "high",
                        ).length > 0 ? (
                          <div className="space-y-2">
                            {qualityIssues
                              .filter((issue) => issue.impact === "high")
                              .sort((a, b) => b.frequency - a.frequency)
                              .slice(0, 3)
                              .map((issue) => (
                                <div
                                  key={issue.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                                    <span>{issue.name}</span>
                                  </div>
                                  <span className="text-red-600">
                                    {issue.frequency} per 100 units
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No high-impact quality issues identified
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {renderOptimizationResults()}
            </div>
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

export default PerformanceAnalyzer;
