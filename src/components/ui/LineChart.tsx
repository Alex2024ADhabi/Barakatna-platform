import React from "react";

export interface LineChartProps {
  data: any[];
  xAxisKey: string;
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  className?: string;
}

export function LineChart({
  data,
  xAxisKey,
  lines,
  height = 300,
  className = "",
}: LineChartProps) {
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Default colors if not provided
  const defaultColors = [
    "#2563eb",
    "#16a34a",
    "#ea580c",
    "#8b5cf6",
    "#db2777",
    "#65a30d",
  ];

  // Find min and max values for y-axis
  let minY = Number.MAX_VALUE;
  let maxY = Number.MIN_VALUE;

  lines.forEach((line) => {
    data.forEach((item) => {
      const value = Number(item[line.dataKey]);
      if (!isNaN(value)) {
        minY = Math.min(minY, value);
        maxY = Math.max(maxY, value);
      }
    });
  });

  // Add some padding to the min/max
  const yRange = maxY - minY;
  minY = Math.max(0, minY - yRange * 0.1);
  maxY = maxY + yRange * 0.1;

  // Chart dimensions
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = 1000;
  const chartHeight = 400;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // X and Y scales
  const xScale = (index: number) =>
    padding.left + (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) =>
    padding.top + innerHeight - ((value - minY) / (maxY - minY)) * innerHeight;

  // Format x-axis labels
  const formatXLabel = (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  // Generate paths for each line
  const generateLinePath = (lineData: { dataKey: string; color?: string }) => {
    const points = data
      .map((item, index) => {
        const value = Number(item[lineData.dataKey]);
        if (isNaN(value)) return null;
        return { x: xScale(index), y: yScale(value) };
      })
      .filter((point): point is { x: number; y: number } => point !== null);

    if (points.length === 0) return "";

    return points
      .map((point, i) =>
        i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`,
      )
      .join(" ");
  };

  return (
    <div className={className} style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: "100%", height: "100%" }}
        className="overflow-visible"
      >
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Y-axis grid lines and labels */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = minY + ((maxY - minY) * i) / 4;
          const y = yScale(value);
          return (
            <g key={`y-grid-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((item, i) => {
          // Only show a subset of labels to avoid overcrowding
          if (
            data.length > 10 &&
            i % Math.ceil(data.length / 10) !== 0 &&
            i !== data.length - 1
          ) {
            return null;
          }

          const x = xScale(i);
          return (
            <text
              key={`x-label-${i}`}
              x={x}
              y={padding.top + innerHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {formatXLabel(item[xAxisKey])}
            </text>
          );
        })}

        {/* Data lines */}
        {lines.map((line, i) => (
          <path
            key={`line-${i}`}
            d={generateLinePath(line)}
            fill="none"
            stroke={line.color || defaultColors[i % defaultColors.length]}
            strokeWidth="2"
          />
        ))}

        {/* Data points */}
        {lines.map((line, lineIndex) =>
          data.map((item, i) => {
            const value = Number(item[line.dataKey]);
            if (isNaN(value)) return null;
            return (
              <circle
                key={`point-${lineIndex}-${i}`}
                cx={xScale(i)}
                cy={yScale(value)}
                r="3"
                fill={
                  line.color || defaultColors[lineIndex % defaultColors.length]
                }
                stroke="white"
                strokeWidth="1"
              />
            );
          }),
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center mt-4 gap-4">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center">
            <div
              className="w-3 h-3 mr-1"
              style={{
                backgroundColor:
                  line.color || defaultColors[i % defaultColors.length],
              }}
            ></div>
            <span className="text-sm">{line.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
