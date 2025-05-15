import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { DataFilterPanel, FilterOption } from "./DataFilterPanel";
import { DrillDownViewer, DrillDownNode } from "./DrillDownViewer";
import { PieChart } from "./PieChart";
import { LineChart } from "./LineChart";
import { GeospatialViewer, GeoLocation } from "./GeospatialViewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { Download, Share2, Save, Filter, Calculator } from "lucide-react";

export interface DataField {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "location";
  aggregatable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
}

export interface DataRecord {
  id: string;
  [key: string]: any;
}

export interface CalculatedField {
  name: string;
  label: string;
  formula: string;
  dependsOn: string[];
}

export interface DataExplorationToolProps {
  data: DataRecord[];
  fields: DataField[];
  title?: string;
  className?: string;
  onExport?: (data: DataRecord[], format: string) => void;
  onShare?: (viewConfig: any) => void;
  onSave?: (viewConfig: any) => void;
  initialCalculatedFields?: CalculatedField[];
  initialFilters?: Record<string, any>;
  initialGroupBy?: string;
  initialVisualization?: string;
}

/**
 * DataExplorationTool component for ad-hoc data analysis
 */
export function DataExplorationTool({
  data = [],
  fields = [],
  title = "Data Exploration Tool",
  className = "",
  onExport,
  onShare,
  onSave,
  initialCalculatedFields = [],
  initialFilters = {},
  initialGroupBy = "",
  initialVisualization = "table",
}: DataExplorationToolProps) {
  // State for filters, grouping, and visualization
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [groupBy, setGroupBy] = useState<string>(initialGroupBy);
  const [visualization, setVisualization] =
    useState<string>(initialVisualization);
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>(
    initialCalculatedFields,
  );
  const [newCalculation, setNewCalculation] = useState<{
    name: string;
    label: string;
    formula: string;
  }>({ name: "", label: "", formula: "" });
  const [showCalculationEditor, setShowCalculationEditor] = useState(false);
  const [filteredData, setFilteredData] = useState<DataRecord[]>(data);
  const [groupedData, setGroupedData] = useState<any[]>([]);

  // Filter options derived from fields
  const filterOptions: FilterOption[] = fields
    .filter((field) => field.filterable !== false)
    .map((field) => ({
      field: field.name,
      label: field.label,
      type:
        field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : "text",
    }));

  // Apply filters and grouping when dependencies change
  useEffect(() => {
    // Apply filters
    let result = [...data];

    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== "") {
        result = result.filter((item) => {
          const fieldDef = fields.find((f) => f.name === field);
          if (!fieldDef) return true;

          if (fieldDef.type === "number" && typeof value === "object") {
            const { min, max } = value;
            if (min !== undefined && item[field] < min) return false;
            if (max !== undefined && item[field] > max) return false;
            return true;
          }

          if (fieldDef.type === "date" && typeof value === "string") {
            return new Date(item[field]).toISOString().slice(0, 10) === value;
          }

          return String(item[field])
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      }
    });

    setFilteredData(result);

    // Apply grouping
    if (groupBy) {
      const groups: Record<string, DataRecord[]> = {};
      result.forEach((item) => {
        const key = String(item[groupBy] || "Unknown");
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });

      const groupedResult = Object.entries(groups).map(([key, items]) => {
        const aggregates: Record<string, any> = { [groupBy]: key };

        // Calculate aggregates for numeric fields
        fields
          .filter((field) => field.aggregatable && field.type === "number")
          .forEach((field) => {
            const values = items.map((item) => Number(item[field.name] || 0));
            aggregates[`${field.name}_sum`] = values.reduce(
              (sum, val) => sum + val,
              0,
            );
            aggregates[`${field.name}_avg`] = values.length
              ? aggregates[`${field.name}_sum`] / values.length
              : 0;
            aggregates[`${field.name}_count`] = values.length;
          });

        return aggregates;
      });

      setGroupedData(groupedResult);
    } else {
      setGroupedData([]);
    }
  }, [data, filters, groupBy, fields]);

  // Apply calculated fields
  useEffect(() => {
    if (calculatedFields.length === 0) return;

    const applyCalculations = (records: DataRecord[]) => {
      return records.map((record) => {
        const newRecord = { ...record };

        calculatedFields.forEach((calc) => {
          try {
            // Simple formula evaluation (for demo purposes)
            // In a real app, use a proper formula parser/evaluator
            const formula = calc.formula;
            let result = formula;

            calc.dependsOn.forEach((fieldName) => {
              const value = record[fieldName] || 0;
              result = result.replace(
                new RegExp(`\\b${fieldName}\\b`, "g"),
                value,
              );
            });

            // eslint-disable-next-line no-eval
            newRecord[calc.name] = eval(result);
          } catch (error) {
            console.error(`Error calculating ${calc.name}:`, error);
            newRecord[calc.name] = "Error";
          }
        });

        return newRecord;
      });
    };

    setFilteredData(applyCalculations(filteredData));
  }, [calculatedFields, data]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  // Add a new calculated field
  const handleAddCalculation = () => {
    if (!newCalculation.name || !newCalculation.formula) return;

    // Extract field dependencies from formula
    const dependsOn = fields
      .map((field) => field.name)
      .filter((fieldName) =>
        new RegExp(`\\b${fieldName}\\b`).test(newCalculation.formula),
      );

    const newField: CalculatedField = {
      ...newCalculation,
      dependsOn,
    };

    setCalculatedFields([...calculatedFields, newField]);
    setNewCalculation({ name: "", label: "", formula: "" });
    setShowCalculationEditor(false);
  };

  // Export data in selected format
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(filteredData, format);
    } else {
      // Default export behavior
      if (format === "csv") {
        const headers = fields.map((f) => f.name).join(",");
        const rows = filteredData.map((item) =>
          fields.map((f) => JSON.stringify(item[f.name] || "")).join(","),
        );
        const csv = [headers, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/ /g, "_")}_export.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const json = JSON.stringify(filteredData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/ /g, "_")}_export.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  // Save current view configuration
  const handleSave = () => {
    if (onSave) {
      onSave({
        filters,
        groupBy,
        visualization,
        calculatedFields,
      });
    }
  };

  // Share current view
  const handleShare = () => {
    if (onShare) {
      onShare({
        filters,
        groupBy,
        visualization,
        calculatedFields,
      });
    }
  };

  // Render visualization based on selected type
  const renderVisualization = () => {
    const displayData = groupBy ? groupedData : filteredData;

    if (displayData.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          No data to display. Try adjusting your filters.
        </div>
      );
    }

    switch (visualization) {
      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(displayData[0]).map((key) => (
                    <th key={key} className="text-left p-2 border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {Object.values(item).map((value, i) => (
                      <td key={i} className="p-2">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "pie":
        // For pie chart, we need to transform data
        const pieData = displayData.map((item) => ({
          name: String(item[groupBy || Object.keys(item)[0]]),
          value: Number(
            item[
              Object.keys(item).find((k) => k.includes("_sum")) ||
                Object.keys(item)[1]
            ] || 0,
          ),
        }));

        return <PieChart data={pieData} height={400} />;

      case "line":
        // For line chart, assume first column is x-axis and others are series
        const keys = Object.keys(displayData[0]);
        const xKey = keys[0];
        const dataKeys = keys
          .slice(1)
          .filter((k) => typeof displayData[0][k] === "number");

        return (
          <LineChart
            data={displayData}
            xAxisKey={xKey}
            lines={dataKeys.map((key, i) => ({
              dataKey: key,
              name: key,
            }))}
            height={400}
          />
        );

      case "map":
        // For map visualization, we need location data
        const locationField = fields.find((f) => f.type === "location");
        if (!locationField) {
          return (
            <div className="p-4">
              No location data available for map visualization
            </div>
          );
        }

        const locations: GeoLocation[] = filteredData
          .filter((item) => item[locationField.name])
          .map((item, index) => {
            const loc = item[locationField.name];
            return {
              id: String(item.id || index),
              name: String(item.name || `Location ${index}`),
              latitude: loc.latitude || 0,
              longitude: loc.longitude || 0,
              data: item,
            };
          });

        return <GeospatialViewer locations={locations} height={500} />;

      case "drill":
        // For drill-down view, create a hierarchical structure
        const rootNode: DrillDownNode = {
          id: "root",
          name: "All Data",
          children: [],
        };

        if (groupBy) {
          const groups = {};
          filteredData.forEach((item) => {
            const key = String(item[groupBy] || "Unknown");
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item);
          });

          rootNode.children = Object.entries(groups).map(
            ([key, items]: [string, any[]]) => ({
              id: key,
              name: key,
              data: { count: items.length },
              children: items.map((item) => ({
                id: String(item.id),
                name: String(item.name || item.id),
                data: item,
              })),
            }),
          );
        } else {
          rootNode.children = filteredData.map((item) => ({
            id: String(item.id),
            name: String(item.name || item.id),
            data: item,
          }));
        }

        return (
          <DrillDownViewer
            rootNode={rootNode}
            renderContent={(node, drillDown) => (
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">{node.name}</h3>
                {node.children && node.children.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {node.children.map((child) => (
                      <Card
                        key={child.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => drillDown(child.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium">{child.name}</h4>
                          {child.data && (
                            <div className="text-sm text-gray-500 mt-1">
                              {child.data.count
                                ? `${child.data.count} items`
                                : "View details"}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded p-4">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(node.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          />
        );

      default:
        return (
          <div className="p-4 text-center">Select a visualization type</div>
        );
    }
  };

  return (
    <Card className={`${className} bg-white`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Select onValueChange={handleExport}>
              <SelectTrigger className="w-[130px]">
                <Download className="h-4 w-4 mr-1" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="json">Export JSON</SelectItem>
                <SelectItem value="excel">Export Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-3">
            <DataFilterPanel
              title="Filters"
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              compact
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group By</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field to group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Grouping</SelectItem>
                  {fields
                    .filter((field) => field.groupable !== false)
                    .map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Visualization
              </label>
              <Select value={visualization} onValueChange={setVisualization}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visualization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="map">Map</SelectItem>
                  <SelectItem value="drill">Drill Down</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">
                  Calculated Fields
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowCalculationEditor(!showCalculationEditor)
                  }
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {showCalculationEditor ? "Cancel" : "Add"}
                </Button>
              </div>

              {calculatedFields.length > 0 && (
                <div className="text-sm space-y-1 mb-2">
                  {calculatedFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-1 border rounded"
                    >
                      <span>{field.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCalculatedFields(
                            calculatedFields.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showCalculationEditor && (
                <div className="border rounded p-2 space-y-2 mt-2">
                  <Input
                    placeholder="Field name (no spaces)"
                    value={newCalculation.name}
                    onChange={(e) =>
                      setNewCalculation({
                        ...newCalculation,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Display label"
                    value={newCalculation.label}
                    onChange={(e) =>
                      setNewCalculation({
                        ...newCalculation,
                        label: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Formula (e.g., price * quantity)"
                    value={newCalculation.formula}
                    onChange={(e) =>
                      setNewCalculation({
                        ...newCalculation,
                        formula: e.target.value,
                      })
                    }
                  />
                  <Button size="sm" onClick={handleAddCalculation}>
                    Add Field
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-md">{renderVisualization()}</div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {filteredData.length} of {data.length} records
        </div>
      </CardFooter>
    </Card>
  );
}
