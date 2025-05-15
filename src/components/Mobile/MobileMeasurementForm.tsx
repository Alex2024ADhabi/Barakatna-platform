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
import { Spinner } from "../ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { measurementOfflineManager } from "../../services/MeasurementOfflineManager";
import { offlineService } from "../../services/offlineService";

interface MobileMeasurementFormProps {
  assessmentId: string;
  roomId: string;
  measurementId?: string; // Optional for editing existing measurement
  onComplete?: () => void;
}

export default function MobileMeasurementForm({
  assessmentId,
  roomId,
  measurementId,
  onComplete,
}: MobileMeasurementFormProps) {
  const [loading, setLoading] = useState(measurementId ? true : false);
  const [saving, setSaving] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());

  const form = useForm({
    defaultValues: {
      type: "length",
      value: "",
      unit: "cm",
      label: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (measurementId) {
      loadMeasurement();
    }

    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [measurementId]);

  const loadMeasurement = async () => {
    if (!measurementId) return;

    setLoading(true);
    try {
      const measurement =
        await measurementOfflineManager.getMeasurement(measurementId);
      if (measurement) {
        form.reset({
          type: measurement.type || "length",
          value: measurement.value?.toString() || "",
          unit: measurement.unit || "cm",
          label: measurement.label || "",
          notes: measurement.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading measurement:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const numericValue = parseFloat(data.value);
      if (isNaN(numericValue)) {
        form.setError("value", { message: "Please enter a valid number" });
        setSaving(false);
        return;
      }

      const measurementData = {
        assessmentId,
        roomId,
        type: data.type,
        value: numericValue,
        unit: data.unit,
        label: data.label,
        notes: data.notes,
      };

      if (measurementId) {
        // Update existing measurement
        await measurementOfflineManager.updateMeasurement(
          measurementId,
          measurementData,
        );
      } else {
        // Create new measurement
        await measurementOfflineManager.createMeasurement(measurementData);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
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

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{measurementId ? "Edit" : "Add"} Measurement</CardTitle>
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Measurement Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="length">Length</SelectItem>
                      <SelectItem value="width">Width</SelectItem>
                      <SelectItem value="height">Height</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="perimeter">Perimeter</SelectItem>
                      <SelectItem value="diameter">Diameter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter value"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="ft">ft</SelectItem>
                        <SelectItem value="yd">yd</SelectItem>
                        <SelectItem value="sq_cm">cm²</SelectItem>
                        <SelectItem value="sq_m">m²</SelectItem>
                        <SelectItem value="sq_ft">ft²</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Door width, Wall height"
                      {...field}
                    />
                  </FormControl>
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
                    <Input placeholder="Additional notes" {...field} />
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
                  "Save Measurement"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
