import { OptimisticAction } from "@/components/ui/optimistic-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function DataFlowArchitectureDemo() {
  const [beneficiaryStatus, setBeneficiaryStatus] = useState<string>("idle");
  const [assessmentStatus, setAssessmentStatus] = useState<string>("idle");
  const [committeeStatus, setCommitteeStatus] = useState<string>("idle");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Simulated API calls that would use our apiClient
  const registerBeneficiary = async () => {
    setBeneficiaryStatus("loading");
    try {
      // This would normally call apiClient.post with offline support
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success or network error based on online status
      if (isOnline) {
        setBeneficiaryStatus("success");
        return { success: true, data: { id: "ben-" + Date.now() } };
      } else {
        // Return optimistic response when offline
        setBeneficiaryStatus("offline");
        return {
          success: true,
          data: { id: "ben-" + Date.now() },
          offline: true,
          optimistic: true,
        };
      }
    } catch (error) {
      setBeneficiaryStatus("error");
      return { success: false, error: "Failed to register beneficiary" };
    }
  };

  const submitAssessment = async () => {
    setAssessmentStatus("loading");
    try {
      // This would normally call apiClient.post with offline support
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (isOnline) {
        setAssessmentStatus("success");
        return { success: true, data: { id: "ass-" + Date.now() } };
      } else {
        // Return optimistic response when offline
        setAssessmentStatus("offline");
        return {
          success: true,
          data: { id: "ass-" + Date.now() },
          offline: true,
          optimistic: true,
        };
      }
    } catch (error) {
      setAssessmentStatus("error");
      return { success: false, error: "Failed to submit assessment" };
    }
  };

  const submitCommitteeDecision = async () => {
    setCommitteeStatus("loading");
    try {
      // This would normally call apiClient.post with offline support
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isOnline) {
        // Simulate conflict for demonstration
        if (Math.random() > 0.5) {
          setCommitteeStatus("conflict");
          return {
            success: true,
            conflicts: [
              {
                serverData: {
                  status: "rejected",
                  reason: "Budget constraints",
                },
                localData: { status: "approved", reason: "" },
              },
            ],
          };
        }

        setCommitteeStatus("success");
        return { success: true, data: { id: "dec-" + Date.now() } };
      } else {
        // Return optimistic response when offline
        setCommitteeStatus("offline");
        return {
          success: true,
          data: { id: "dec-" + Date.now() },
          offline: true,
          optimistic: true,
        };
      }
    } catch (error) {
      setCommitteeStatus("error");
      return { success: false, error: "Failed to submit committee decision" };
    }
  };

  const resetStatuses = () => {
    setBeneficiaryStatus("idle");
    setAssessmentStatus("idle");
    setCommitteeStatus("idle");
  };

  const toggleNetworkStatus = () => {
    setIsOnline(!isOnline);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "offline":
        return <WifiOff className="h-5 w-5 text-amber-500" />;
      case "conflict":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Flow Architecture Demo</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNetworkStatus}
            className="flex items-center gap-2"
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" /> <span>Simulate Offline</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" /> <span>Simulate Online</span>
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" /> <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-amber-500" />{" "}
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="beneficiary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beneficiary">
            Beneficiary Registration
          </TabsTrigger>
          <TabsTrigger value="assessment">Assessment Process</TabsTrigger>
          <TabsTrigger value="committee">Committee Review</TabsTrigger>
        </TabsList>

        <TabsContent value="beneficiary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Beneficiary Registration
                {getStatusIcon(beneficiaryStatus)}
              </CardTitle>
              <CardDescription>
                Demonstrates form submission with optimistic updates and offline
                support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Front-End: <code>BeneficiaryRegistrationForm.tsx</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Collects beneficiary information with client-specific fields
                  </li>
                  <li>Validates data based on client rules</li>
                  <li>Handles document uploads</li>
                  <li>Displays progress and success/error states</li>
                </ul>
                <p>
                  Back-End: <code>beneficiaryApi.ts</code> &{" "}
                  <code>beneficiaryService.ts</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Validates incoming data against schema</li>
                  <li>Applies client-specific business rules</li>
                  <li>Stores beneficiary record and documents</li>
                  <li>Initiates workflow for new beneficiary</li>
                  <li>Returns detailed success/error response</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <OptimisticAction
                action={registerBeneficiary}
                allowOffline={true}
                showNetworkStatus={true}
                loadingText="Registering..."
                onSuccess={() =>
                  console.log("Beneficiary registered successfully")
                }
                onError={(error) =>
                  console.error("Error registering beneficiary:", error)
                }
              >
                Register Beneficiary
              </OptimisticAction>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Assessment Process
                {getStatusIcon(assessmentStatus)}
              </CardTitle>
              <CardDescription>
                Demonstrates complex form submission with file uploads and
                offline queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Front-End: <code>RoomAssessmentManager.tsx</code> &{" "}
                  <code>RoomAssessmentForm.tsx</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Allows room inventory management</li>
                  <li>Collects detailed condition information</li>
                  <li>Handles photo uploads and annotations</li>
                  <li>Calculates costs based on measurements</li>
                  <li>Tracks completion status</li>
                </ul>
                <p>
                  Back-End: <code>assessmentApi.ts</code> &{" "}
                  <code>assessmentService.ts</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Manages assessment data structure</li>
                  <li>Processes uploaded photos with compression</li>
                  <li>Calculates costs using client price lists</li>
                  <li>Validates complete assessment for submission</li>
                  <li>Triggers workflow for completed assessments</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <OptimisticAction
                action={submitAssessment}
                allowOffline={true}
                showNetworkStatus={true}
                loadingText="Submitting assessment..."
                onSuccess={() =>
                  console.log("Assessment submitted successfully")
                }
                onError={(error) =>
                  console.error("Error submitting assessment:", error)
                }
              >
                Submit Assessment
              </OptimisticAction>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="committee">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Committee Review
                {getStatusIcon(committeeStatus)}
              </CardTitle>
              <CardDescription>
                Demonstrates decision submission with conflict resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Front-End: <code>CommitteeDecisionList.tsx</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Displays pending submissions</li>
                  <li>Shows assessment details and recommendations</li>
                  <li>Collects committee member decisions</li>
                  <li>Records decision outcome and comments</li>
                  <li>Notifies of successful submission</li>
                </ul>
                <p>
                  Back-End: <code>committeeApi.ts</code> &{" "}
                  <code>committeeService.ts</code>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Retrieves submissions for review</li>
                  <li>Validates committee member permissions</li>
                  <li>Records decision with audit trail</li>
                  <li>Triggers subsequent workflow steps</li>
                  <li>Sends notifications to affected parties</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <OptimisticAction
                action={submitCommitteeDecision}
                allowOffline={true}
                showNetworkStatus={true}
                showConflictResolution={true}
                loadingText="Submitting decision..."
                onSuccess={() =>
                  console.log("Committee decision submitted successfully")
                }
                onError={(error) =>
                  console.error("Error submitting committee decision:", error)
                }
              >
                Submit Decision
              </OptimisticAction>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button variant="outline" onClick={resetStatuses}>
          Reset Demo
        </Button>
      </div>

      <div className="mt-8 p-4 border rounded-md bg-slate-50">
        <h2 className="text-lg font-semibold mb-2">Implementation Details</h2>
        <p className="mb-2">
          This demo showcases the data flow architecture with:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>API Integration:</strong> Typed clients with standardized
            request/response handling
          </li>
          <li>
            <strong>Caching & Deduplication:</strong> Prevents redundant network
            requests
          </li>
          <li>
            <strong>Offline Support:</strong> Queues operations when offline for
            later synchronization
          </li>
          <li>
            <strong>Real-time Updates:</strong> WebSocket integration for live
            data changes
          </li>
          <li>
            <strong>Optimistic UI:</strong> Immediate feedback with background
            processing
          </li>
          <li>
            <strong>Conflict Resolution:</strong> Handles data conflicts between
            local and server changes
          </li>
        </ul>
      </div>
    </div>
  );
}
