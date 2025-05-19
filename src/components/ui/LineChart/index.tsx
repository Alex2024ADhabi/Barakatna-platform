import React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface LineProps {
  dataKey: string;
  name: string;
  color: string;
}

interface LineChartProps {
  data: any[];
  xAxisKey: string;
  lines: LineProps[];
  height?: number;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data = [],
  xAxisKey = "name",
  lines = [],
  height = 300,
  className = "",
}) => {
  // If no data is provided, show placeholder
  if (!data || data.length === 0) {
    return (
      <div
        className={`line-chart-container bg-white p-4 rounded-md ${className}`}
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
      className={`line-chart-container bg-white p-4 rounded-md ${className}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={`line-${index}`}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
