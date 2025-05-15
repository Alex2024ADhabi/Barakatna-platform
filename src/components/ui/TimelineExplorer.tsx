import React, { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  category?: string;
  importance?: number;
  color?: string;
}

export interface TimelineData {
  date: Date | string;
  [key: string]: any;
}

export interface TimelineExplorerProps {
  data: TimelineData[];
  events?: TimelineEvent[];
  title?: string;
  className?: string;
  dateKey?: string;
  series: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  initialStartDate?: Date | string;
  initialEndDate?: Date | string;
  onRangeChange?: (start: Date, end: Date) => void;
  height?: number;
}

/**
 * TimelineExplorer component for chronological analysis
 */
export function TimelineExplorer({
  data = [],
  events = [],
  title = "Timeline Explorer",
  className = "",
  dateKey = "date",
  series = [],
  initialStartDate,
  initialEndDate,
  onRangeChange,
  height = 400,
}: TimelineExplorerProps) {
  // Process data to ensure dates are Date objects
  const processedData = data.map((item) => ({
    ...item,
    [dateKey]:
      item[dateKey] instanceof Date ? item[dateKey] : new Date(item[dateKey]),
  }));

  // Sort data by date
  processedData.sort((a, b) => {
    return new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime();
  });

  // Process events
  const processedEvents = events.map((event) => ({
    ...event,
    date: event.date instanceof Date ? event.date : new Date(event.date),
  }));

  // Determine min and max dates from data
  const allDates = processedData.map((item) =>
    new Date(item[dateKey]).getTime(),
  );
  const minDate = initialStartDate
    ? new Date(initialStartDate).getTime()
    : Math.min(...allDates);
  const maxDate = initialEndDate
    ? new Date(initialEndDate).getTime()
    : Math.max(...allDates);

  // State for zoom functionality
  const [dateRange, setDateRange] = useState<[number, number]>([
    minDate,
    maxDate,
  ]);
  const [zoomArea, setZoomArea] = useState<{
    x1: number | null;
    x2: number | null;
  }>({ x1: null, x2: null });
  const [activeSeries, setActiveSeries] = useState<string[]>(
    series.map((s) => s.id),
  );
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );

  // Refs for zoom interaction
  const isZooming = useRef(false);

  // Effect to notify parent of range changes
  useEffect(() => {
    if (onRangeChange) {
      onRangeChange(new Date(dateRange[0]), new Date(dateRange[1]));
    }
  }, [dateRange, onRangeChange]);

  // Filter data based on current date range
  const filteredData = processedData.filter((item) => {
    const itemDate = new Date(item[dateKey]).getTime();
    return itemDate >= dateRange[0] && itemDate <= dateRange[1];
  });

  // Filter events based on current date range
  const filteredEvents = processedEvents.filter((event) => {
    const eventDate = new Date(event.date).getTime();
    return eventDate >= dateRange[0] && eventDate <= dateRange[1];
  });

  // Handle zoom in on selected area
  const handleZoomIn = () => {
    if (zoomArea.x1 !== null && zoomArea.x2 !== null) {
      const [newStart, newEnd] = [
        Math.min(zoomArea.x1, zoomArea.x2),
        Math.max(zoomArea.x1, zoomArea.x2),
      ];
      setDateRange([newStart, newEnd]);
      setZoomArea({ x1: null, x2: null });
    }
  };

  // Handle zoom out to show all data
  const handleZoomOut = () => {
    setDateRange([minDate, maxDate]);
    setZoomArea({ x1: null, x2: null });
  };

  // Handle mouse events for zoom selection
  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    isZooming.current = true;
    const date = new Date(e.activeLabel).getTime();
    setZoomArea({ x1: date, x2: date });
  };

  const handleMouseMove = (e: any) => {
    if (!isZooming.current || !e || !e.activeLabel) return;
    const date = new Date(e.activeLabel).getTime();
    setZoomArea((prev) => ({ ...prev, x2: date }));
  };

  const handleMouseUp = () => {
    if (isZooming.current) {
      isZooming.current = false;
      if (
        zoomArea.x1 !== null &&
        zoomArea.x2 !== null &&
        zoomArea.x1 !== zoomArea.x2
      ) {
        handleZoomIn();
      } else {
        setZoomArea({ x1: null, x2: null });
      }
    }
  };

  // Toggle series visibility
  const toggleSeries = (seriesId: string) => {
    setActiveSeries((prev) =>
      prev.includes(seriesId)
        ? prev.filter((id) => id !== seriesId)
        : [...prev, seriesId],
    );
  };

  // Format date for display
  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          {payload
            .filter((p: any) => activeSeries.includes(p.dataKey))
            .map((entry: any, index: number) => (
              <p key={`value-${index}`} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomArea.x1 === null || zoomArea.x2 === null}
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={dateRange[0] === minDate && dateRange[1] === maxDate}
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(dateRange[0])} - {formatDate(dateRange[1])}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {series.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleSeries(s.id)}
              className={`px-3 py-1 text-sm rounded-full border ${activeSeries.includes(s.id) ? "bg-gray-100" : "bg-white text-gray-400"}`}
              style={
                activeSeries.includes(s.id) ? { borderColor: s.color } : {}
              }
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </button>
          ))}
        </div>

        <div className="relative" onMouseLeave={handleMouseUp}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={dateKey}
                domain={[dateRange[0], dateRange[1]]}
                type="number"
                scale="time"
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />

              {/* Zoom selection area */}
              {zoomArea.x1 !== null && zoomArea.x2 !== null && (
                <ReferenceArea
                  x1={zoomArea.x1}
                  x2={zoomArea.x2}
                  strokeOpacity={0.3}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              )}

              {/* Event reference lines */}
              {filteredEvents.map((event) => (
                <ReferenceLine
                  key={event.id}
                  x={new Date(event.date).getTime()}
                  stroke={event.color || "#ff7300"}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ value: event.title, position: "top" }}
                  onClick={() => setSelectedEvent(event)}
                  style={{ cursor: "pointer" }}
                />
              ))}

              {/* Data series */}
              {series.map(
                (s) =>
                  activeSeries.includes(s.id) && (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.id}
                      name={s.name}
                      stroke={s.color}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                  ),
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event details */}
        {selectedEvent && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                {selectedEvent.description && (
                  <p className="mt-2">{selectedEvent.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {filteredData.length} data points • {filteredEvents.length} events
        </div>
        {events.length > 0 && (
          <Select
            value={selectedEvent?.id || ""}
            onValueChange={(value) => {
              const event = events.find((e) => e.id === value);
              if (event) {
                setSelectedEvent(event);
                const eventDate = new Date(event.date).getTime();
                // If event is outside current range, adjust the range
                if (eventDate < dateRange[0] || eventDate > dateRange[1]) {
                  const rangeWidth = dateRange[1] - dateRange[0];
                  setDateRange([
                    eventDate - rangeWidth / 2,
                    eventDate + rangeWidth / 2,
                  ]);
                }
              } else {
                setSelectedEvent(null);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Jump to event..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardFooter>
    </Card>
  );
}
