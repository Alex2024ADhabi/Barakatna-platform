import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";

export interface ComparisonItem {
  id: string;
  name: string;
  data: Record<string, any>;
}

export interface ComparisonConfig {
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }>;
}

export interface ComparisonToolProps {
  items: ComparisonItem[];
  config: ComparisonConfig;
  title?: string;
  className?: string;
  maxItems?: number;
  defaultSelectedIds?: string[];
  viewModes?: Array<{
    id: string;
    label: string;
    render: (
      items: ComparisonItem[],
      config: ComparisonConfig,
    ) => React.ReactNode;
  }>;
}

/**
 * ComparisonTool component for side-by-side analysis
 */
export function ComparisonTool({
  items = [],
  config,
  title = "Comparison Tool",
  className = "",
  maxItems = 3,
  defaultSelectedIds = [],
  viewModes = [],
}: ComparisonToolProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultSelectedIds.length > 0
      ? defaultSelectedIds.slice(0, maxItems)
      : items.length > 0
        ? [items[0].id]
        : [],
  );
  const [viewMode, setViewMode] = useState(
    viewModes.length > 0 ? viewModes[0].id : "table",
  );

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const availableItems = items.filter((item) => !selectedIds.includes(item.id));

  const handleAddItem = (itemId: string) => {
    if (selectedIds.length < maxItems) {
      setSelectedIds([...selectedIds, itemId]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== itemId));
  };

  // Default table view
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 border-b">Feature</th>
              {selectedItems.map((item) => (
                <th key={item.id} className="text-left p-2 border-b">
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.fields.map((field) => (
              <tr key={field.key} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{field.label}</td>
                {selectedItems.map((item) => (
                  <td key={`${item.id}-${field.key}`} className="p-2">
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
    );
  };

  // Default cards view
  const renderCardsView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {config.fields.map((field) => (
                  <div key={field.key} className="flex justify-between">
                    <dt className="font-medium text-gray-500">
                      {field.label}:
                    </dt>
                    <dd>
                      {field.render
                        ? field.render(item.data[field.key])
                        : item.data[field.key]?.toString() || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Get current view mode renderer
  const getCurrentViewRenderer = () => {
    const currentMode = viewModes.find((mode) => mode.id === viewMode);
    if (currentMode) {
      return currentMode.render(selectedItems, config);
    }

    // Default views
    return viewMode === "cards" ? renderCardsView() : renderTableView();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Item selector */}
            {selectedIds.length < maxItems && (
              <Select
                value=""
                onValueChange={handleAddItem}
                disabled={availableItems.length === 0}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View mode selector */}
            {(viewModes.length > 0 || true) && (
              <Tabs
                value={viewMode}
                onValueChange={setViewMode}
                className="w-auto"
              >
                <TabsList>
                  {viewModes.length > 0 ? (
                    viewModes.map((mode) => (
                      <TabsTrigger key={mode.id} value={mode.id}>
                        {mode.label}
                      </TabsTrigger>
                    ))
                  ) : (
                    <>
                      <TabsTrigger value="table">Table</TabsTrigger>
                      <TabsTrigger value="cards">Cards</TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Select items to compare
          </div>
        ) : (
          getCurrentViewRenderer()
        )}
      </CardContent>
    </Card>
  );
}
