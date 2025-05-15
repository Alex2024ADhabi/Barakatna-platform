import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import * as committeeApi from "@/lib/api/committee/committeeApi";
import { retryWithBackoff } from "@/lib/api/core/retryMechanism";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CommitteeDecisionListProps {
  committeeId?: string;
  committees?: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    clientTypeId: number;
    members: any[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function CommitteeDecisionList({
  committeeId = "com-001",
  committees = [],
}: CommitteeDecisionListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState(committeeId);

  const fetchDecisions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await retryWithBackoff(() =>
        committeeApi.getDecisions(selectedCommittee),
      );
      setDecisions(response.data);
    } catch (err) {
      console.error("Failed to fetch committee decisions:", err);
      setError("Unable to load committee decisions");
      toast({
        title: "Error",
        description: "Failed to load committee decisions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, [selectedCommittee]);

  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommittee(e.target.value);
  };

  const handleRefresh = () => {
    fetchDecisions();
    toast({
      title: "Refreshed",
      description: "Committee decisions refreshed",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-700 mb-2">{error}</p>
        <Button onClick={fetchDecisions} variant="outline">
          {t("common.retry", "Retry")}
        </Button>
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-700 mb-2">
          {t(
            "committee.noDecisionsFound",
            "No decisions found for this committee.",
          )}
        </p>
        <Button onClick={handleRefresh} variant="outline">
          {t("common.refresh", "Refresh")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="committee-select" className="text-sm font-medium">
            {t("committee.selectCommittee", "Select Committee")}:
          </label>
          <select
            id="committee-select"
            value={selectedCommittee}
            onChange={handleCommitteeChange}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {committees.length > 0 ? (
              committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.name}
                </option>
              ))
            ) : (
              <option value={committeeId}>{committeeId}</option>
            )}
          </select>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          {t("committee.refreshDecisions", "Refresh Decisions")}
        </Button>
      </div>

      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("committee.submissionId", "Submission ID")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("committee.decision", "Decision")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("committee.decidedAt", "Date")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("committee.decidedBy", "Decided By")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("common.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {decisions.map((decision) => (
              <tr key={decision.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {decision.submissionId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      decision.decision,
                    )}`}
                  >
                    {t(
                      `committee.decisionStatus.${decision.decision.toLowerCase()}`,
                      decision.decision,
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(new Date(decision.decidedAt))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {decision.decidedBy}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button variant="link" className="p-0 h-auto mr-4">
                    {t("common.view", "View")}
                  </Button>
                  {decision.attachments && decision.attachments.length > 0 && (
                    <Button variant="link" className="p-0 h-auto">
                      {t("common.attachments", "Attachments")}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
