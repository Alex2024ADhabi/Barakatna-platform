import React from "react";

export default function AdminDashboard() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Administration Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">User Management</h3>
          <p className="text-sm text-gray-600">
            Manage system users and permissions
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">System Configuration</h3>
          <p className="text-sm text-gray-600">
            Configure system settings and parameters
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Multi-tenant Setup</h3>
          <p className="text-sm text-gray-600">
            Manage client organizations and tenants
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2">Reporting Dashboard</h3>
          <p className="text-sm text-gray-600">
            Access system-wide reports and analytics
          </p>
        </div>
      </div>
    </div>
  );
}
