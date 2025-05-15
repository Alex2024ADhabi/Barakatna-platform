import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CaseFilter as CaseFilterType } from "@/lib/api/case/types";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface CaseFilterProps {
  onFilter: (filter: CaseFilterType) => void;
  onReset: () => void;
}

export default function CaseFilter({ onFilter, onReset }: CaseFilterProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<CaseFilterType>({
    searchTerm: "",
    status: [],
    priority: [],
    type: [],
    assignedTo: [],
    tags: [],
  });
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  const handleChange = (field: string, value: any) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setFilter((prev) => ({
        ...prev,
        status: [...(prev.status || []), status],
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        status: prev.status?.filter((s) => s !== status) || [],
      }));
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      setFilter((prev) => ({
        ...prev,
        priority: [...(prev.priority || []), priority],
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        priority: prev.priority?.filter((p) => p !== priority) || [],
      }));
    }
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFilter((prev) => ({
        ...prev,
        type: [...(prev.type || []), type],
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        type: prev.type?.filter((t) => t !== type) || [],
      }));
    }
  };

  const handleDateRangeChange = (field: "start" | "end", date?: Date) => {
    setDateRange((prev) => ({ ...prev, [field]: date }));
    if (date) {
      const newDateRange = {
        ...filter.dateRange,
        [field]: date.toISOString(),
      };
      setFilter((prev) => ({ ...prev, dateRange: newDateRange }));
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !filter.tags?.includes(tag.trim())) {
      setFilter((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()],
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFilter((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filter);
  };

  const handleReset = () => {
    setFilter({
      searchTerm: "",
      status: [],
      priority: [],
      type: [],
      assignedTo: [],
      tags: [],
    });
    setDateRange({});
    onReset();
  };

  return (
    <div className="bg-white rounded-lg shadow" dir={dir}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 mr-4">
            <Input
              placeholder={t("Search cases...")}
              value={filter.searchTerm || ""}
              onChange={(e) => handleChange("searchTerm", e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap"
          >
            {isExpanded ? t("Hide Filters") : t("Show Filters")}
          </Button>
        </div>

        {isExpanded && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle>{t("Advanced Filters")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">{t("Status")}</h3>
                    <div className="space-y-2">
                      {[
                        "pending",
                        "in-progress",
                        "completed",
                        "on-hold",
                        "cancelled",
                      ].map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={filter.status?.includes(status) || false}
                            onCheckedChange={(checked) =>
                              handleStatusChange(status, checked as boolean)
                            }
                          />
                          <Label htmlFor={`status-${status}`}>
                            {t(
                              status.charAt(0).toUpperCase() + status.slice(1),
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">{t("Priority")}</h3>
                    <div className="space-y-2">
                      {["low", "medium", "high", "urgent"].map((priority) => (
                        <div
                          key={priority}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={
                              filter.priority?.includes(priority) || false
                            }
                            onCheckedChange={(checked) =>
                              handlePriorityChange(priority, checked as boolean)
                            }
                          />
                          <Label htmlFor={`priority-${priority}`}>
                            {t(
                              priority.charAt(0).toUpperCase() +
                                priority.slice(1),
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">{t("Case Type")}</h3>
                    <div className="space-y-2">
                      {["fdf", "adha", "cash", "other"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filter.type?.includes(type) || false}
                            onCheckedChange={(checked) =>
                              handleTypeChange(type, checked as boolean)
                            }
                          />
                          <Label htmlFor={`type-${type}`}>
                            {type.toUpperCase()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-medium mb-2">{t("Date Range")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t("Start Date")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.start
                                ? format(dateRange.start, "PPP")
                                : t("Select date")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.start}
                              onSelect={(date) =>
                                handleDateRangeChange("start", date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label>{t("End Date")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.end
                                ? format(dateRange.end, "PPP")
                                : t("Select date")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.end}
                              onSelect={(date) =>
                                handleDateRangeChange("end", date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">{t("Tags")}</h3>
                    <div className="flex items-center">
                      <Input
                        placeholder={t("Add a tag")}
                        className="mr-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleTagAdd(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousSibling as HTMLInputElement;
                          handleTagAdd(input.value);
                          input.value = "";
                        }}
                      >
                        {t("Add")}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filter.tags?.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {tag}
                          <X
                            className="ml-2 h-3 w-3 cursor-pointer"
                            onClick={() => handleTagRemove(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                {t("Reset Filters")}
              </Button>
              <Button onClick={handleSubmit}>{t("Apply Filters")}</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
