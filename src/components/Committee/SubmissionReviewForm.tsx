import React, { useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SubmissionReviewFormProps {
  submissionId: string;
  submissionType: "assessment" | "project" | "budget" | "other";
  onComplete?: () => void;
  onCancel?: () => void;
}

const SubmissionReviewForm: React.FC<SubmissionReviewFormProps> = ({
  submissionId,
  submissionType,
  onComplete,
  onCancel,
}) => {
  const [decision, setDecision] = useState<
    "approved" | "rejected" | "deferred" | ""
  >("");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Review{" "}
          {submissionType.charAt(0).toUpperCase() + submissionType.slice(1)} #
          {submissionId}
        </h2>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Submission Details</h3>
            <p className="text-sm text-gray-600 mb-2">
              This is a sample {submissionType} submission for review.
            </p>
            {submissionType === "assessment" && (
              <div className="mt-4">
                <h4 className="font-medium">Assessment Information</h4>
                <ul className="list-disc list-inside text-sm mt-2">
                  <li>Room Type: Bathroom</li>
                  <li>Modifications: Install grab bars, Replace bathtub</li>
                  <li>Estimated Cost: AED 12,500</li>
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="beneficiary" className="space-y-4 mt-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Beneficiary Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Name</p>
                <p>Ahmed Al Mansouri</p>
              </div>
              <div>
                <p className="font-medium">Age</p>
                <p>72</p>
              </div>
              <div>
                <p className="font-medium">Client Type</p>
                <p>FDF</p>
              </div>
              <div>
                <p className="font-medium">Contact</p>
                <p>+971 50 123 4567</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decision" className="space-y-4 mt-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Make Decision</h3>
            <div className="flex space-x-2 mb-4">
              <Button
                variant={decision === "approved" ? "default" : "outline"}
                onClick={() => setDecision("approved")}
              >
                Approve
              </Button>
              <Button
                variant={decision === "rejected" ? "destructive" : "outline"}
                onClick={() => setDecision("rejected")}
              >
                Reject
              </Button>
              <Button
                variant={decision === "deferred" ? "secondary" : "outline"}
                onClick={() => setDecision("deferred")}
              >
                Defer
              </Button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter your comments or rationale for the decision..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!decision}>
          Submit Decision
        </Button>
      </div>
    </div>
  );
};

export default SubmissionReviewForm;
