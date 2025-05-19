import React from "react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  className?: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export const PieChart: React.FC<PieChartProps> = ({
  data = [],
  height = 300,
  className = "",
}) => {
  // If no data is provided, show placeholder
  if (!data || data.length === 0) {
    return (
      <div
        className={`pie-chart-container bg-white p-4 rounded-md ${className}`}
        style={{ height }}
      >
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pie-chart-container bg-white p-4 rounded-md ${className}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}`, "Value"]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
