import React from "react";

export default function RoomAssessmentManager() {
  const rooms = [
    { name: "Bathroom", status: "completed" },
    { name: "Kitchen", status: "in-progress" },
    { name: "Bedroom", status: "pending" },
    { name: "Living Room", status: "pending" },
  ];

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-4">Room Assessment Progress</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rooms.map((room, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <h4 className="font-medium">{room.name}</h4>
            <div
              className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${room.status === "completed" ? "bg-green-100 text-green-800" : room.status === "in-progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
            >
              {room.status === "completed"
                ? "Completed"
                : room.status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
