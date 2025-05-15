import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { Filter, Plus, X } from "lucide-react";

export interface FilterOption {
  field: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
}

export interface DataFilterPanelProps {
  title?: string;
  filterOptions: FilterOption[];
  initialFilters?: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  compact?: boolean;
  className?: string;
}

export function DataFilterPanel({
  title = "Filters",
  filterOptions = [],
  initialFilters = {},
  onFilterChange,
  compact = false,
  className = "",
}: DataFilterPanelProps) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [activeFilters, setActiveFilters] = useState<string[]>(
    Object.keys(initialFilters),
  );

  // Handle adding a new filter
  const handleAddFilter = (field: string) => {
    if (activeFilters.includes(field)) return;
    setActiveFilters([...activeFilters, field]);
  };

  // Handle removing a filter
  const handleRemoveFilter = (field: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== field));
    const newFilters = { ...filters };
    delete newFilters[field];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle filter value change
  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Render filter input based on type
  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.field] || "";

    switch (option.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleFilterChange(option.field, e.target.value)}
            placeholder={`Filter by ${option.label}`}
            className="w-full"
          />
        );

      case "number":
        if (typeof value === "object" && value !== null) {
          // Range filter
          return (
            <div className="flex space-x-2">
              <Input
                type="number"
                value={value.min || ""}
                onChange={(e) =>
                  handleFilterChange(option.field, {
                    ...value,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Min"
                className="w-full"
              />
              <Input
                type="number"
                value={value.max || ""}
                onChange={(e) =>
                  handleFilterChange(option.field, {
                    ...value,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Max"
                className="w-full"
              />
            </div>
          );
        } else {
          return (
            <div className="flex space-x-2">
              <Select value="equals" onValueChange={() => {}} disabled>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={value}
                onChange={(e) =>
                  handleFilterChange(option.field, Number(e.target.value))
                }
                placeholder={`Filter by ${option.label}`}
                className="w-full"
              />
            </div>
          );
        }

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(option.field, e.target.value)}
            className="w-full"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(value) => handleFilterChange(option.field, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  // Render available filter options
  const renderFilterOptions = () => {
    const availableOptions = filterOptions.filter(
      (option) => !activeFilters.includes(option.field),
    );

    if (availableOptions.length === 0) return null;

    return (
      <div className="mt-2">
        <Select onValueChange={handleAddFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add filter" />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option.field} value={option.field}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Render active filters
  const renderActiveFilters = () => {
    if (activeFilters.length === 0) {
      return (
        <div className="text-center py-2 text-gray-500 text-sm">
          No filters applied
        </div>
      );
    }

    return (
      <div className={`space-y-3 ${compact ? "" : "mt-4"}}`}>
        {activeFilters.map((field) => {
          const option = filterOptions.find((opt) => opt.field === field);
          if (!option) return null;

          return (
            <div key={field} className="flex items-center space-x-2">
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">{option.label}</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveFilter(field)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {renderFilterInput(option)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              const firstAvailable = filterOptions.find(
                (option) => !activeFilters.includes(option.field),
              );
              if (firstAvailable) handleAddFilter(firstAvailable.field);
            }}
            disabled={activeFilters.length === filterOptions.length}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Filter
          </Button>
        </div>
        {renderActiveFilters()}
        {activeFilters.length < filterOptions.length && renderFilterOptions()}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderActiveFilters()}
        {activeFilters.length < filterOptions.length && renderFilterOptions()}
      </CardContent>
    </Card>
  );
}
