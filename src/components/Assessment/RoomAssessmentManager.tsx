import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const RoomAssessmentManager: React.FC = () => {
  const { t } = useTranslation();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock room data
  const rooms = [
    { id: 1, name: "Living Room", status: "Completed" },
    { id: 2, name: "Kitchen", status: "Completed" },
    { id: 3, name: "Bathroom", status: "In Progress" },
    { id: 4, name: "Bedroom 1", status: "Pending" },
    { id: 5, name: "Bedroom 2", status: "Pending" },
  ];

  // Mock assessment data
  const assessment = {
    id: assessmentId,
    beneficiary: "Ahmed Ali",
    address: "123 Main St, Abu Dhabi",
    status: "In Progress",
    date: "2023-06-12",
    assessor: "Mohammed Khalid",
    completionPercentage: 60,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("assessment")} #{assessmentId}
          </h1>
          <p className="text-muted-foreground">
            {assessment.beneficiary} - {assessment.address}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              assessment.status === "Completed"
                ? "bg-green-100 text-green-800"
                : assessment.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {assessment.status}
          </span>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t("save_assessment")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{t("rooms")}</h2>
            </div>
            <div className="p-0">
              <ul className="divide-y">
                {rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          room.status === "Completed"
                            ? "bg-green-500"
                            : room.status === "In Progress"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      ></span>
                      <span>{room.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {room.status}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t">
                <button className="w-full inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  {t("add_room")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b">
              <div className="flex">
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "overview" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  {t("overview")}
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "measurements" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("measurements")}
                >
                  {t("measurements")}
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "photos" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("photos")}
                >
                  {t("photos")}
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "recommendations" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("recommendations")}
                >
                  {t("recommendations")}
                </button>
              </div>
            </div>
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {t("assessor")}
                      </h3>
                      <p>{assessment.assessor}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {t("assessment_date")}
                      </h3>
                      <p>{assessment.date}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {t("completion")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{
                              width: `${assessment.completionPercentage}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {assessment.completionPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {t("notes")}
                    </h3>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t("enter_assessment_notes")}
                    ></textarea>
                  </div>
                </div>
              )}
              {activeTab === "measurements" && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("select_room_to_view_measurements")}
                </div>
              )}
              {activeTab === "photos" && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("select_room_to_view_photos")}
                </div>
              )}
              {activeTab === "recommendations" && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("select_room_to_view_recommendations")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAssessmentManager;
