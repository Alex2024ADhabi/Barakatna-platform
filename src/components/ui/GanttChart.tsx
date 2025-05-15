import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export interface Task {
  id: string | number;
  name: string;
  start: number;
  end: number;
  color?: string;
  category?: string;
  progress?: number;
}

export interface GanttChartProps {
  tasks: Task[];
  title?: string;
  height?: number;
  className?: string;
  showToday?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * GanttChart component for timeline visualization
 */
export function GanttChart({
  tasks = [],
  title,
  height = 400,
  className = "",
  showToday = true,
  startDate,
  endDate,
}: GanttChartProps) {
  const defaultColors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Process tasks for the chart
  const processedTasks = tasks.map((task) => {
    return {
      name: task.name,
      id: task.id,
      start: task.start,
      end: task.end,
      duration: task.end - task.start,
      color: task.color,
      category: task.category || "Default",
      progress: task.progress || 0,
    };
  });

  // Calculate min and max dates if not provided
  const minDate = startDate
    ? startDate.getTime()
    : Math.min(...tasks.map((t) => t.start));
  const maxDate = endDate
    ? endDate.getTime()
    : Math.max(...tasks.map((t) => t.end));
  const today = new Date().getTime();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const task = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{task.name}</p>
          <p>Start: {new Date(task.start).toLocaleDateString()}</p>
          <p>End: {new Date(task.end).toLocaleDateString()}</p>
          <p>
            Duration:{" "}
            {Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24))} days
          </p>
          {task.progress > 0 && <p>Progress: {task.progress}%</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={processedTasks}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[minDate, maxDate]}
              tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
            />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="duration" barSize={20} background={{ fill: "#eee" }}>
              {processedTasks.map((task, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    task.color || defaultColors[index % defaultColors.length]
                  }
                />
              ))}
            </Bar>
            {showToday && today >= minDate && today <= maxDate && (
              <ReferenceLine x={today} stroke="red" label="Today" />
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
