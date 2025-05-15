import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubmissionReviewStoryboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("assessment");
  const [showForm, setShowForm] = useState(false);
  const [submissionId, setSubmissionId] = useState("assess-001");

  const handleComplete = () => {
    setShowForm(false);
    alert("Decision submitted successfully!");
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">
        {t("committee.submissionReview", "Committee Submission Review")}
      </h1>

      {!showForm ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assessment">
                {t("committee.assessments", "Assessments")}
              </TabsTrigger>
              <TabsTrigger value="project">
                {t("committee.projects", "Projects")}
              </TabsTrigger>
              <TabsTrigger value="budget">
                {t("committee.budgetRequests", "Budget Requests")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t(
                      "committee.bathroomModification",
                      "Bathroom Modification Assessment",
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.beneficiaryId", "Beneficiary")} #12345
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.assessmentDescription",
                      "Assessment for installing grab bars and shower seat",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("assess-001");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t(
                      "committee.kitchenModification",
                      "Kitchen Modification Assessment",
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.beneficiaryId", "Beneficiary")} #67890
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.kitchenDescription",
                      "Assessment for lowering countertops and accessible cabinets",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("assess-002");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t(
                      "committee.bedroomModification",
                      "Bedroom Modification Assessment",
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.beneficiaryId", "Beneficiary")} #24680
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.bedroomDescription",
                      "Assessment for installing hospital bed and mobility aids",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("assess-003");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t(
                      "committee.homeModifications",
                      "Home Modifications Project",
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.beneficiaryId", "Beneficiary")} #54321
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.fundingRequest",
                      "Funding request for comprehensive home modifications",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("proj-001");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t(
                      "committee.accessibilityRamp",
                      "Accessibility Ramp Project",
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.beneficiaryId", "Beneficiary")} #98765
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.rampRequest",
                      "Funding request for exterior accessibility ramp installation",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("proj-002");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 space-y-2">
                  <h3 className="font-medium">
                    {t("committee.q3Budget", "Q3 Budget Allocation")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("committee.fdfClient", "FDF Client Type")}
                  </p>
                  <p className="text-sm">
                    {t(
                      "committee.budgetAllocation",
                      "Quarterly budget allocation for home modification projects",
                    )}
                  </p>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setSubmissionId("budget-001");
                        setShowForm(true);
                      }}
                    >
                      {t("common.review", "Review")}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {t("committee.reviewingSubmission", "Reviewing Submission")}{" "}
              {submissionId}
            </h2>
            <Button variant="outline" onClick={handleCancel}>
              {t("common.back", "Back")}
            </Button>
          </div>

          <div className="border rounded-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {submissionId.startsWith("assess")
                  ? t("committee.assessmentDetails", "Assessment Details")
                  : submissionId.startsWith("proj")
                    ? t("committee.projectDetails", "Project Details")
                    : t("committee.budgetDetails", "Budget Details")}
              </h3>
              <p className="text-gray-600">
                {submissionId === "assess-001"
                  ? t(
                      "committee.bathroomDescription",
                      "Assessment for installing grab bars and shower seat for elderly beneficiary with mobility issues.",
                    )
                  : submissionId === "assess-002"
                    ? t(
                        "committee.kitchenDescription",
                        "Assessment for lowering countertops and installing accessible cabinets for wheelchair user.",
                      )
                    : submissionId === "assess-003"
                      ? t(
                          "committee.bedroomDescription",
                          "Assessment for installing hospital bed and mobility aids for bedridden beneficiary.",
                        )
                      : submissionId === "proj-001"
                        ? t(
                            "committee.homeModDescription",
                            "Comprehensive home modification project including bathroom, kitchen, and entrance modifications.",
                          )
                        : submissionId === "proj-002"
                          ? t(
                              "committee.rampDescription",
                              "Construction of exterior wheelchair ramp with proper slope and handrails.",
                            )
                          : t(
                              "committee.budgetDescription",
                              "Quarterly budget allocation for home modification projects across all client types.",
                            )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">
                  {t("committee.beneficiary", "Beneficiary")}
                </h4>
                <p className="text-sm">
                  {submissionId === "assess-001"
                    ? "Ahmed Al Mansouri, 72, FDF Client"
                    : submissionId === "assess-002"
                      ? "Fatima Al Hashemi, 68, ADHA Client"
                      : submissionId === "assess-003"
                        ? "Khalid Al Mazrouei, 65, ADHA Client"
                        : submissionId === "proj-001"
                          ? "Mohammed Al Zaabi, 75, FDF Client"
                          : submissionId === "proj-002"
                            ? "Aisha Al Suwaidi, 70, Cash Client"
                            : "N/A"}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">
                  {t("committee.estimatedCost", "Estimated Cost")}
                </h4>
                <p className="text-sm">
                  {submissionId === "assess-001"
                    ? "AED 15,000"
                    : submissionId === "assess-002"
                      ? "AED 22,500"
                      : submissionId === "assess-003"
                        ? "AED 18,000"
                        : submissionId === "proj-001"
                          ? "AED 45,000"
                          : submissionId === "proj-002"
                            ? "AED 12,000"
                            : "AED 250,000"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-1">
                {t("committee.comments", "Committee Comments")}
              </h4>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
                placeholder={t(
                  "committee.enterComments",
                  "Enter your comments here...",
                )}
              ></textarea>
            </div>

            <div>
              <h4 className="font-medium mb-1">
                {t("committee.decision", "Decision")}
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">
                  {t("committee.approve", "Approve")}
                </Button>
                <Button variant="outline">
                  {t(
                    "committee.approveWithConditions",
                    "Approve with Conditions",
                  )}
                </Button>
                <Button variant="secondary">
                  {t("committee.defer", "Defer")}
                </Button>
                <Button variant="destructive">
                  {t("committee.reject", "Reject")}
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleComplete}>
                {t("common.submit", "Submit Decision")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
