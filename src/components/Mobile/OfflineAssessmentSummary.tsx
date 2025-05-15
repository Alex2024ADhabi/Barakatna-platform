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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { assessmentOfflineManager } from "../../services/AssessmentOfflineManager";
import { measurementOfflineManager } from "../../services/MeasurementOfflineManager";
import { photoOfflineManager } from "../../services/PhotoOfflineManager";
import { offlineService } from "../../services/offlineService";
import { syncQueueManager } from "../../services/SyncQueueManager";

interface OfflineAssessmentSummaryProps {
  assessmentId: string;
  onComplete?: () => void;
}

export default function OfflineAssessmentSummary({
  assessmentId,
  onComplete,
}: OfflineAssessmentSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [assessment, setAssessment] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAssessmentData();

    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [assessmentId]);

  const loadAssessmentData = async () => {
    setLoading(true);
    try {
      // Load assessment data
      const assessmentData =
        await assessmentOfflineManager.getAssessment(assessmentId);
      setAssessment(assessmentData);

      // Load measurements
      const measurementsData =
        await measurementOfflineManager.getMeasurementsByAssessment(
          assessmentId,
        );
      setMeasurements(measurementsData);

      // Load photos
      const photosData =
        await photoOfflineManager.getPhotosByAssessment(assessmentId);
      setPhotos(photosData);
    } catch (error) {
      console.error("Error loading assessment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncAssessment = async () => {
    if (!networkStatus) {
      alert(
        "Cannot sync while offline. Please connect to the internet and try again.",
      );
      return;
    }

    setSyncing(true);
    setSyncProgress(0);

    try {
      // First sync assessment metadata (high priority)
      await syncQueueManager.queueUpdate(
        "assessment",
        assessmentId,
        assessment,
        `/api/assessments/${assessmentId}`,
        10, // Highest priority
      );
      setSyncProgress(20);

      // Then sync measurements (medium-high priority)
      for (const measurement of measurements) {
        await syncQueueManager.queueUpdate(
          "measurement",
          measurement.id,
          measurement,
          `/api/measurements/${measurement.id}`,
          8,
        );
      }
      setSyncProgress(40);

      // Finally sync photos (lower priority)
      for (const photo of photos) {
        await syncQueueManager.queueUpdate(
          "photo",
          photo.id,
          photo,
          `/api/photos/${photo.id}`,
          6,
        );
      }
      setSyncProgress(60);

      // Start the sync process
      await offlineService.startSync();
      setSyncProgress(100);

      // Mark assessment as submitted if it's complete
      if (assessment.status === "completed") {
        await assessmentOfflineManager.completeAssessment(assessmentId);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error syncing assessment:", error);
      alert(
        "There was an error syncing the assessment. Some data may not have been uploaded.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const completeAssessment = async () => {
    try {
      await assessmentOfflineManager.updateAssessment(assessmentId, {
        status: "completed",
      });

      // Reload assessment data
      loadAssessmentData();
    } catch (error) {
      console.error("Error completing assessment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Assessment not found</p>
        <Button
          className="mt-4"
          onClick={() => (window.location.href = "/mobile/assessments")}
          variant="outline"
        >
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Assessment Summary</CardTitle>
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="text-xs">
                {networkStatus ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Assessment ID:</span>
              <span>{assessment.id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Client Type:</span>
              <span>{assessment.clientType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span
                className={`${assessment.status === "completed" ? "text-green-600" : "text-amber-600"}`}
              >
                {assessment.status === "completed"
                  ? "Completed"
                  : "In Progress"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rooms:</span>
              <span>{assessment.rooms.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Measurements:</span>
              <span>{measurements.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Photos:</span>
              <span>{photos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Cost:</span>
              <span className="font-bold">
                ${assessment.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex-1">
            Rooms
          </TabsTrigger>
          <TabsTrigger value="measurements" className="flex-1">
            Measurements
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex-1">
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Assessment Overview</h3>
              <p className="text-sm text-gray-600 mb-4">
                This assessment{" "}
                {assessment.status === "completed"
                  ? "has been completed"
                  : "is still in progress"}
                .
                {assessment.status !== "completed" &&
                  " Complete all required rooms before submitting."}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span>{new Date(assessment.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated:</span>
                  <span>{new Date(assessment.updatedAt).toLocaleString()}</span>
                </div>
                {assessment.submittedAt && (
                  <div className="flex justify-between text-sm">
                    <span>Submitted:</span>
                    <span>
                      {new Date(assessment.submittedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Rooms</h3>
              <div className="space-y-3">
                {assessment.rooms.map((room, index) => (
                  <div key={room.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{room.name}</h4>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${room.completed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {room.completed ? "Completed" : "In Progress"}
                      </div>
                    </div>
                    {room.recommendations &&
                      room.recommendations.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600">
                            {room.recommendations.length} recommendations
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Measurements</h3>
              {measurements.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No measurements recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {measurements.map((measurement) => {
                    const room = assessment.rooms.find(
                      (r) => r.id === measurement.roomId,
                    );
                    return (
                      <div
                        key={measurement.id}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            {measurement.label || measurement.type}
                          </h4>
                          <span className="text-sm">
                            {room?.name || "Unknown Room"}
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium">
                            {measurement.value} {measurement.unit}
                          </span>
                          {measurement.notes && (
                            <p className="text-gray-600 mt-1">
                              {measurement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Photos</h3>
              {photos.length === 0 ? (
                <p className="text-sm text-gray-500">No photos captured yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => {
                    const room = assessment.rooms.find(
                      (r) => r.id === photo.roomId,
                    );
                    return (
                      <div
                        key={photo.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <img
                          src={photo.thumbnailUrl || photo.dataUrl}
                          alt={photo.caption || "Assessment photo"}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs truncate">
                            {photo.caption || "No caption"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {room?.name || "Unknown Room"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col space-y-2 pt-4">
        {assessment.status !== "completed" && (
          <Button onClick={completeAssessment} variant="outline">
            Mark Assessment as Complete
          </Button>
        )}

        <Button
          onClick={syncAssessment}
          disabled={syncing || !networkStatus}
          className="relative"
        >
          {syncing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Syncing... {syncProgress}%
            </>
          ) : (
            "Sync Assessment"
          )}
          {syncing && (
            <div
              className="absolute left-0 bottom-0 h-1 bg-white bg-opacity-30"
              style={{ width: `${syncProgress}%` }}
            ></div>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => (window.location.href = "/mobile/assessments")}
        >
          Back to Assessments
        </Button>
      </div>
    </div>
  );
}
