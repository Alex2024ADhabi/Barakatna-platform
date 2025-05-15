import React from "react";

export default function DashboardOverview() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium">Assessments</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium">Active Projects</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium">Beneficiaries</h3>
          <p className="text-2xl font-bold">56</p>
        </div>
      </div>
    </div>
  );
}
