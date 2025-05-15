import React, { useState, useEffect } from "react";
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
import { Spinner } from "../ui/spinner";
import { AlertCircle, Save, Camera, MapPin, Mic, PenTool } from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface QuickAssessmentFormProps {
  assessmentId: string;
  roomId?: string;
  onSave?: (formData: any) => void;
  initialData?: any;
}

export default function QuickAssessmentForm({
  assessmentId,
  roomId,
  onSave,
  initialData = {},
}: QuickAssessmentFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    condition: "good", // good, fair, poor
    priority: "medium", // high, medium, low
    estimatedCost: "",
    notes: "",
    ...initialData,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Try to load saved form data from local storage
    try {
      const storedData = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_quick_form`,
      );
      if (storedData) {
        setFormData(JSON.parse(storedData));
      }
    } catch (err) {
      console.error("Failed to load stored form data", err);
    }

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [assessmentId, roomId]);

  // Auto-save form data when it changes
  useEffect(() => {
    if (!formTouched) return;

    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(
          `assessment_${assessmentId}_${roomId || ""}_quick_form`,
          JSON.stringify(formData),
        );
      } catch (err) {
        console.error("Failed to auto-save form data", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [formData, assessmentId, roomId, formTouched]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);

    try {
      // Add timestamp
      const dataToSave = {
        ...formData,
        timestamp: new Date().toISOString(),
        assessmentId,
        roomId,
      };

      // Save to local storage
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_quick_form`,
        JSON.stringify(dataToSave),
      );

      if (onSave) {
        await onSave(dataToSave);
      }

      setFormTouched(false);
    } catch (err) {
      console.error("Error saving form data:", err);
      setError("Failed to save assessment data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quick Assessment</CardTitle>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title for this assessment"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you're assessing"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="condition" className="text-sm font-medium">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="estimatedCost" className="text-sm font-medium">
              Estimated Cost
            </label>
            <Input
              id="estimatedCost"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleInputChange}
              placeholder="Estimated cost (optional)"
              type="number"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Additional Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes or observations"
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                (window.location.href = `#/photo-capture/${assessmentId}/${roomId || ""}`)
              }
            >
              <Camera size={16} className="mr-1" /> Add Photos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                (window.location.href = `#/location/${assessmentId}/${roomId || ""}`)
              }
            >
              <MapPin size={16} className="mr-1" /> Add Location
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                (window.location.href = `#/audio-note/${assessmentId}/${roomId || ""}`)
              }
            >
              <Mic size={16} className="mr-1" /> Add Audio
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                (window.location.href = `#/drawing/${assessmentId}/${roomId || ""}`)
              }
            >
              <PenTool size={16} className="mr-1" /> Add Drawing
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center"
        >
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-1" /> Save Assessment
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
