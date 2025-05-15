import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Clock,
} from "lucide-react";
import { Inspection, InspectionItem } from "@/lib/api/inspection/types";
import { inspectionApi } from "@/lib/api/inspection/inspectionApi";

interface InspectionFormProps {
  inspectionId: number;
  onComplete?: () => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  inspectionId = 1,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        setLoading(true);
        const inspectionData = await inspectionApi.getInspection(inspectionId);
        const itemsData = await inspectionApi.getInspectionItems(inspectionId);

        if (inspectionData) {
          setInspection(inspectionData);
          setNotes(inspectionData.notes || "");
        }

        setItems(itemsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching inspection data:", err);
        setError("Failed to load inspection data");
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [inspectionId]);

  const handleStatusChange = (
    itemId: number,
    status: "pass" | "fail" | "na",
  ) => {
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, status } : item)),
    );
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, save all items and update inspection status
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Inspection results saved successfully");

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Error saving inspection results:", err);
      setError("Failed to save inspection results");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // In a real implementation, mark inspection as completed
      await inspectionApi.updateInspectionStatus(
        inspectionId,
        "Completed",
        new Date().toISOString().split("T")[0],
      );

      setSuccess("Inspection marked as completed");

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Error completing inspection:", err);
      setError("Failed to complete inspection");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading inspection data...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto" />
        <p className="mt-2">Inspection not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{inspection.inspectionType} Inspection</CardTitle>
            <Badge status={inspection.status} />
          </div>
          <div className="text-sm text-gray-500">
            <p>Room: {inspection.roomId}</p>
            <p>Inspector: {inspection.inspectorName}</p>
            <p>Scheduled: {inspection.scheduledDate}</p>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="text-center p-4">
                <p>No inspection items found</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{item.description}</h3>

                  <RadioGroup
                    value={item.status}
                    onValueChange={(value) =>
                      handleStatusChange(
                        item.id,
                        value as "pass" | "fail" | "na",
                      )
                    }
                    className="flex space-x-4 mb-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pass" id={`pass-${item.id}`} />
                      <Label
                        htmlFor={`pass-${item.id}`}
                        className="text-green-600 font-medium"
                      >
                        Pass
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fail" id={`fail-${item.id}`} />
                      <Label
                        htmlFor={`fail-${item.id}`}
                        className="text-red-600 font-medium"
                      >
                        Fail
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="na" id={`na-${item.id}`} />
                      <Label
                        htmlFor={`na-${item.id}`}
                        className="text-gray-600 font-medium"
                      >
                        N/A
                      </Label>
                    </div>
                  </RadioGroup>

                  <Textarea
                    placeholder="Add notes"
                    value={item.notes || ""}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    className="mb-3"
                  />

                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-1" />
                      Add Photo
                    </Button>

                    {item.photoUrl && (
                      <div className="w-16 h-16 rounded overflow-hidden">
                        <img
                          src={item.photoUrl}
                          alt="Inspection item"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="notes">Overall Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add overall inspection notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleComplete} disabled={saving}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Inspection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Badge = ({ status }: { status: string }) => {
  switch (status) {
    case "Completed":
      return (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          {status}
        </div>
      );
    case "Scheduled":
      return (
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {status}
        </div>
      );
    default:
      return (
        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {status}
        </div>
      );
  }
};

export default InspectionForm;
