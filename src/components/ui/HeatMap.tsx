import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export interface HeatMapProps {
  data: Array<{
    x: number | string;
    y: number | string;
    value: number;
  }>;
  xAxisKey?: string;
  yAxisKey?: string;
  valueKey?: string;
  title?: string;
  height?: number;
  className?: string;
  colorRange?: string[];
  minValue?: number;
  maxValue?: number;
  dotSize?: number;
}

/**
 * HeatMap component for density analysis
 */
export function HeatMap({
  data = [],
  xAxisKey = "x",
  yAxisKey = "y",
  valueKey = "value",
  title,
  height = 400,
  className = "",
  colorRange = ["#f7fbff", "#08519c"],
  minValue,
  maxValue,
  dotSize = 20,
}: HeatMapProps) {
  // Calculate min and max values if not provided
  const calculatedMinValue =
    minValue !== undefined
      ? minValue
      : Math.min(...data.map((item) => item.value));
  const calculatedMaxValue =
    maxValue !== undefined
      ? maxValue
      : Math.max(...data.map((item) => item.value));

  // Function to interpolate colors
  const getColor = (value: number) => {
    const ratio =
      (value - calculatedMinValue) / (calculatedMaxValue - calculatedMinValue);

    // Simple linear interpolation between two colors
    if (colorRange.length === 2) {
      const startColor = hexToRgb(colorRange[0]);
      const endColor = hexToRgb(colorRange[1]);

      if (startColor && endColor) {
        const r = Math.round(
          startColor.r + ratio * (endColor.r - startColor.r),
        );
        const g = Math.round(
          startColor.g + ratio * (endColor.g - startColor.g),
        );
        const b = Math.round(
          startColor.b + ratio * (endColor.b - startColor.b),
        );

        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    // Fallback
    return colorRange[0];
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${xAxisKey}: ${data[xAxisKey]}`}</p>
          <p>{`${yAxisKey}: ${data[yAxisKey]}`}</p>
          <p>{`${valueKey}: ${data[valueKey]}`}</p>
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
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid />
            <XAxis type="category" dataKey={xAxisKey} name={xAxisKey} />
            <YAxis type="category" dataKey={yAxisKey} name={yAxisKey} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Values" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Color legend */}
        <div className="mt-4 flex items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="h-4 w-full bg-gradient-to-r from-[#f7fbff] to-[#08519c]" />
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <span>{calculatedMinValue}</span>
              <span>{calculatedMaxValue}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
