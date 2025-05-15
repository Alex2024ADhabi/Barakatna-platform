import React from "react";

export default function WorkflowNavigator() {
  const steps = [
    { name: "Assessment", status: "completed" },
    { name: "Committee Review", status: "completed" },
    { name: "Planning", status: "current" },
    { name: "Implementation", status: "upcoming" },
    { name: "Inspection", status: "upcoming" },
    { name: "Closure", status: "upcoming" },
  ];

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-4">Workflow Progress</h3>

      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 w-full h-1 bg-gray-200">
          <div className="h-full bg-blue-500" style={{ width: "40%" }}></div>
        </div>

        {/* Steps */}
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step.status === "completed" ? "bg-blue-500 text-white" : step.status === "current" ? "border-2 border-blue-500 bg-white text-blue-500" : "bg-gray-200 text-gray-500"}`}
              >
                {step.status === "completed" ? "✓" : index + 1}
              </div>
              <div className="mt-2 text-xs text-center">{step.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
