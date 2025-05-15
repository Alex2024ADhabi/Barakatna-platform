import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { apiClient } from "../lib/api/core/apiClient";
import { AuditAction } from "../lib/api/core/types";

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export default function AuditLogViewerDemo() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    fromDate: "",
    toDate: "",
    userId: "",
  });

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the API
      // For demo purposes, we'll simulate some audit logs
      const mockLogs: AuditLogEntry[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          action: AuditAction.Create,
          entityType: "beneficiary",
          entityId: "b123",
          details: { initialData: { name: "Ahmed", age: 65 } },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          action: AuditAction.Update,
          entityType: "beneficiary",
          entityId: "b123",
          details: {
            changes: {
              address: { from: "Old Address", to: "New Address" },
              phone: { from: "1234567", to: "7654321" },
            },
          },
          ipAddress: "192.168.1.2",
          userAgent: "Chrome/91.0",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          userId: "user1",
          userName: "John Doe",
          action: AuditAction.View,
          entityType: "assessment",
          entityId: "a456",
          details: { viewedFields: ["summary", "recommendations"] },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "4",
          userId: "user3",
          userName: "Admin User",
          action: AuditAction.Delete,
          entityType: "project",
          entityId: "p789",
          details: { reason: "Project cancelled by client" },
          ipAddress: "192.168.1.3",
          userAgent: "Safari/605.1",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "5",
          userId: "user2",
          userName: "Jane Smith",
          action: AuditAction.Export,
          entityType: "report",
          entityId: "r101",
          details: { format: "PDF", pages: 12 },
          ipAddress: "192.168.1.2",
          userAgent: "Chrome/91.0",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      // Apply filters
      const filteredLogs = mockLogs.filter((log) => {
        if (filters.entityType && log.entityType !== filters.entityType)
          return false;
        if (filters.action && log.action !== filters.action) return false;
        if (filters.userId && log.userId !== filters.userId) return false;
        if (
          filters.fromDate &&
          new Date(log.timestamp) < new Date(filters.fromDate)
        )
          return false;
        if (
          filters.toDate &&
          new Date(log.timestamp) > new Date(filters.toDate)
        )
          return false;
        return true;
      });

      setAuditLogs(filteredLogs);
    } catch (err) {
      setError(
        `Failed to fetch audit logs: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.Create:
        return "text-green-600";
      case AuditAction.Update:
        return "text-blue-600";
      case AuditAction.Delete:
        return "text-red-600";
      case AuditAction.View:
        return "text-gray-600";
      case AuditAction.Export:
        return "text-purple-600";
      case AuditAction.Import:
        return "text-orange-600";
      default:
        return "text-black";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Audit Log Viewer</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entity Type
          </label>
          <Select
            name="entityType"
            value={filters.entityType}
            onValueChange={(value) =>
              setFilters({ ...filters, entityType: value })
            }
          >
            <option value="">All</option>
            <option value="beneficiary">Beneficiary</option>
            <option value="assessment">Assessment</option>
            <option value="project">Project</option>
            <option value="report">Report</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <Select
            name="action"
            value={filters.action}
            onValueChange={(value) =>
              setFilters({ ...filters, action: value as AuditAction })
            }
          >
            <option value="">All</option>
            <option value={AuditAction.Create}>Create</option>
            <option value={AuditAction.Update}>Update</option>
            <option value={AuditAction.Delete}>Delete</option>
            <option value={AuditAction.View}>View</option>
            <option value={AuditAction.Export}>Export</option>
            <option value={AuditAction.Import}>Import</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <Input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <Input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={fetchAuditLogs} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading audit logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell className={getActionColor(log.action)}>
                      {log.action}
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>{log.entityId}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <details>
                        <summary className="cursor-pointer text-sm text-blue-600">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
