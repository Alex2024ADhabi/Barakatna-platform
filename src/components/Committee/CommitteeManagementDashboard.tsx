import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const CommitteeManagementDashboard: React.FC = () => {
  const { t } = useTranslation();

  // Mock committee data
  const committees = [
    {
      id: 1,
      name: "Assessment Approval Committee",
      members: 5,
      pendingSubmissions: 3,
      lastMeeting: "2023-06-10",
    },
    {
      id: 2,
      name: "Budget Allocation Committee",
      members: 7,
      pendingSubmissions: 1,
      lastMeeting: "2023-06-08",
    },
    {
      id: 3,
      name: "Project Review Committee",
      members: 6,
      pendingSubmissions: 2,
      lastMeeting: "2023-06-12",
    },
    {
      id: 4,
      name: "Quality Assurance Committee",
      members: 4,
      pendingSubmissions: 0,
      lastMeeting: "2023-06-05",
    },
    {
      id: 5,
      name: "Vendor Selection Committee",
      members: 5,
      pendingSubmissions: 4,
      lastMeeting: "2023-06-11",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("committees")}</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("new_committee")}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("total_committees")}
          </div>
          <div className="text-2xl font-bold">5</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("pending_submissions")}
          </div>
          <div className="text-2xl font-bold">10</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("upcoming_meetings")}
          </div>
          <div className="text-2xl font-bold">3</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={t("search_committees")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("name")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("members")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("pending_submissions")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("last_meeting")}
                </th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {committees.map((committee) => (
                <tr key={committee.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">
                    {committee.name}
                  </td>
                  <td className="p-4 align-middle">{committee.members}</td>
                  <td className="p-4 align-middle">
                    {committee.pendingSubmissions > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        {committee.pendingSubmissions}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        0
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-middle">{committee.lastMeeting}</td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/committees/${committee.id}`}
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
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {t("recent_submissions")}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <div className="font-medium">
                  {t("submission_title", { number: i })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("submitted_by", { name: `User ${i}` })}
                </div>
              </div>
              <Link
                to={`/committees/submissions/${i}`}
                className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                {t("review")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommitteeManagementDashboard;
