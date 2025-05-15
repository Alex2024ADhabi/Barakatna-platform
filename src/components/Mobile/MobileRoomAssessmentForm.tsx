import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Spinner } from "../ui/spinner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { assessmentOfflineManager } from "../../services/AssessmentOfflineManager";
import { offlineService } from "../../services/offlineService";

interface MobileRoomAssessmentFormProps {
  assessmentId: string;
  roomId: string;
  onComplete?: () => void;
}

export default function MobileRoomAssessmentForm({
  assessmentId,
  roomId,
  onComplete,
}: MobileRoomAssessmentFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [room, setRoom] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());

  const form = useForm({
    defaultValues: {
      name: "",
      condition: "good",
      notes: "",
      accessibility: "accessible",
      priority: "medium",
    },
  });

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
  }, [assessmentId, roomId]);

  const loadAssessmentData = async () => {
    setLoading(true);
    try {
      const assessmentData =
        await assessmentOfflineManager.getAssessment(assessmentId);
      if (!assessmentData) {
        console.error("Assessment not found");
        return;
      }

      setAssessment(assessmentData);

      const roomData = assessmentData.rooms.find((r) => r.id === roomId);
      if (!roomData) {
        console.error("Room not found");
        return;
      }

      setRoom(roomData);

      // Set form values
      form.reset({
        name: roomData.name || "",
        condition: roomData.condition || "good",
        notes: roomData.notes || "",
        accessibility: roomData.accessibility || "accessible",
        priority: roomData.priority || "medium",
      });
    } catch (error) {
      console.error("Error loading assessment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!assessment || !room) return;

    setSaving(true);
    try {
      // Update room data in the assessment
      const updatedRooms = assessment.rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            ...data,
            lastUpdated: new Date().toISOString(),
          };
        }
        return r;
      });

      // Update assessment with new room data
      await assessmentOfflineManager.updateAssessment(assessmentId, {
        rooms: updatedRooms,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving room assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assessment || !room) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Assessment or room data not found</p>
        <Button
          className="mt-4"
          onClick={() => window.history.back()}
          variant="outline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Room Assessment</CardTitle>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accessibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accessibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="accessible">
                        Fully Accessible
                      </SelectItem>
                      <SelectItem value="partially">
                        Partially Accessible
                      </SelectItem>
                      <SelectItem value="not-accessible">
                        Not Accessible
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modification Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter assessment notes"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : (
                  "Save Assessment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
