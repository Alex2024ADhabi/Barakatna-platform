import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { offlineService } from "../../services/offlineService";
import { assessmentOfflineManager } from "../../services/AssessmentOfflineManager";
import { syncQueueManager } from "../../services/SyncQueueManager";

export default function MobileAssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());

  useEffect(() => {
    // Load assessments from offline storage
    loadAssessments();

    // Set up network status listener
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
      if (offlineService.isOnline()) {
        // Auto-sync metadata when coming back online
        syncMetadata();
      }
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const allAssessments = await assessmentOfflineManager.getAllAssessments();
      setAssessments(Object.values(allAssessments));
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncMetadata = async () => {
    if (!offlineService.isOnline()) return;

    setSyncing(true);
    try {
      // Start sync with priority for metadata
      await offlineService.startSync();
      // Reload assessments after sync
      await loadAssessments();
    } catch (error) {
      console.error("Error syncing metadata:", error);
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    if (!offlineService.isOnline()) return;

    setSyncing(true);
    try {
      // Start full sync including photos
      await offlineService.startSync();
      // Reload assessments after sync
      await loadAssessments();
    } catch (error) {
      console.error("Error syncing all data:", error);
    } finally {
      setSyncing(false);
    }
  };

  const downloadAssessment = async (beneficiaryId) => {
    if (!offlineService.isOnline()) return;

    setSyncing(true);
    try {
      // Queue a read operation for all assessments for this beneficiary
      await syncQueueManager.queueRead(
        "assessment",
        beneficiaryId,
        `/api/assessments/beneficiary/${beneficiaryId}`,
        8, // High priority
      );

      // Start sync
      await offlineService.startSync();
      // Reload assessments
      await loadAssessments();
    } catch (error) {
      console.error("Error downloading assessment:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Offline Assessments</h2>
        <div className="flex items-center space-x-2">
          {syncing && <Spinner size="sm" />}
          <div
            className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-sm">
            {networkStatus ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={syncMetadata}
          disabled={!networkStatus || syncing}
          variant="outline"
          size="sm"
        >
          Sync Metadata
        </Button>
        <Button
          onClick={syncAll}
          disabled={!networkStatus || syncing}
          variant="default"
          size="sm"
        >
          Sync All
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No assessments available offline.</p>
          {networkStatus && (
            <Button
              onClick={() => downloadAssessment("recent")}
              className="mt-4"
              variant="outline"
            >
              Download Recent Assessments
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Assessment #{assessment.id.substring(0, 8)}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Client Type: {assessment.clientType}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{assessment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms:</span>
                    <span className="font-medium">
                      {assessment.rooms.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">
                      ${assessment.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/mobile/assessment/${assessment.id}`)
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/mobile/assessment/${assessment.id}/edit`)
                  }
                >
                  Continue Assessment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
