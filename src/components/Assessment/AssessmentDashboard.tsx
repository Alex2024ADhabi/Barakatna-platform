import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AssessmentDashboard: React.FC = () => {
  const { t } = useTranslation();

  // Mock assessment data
  const assessments = [
    {
      id: 1,
      beneficiary: "Ahmed Ali",
      address: "123 Main St, Abu Dhabi",
      status: "Completed",
      date: "2023-06-10",
    },
    {
      id: 2,
      beneficiary: "Fatima Hassan",
      address: "456 Park Ave, Dubai",
      status: "In Progress",
      date: "2023-06-12",
    },
    {
      id: 3,
      beneficiary: "Mohammed Khalid",
      address: "789 Oak Rd, Sharjah",
      status: "Scheduled",
      date: "2023-06-15",
    },
    {
      id: 4,
      beneficiary: "Aisha Rahman",
      address: "321 Pine St, Abu Dhabi",
      status: "Completed",
      date: "2023-06-08",
    },
    {
      id: 5,
      beneficiary: "Omar Saeed",
      address: "654 Cedar Ln, Dubai",
      status: "Pending Approval",
      date: "2023-06-11",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("assessments")}</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("new_assessment")}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("total_assessments")}
          </div>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("completed")}
          </div>
          <div className="text-2xl font-bold">16</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("in_progress")}
          </div>
          <div className="text-2xl font-bold">5</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("pending_approval")}
          </div>
          <div className="text-2xl font-bold">3</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={t("search_assessments")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="all">{t("all_statuses")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="in_progress">{t("in_progress")}</option>
              <option value="scheduled">{t("scheduled")}</option>
              <option value="pending_approval">{t("pending_approval")}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("id")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("beneficiary")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("address")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("status")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("date")}
                </th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle">{assessment.id}</td>
                  <td className="p-4 align-middle">{assessment.beneficiary}</td>
                  <td className="p-4 align-middle">{assessment.address}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        assessment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : assessment.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : assessment.status === "Scheduled"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle">{assessment.date}</td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/assessments/${assessment.id}`}
                        className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                      >
                        {t("view")}
                      </Link>
                      <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        {t("edit")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t("showing_results", { start: 1, end: 5, total: 24 })}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md border border-input bg-background p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled
              >
                {t("previous")}
              </button>
              <button className="inline-flex items-center justify-center rounded-md border border-input bg-background p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                {t("next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
