import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { formParameterTracker } from "../lib/services/formParameterTrackerService";
import { ClientType } from "../lib/forms/types";
import { ParameterChangeEventType } from "../lib/services/formParameterTrackerService";

const FormParameterTrackerDemo = () => {
  const [formId, setFormId] = useState("initial-assessment-form");
  const [parameterId, setParameterId] = useState("beneficiaryId");
  const [parameterValue, setParameterValue] = useState("BEN-001");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Initialize dependencies when component mounts
  useEffect(() => {
    // Dependencies are already initialized in the service
    // Load audit logs
    refreshAuditLogs();
  }, []);

  const refreshAuditLogs = () => {
    const logs = formParameterTracker.getAllAuditLogs();
    setAuditLogs(logs);
  };

  const handleSetValue = () => {
    try {
      formParameterTracker.setParameterValue(
        formId,
        parameterId,
        parameterValue,
        ClientType.FDF,
        "demo-user",
      );
      refreshAuditLogs();
    } catch (error) {
      console.error("Error setting parameter value:", error);
    }
  };

  const handleSubscribe = () => {
    if (subscriptionId) {
      // Already subscribed, unsubscribe
      formParameterTracker.unsubscribe(subscriptionId);
      setSubscriptionId(null);
    } else {
      // Subscribe to parameter changes
      const id = formParameterTracker.subscribeToParameter(
        formId,
        parameterId,
        (event) => {
          setNotifications((prev) => [event, ...prev]);
        },
      );
      setSubscriptionId(id);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Form Parameter Tracker Demo</h2>

      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="control">Control Panel</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Parameter Value</CardTitle>
              <CardDescription>
                Update a parameter value and see how dependencies are triggered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="formId">Form ID</Label>
                  <Input
                    id="formId"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="parameterId">Parameter ID</Label>
                  <Input
                    id="parameterId"
                    value={parameterId}
                    onChange={(e) => setParameterId(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="parameterValue">Value</Label>
                  <Input
                    id="parameterValue"
                    value={parameterValue}
                    onChange={(e) => setParameterValue(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleSetValue}>Update Value</Button>
              <Button
                variant={subscriptionId ? "destructive" : "outline"}
                onClick={handleSubscribe}
              >
                {subscriptionId ? "Unsubscribe" : "Subscribe to Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                History of parameter changes and their effects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] overflow-auto">
              {auditLogs.length === 0 ? (
                <p className="text-center text-gray-500">No audit logs yet</p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardHeader className="py-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm">
                            {log.formId}.{log.parameterId}
                          </CardTitle>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">
                          <strong>Event:</strong> {log.eventType}
                        </p>
                        <p className="text-sm">
                          <strong>Previous:</strong>{" "}
                          {JSON.stringify(log.previousValue)}
                        </p>
                        <p className="text-sm">
                          <strong>New:</strong> {JSON.stringify(log.newValue)}
                        </p>
                        {log.affectedParameters &&
                          log.affectedParameters.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">
                                Affected Parameters:
                              </p>
                              <ul className="list-disc pl-5">
                                {log.affectedParameters.map(
                                  (param: any, i: number) => (
                                    <li key={i} className="text-xs">
                                      {param.formId}.{param.parameterId} (
                                      {param.changeType})
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={refreshAuditLogs}>Refresh Logs</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Real-time notifications from subscribed parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] overflow-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500">
                  {subscriptionId
                    ? "No notifications yet"
                    : "Subscribe to a parameter to see notifications"}
                </p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardHeader className="py-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm">
                            {notification.formId}.{notification.parameterId}
                          </CardTitle>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">
                          <strong>Event:</strong> {notification.eventType}
                        </p>
                        <p className="text-sm">
                          <strong>Previous:</strong>{" "}
                          {JSON.stringify(notification.previousValue)}
                        </p>
                        <p className="text-sm">
                          <strong>New:</strong>{" "}
                          {JSON.stringify(notification.newValue)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={clearNotifications} variant="outline">
                Clear Notifications
              </Button>
              {subscriptionId && (
                <div className="text-sm text-green-600">
                  Subscribed with ID: {subscriptionId.substring(0, 8)}...
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormParameterTrackerDemo;
