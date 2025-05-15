import React from "react";

export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
  className?: string;
}

export function PieChart({
  data,
  height = 300,
  colors = [
    "#2563eb",
    "#16a34a",
    "#ea580c",
    "#8b5cf6",
    "#db2777",
    "#65a30d",
    "#0891b2",
    "#9333ea",
  ],
  className = "",
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages and angles for the pie segments
  let startAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Calculate coordinates for the pie segment
    const radius = 100;
    const centerX = 150;
    const centerY = 150;

    // Start and end points of the arc
    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

    // Path for the pie segment
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      "Z",
    ].join(" ");

    // Calculate position for the label
    const labelAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.7;
    const labelX =
      centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
    const labelY =
      centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

    // Calculate if the label should be visible (only show if segment is large enough)
    const isLabelVisible = percentage > 5;

    // Calculate position for the line to the label
    const outerRadius = radius * 1.1;
    const lineEndX =
      centerX + outerRadius * Math.cos((labelAngle * Math.PI) / 180);
    const lineEndY =
      centerY + outerRadius * Math.sin((labelAngle * Math.PI) / 180);

    const segment = {
      path,
      color: colors[index % colors.length],
      percentage,
      label: item.name,
      labelX,
      labelY,
      isLabelVisible,
      lineEndX,
      lineEndY,
    };

    startAngle = endAngle;
    return segment;
  });

  return (
    <div className={className} style={{ height }}>
      <svg
        viewBox="0 0 300 300"
        style={{ width: "100%", height: "100%" }}
        className="overflow-visible"
      >
        {/* Pie segments */}
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="1"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}

        {/* Labels */}
        {segments.map((segment, index) => (
          <g key={`label-${index}`}>
            {segment.isLabelVisible && (
              <>
                <line
                  x1={segment.labelX}
                  y1={segment.labelY}
                  x2={segment.lineEndX}
                  y2={segment.lineEndY}
                  stroke="#666"
                  strokeWidth="0.5"
                />
                <text
                  x={
                    segment.lineEndX > 150
                      ? segment.lineEndX + 5
                      : segment.lineEndX - 5
                  }
                  y={segment.lineEndY}
                  textAnchor={segment.lineEndX > 150 ? "start" : "end"}
                  alignmentBaseline="middle"
                  fontSize="8"
                  fill="#333"
                >
                  {segment.label} ({segment.percentage.toFixed(1)}%)
                </text>
              </>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center mt-4 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 mr-1"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm">
              {item.name}: {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
