import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";

const CommitteeStoryboard: React.FC = () => {
  const { t } = useTranslation();
  const { committeeId } = useParams<{ committeeId: string }>();

  // Mock committee data
  const committee = {
    id: committeeId,
    name: "Assessment Approval Committee",
    description:
      "Reviews and approves assessment reports before implementation",
    members: [
      {
        id: 1,
        name: "Ahmed Ali",
        role: "Chairman",
        email: "ahmed.ali@example.com",
      },
      {
        id: 2,
        name: "Fatima Hassan",
        role: "Secretary",
        email: "fatima.hassan@example.com",
      },
      {
        id: 3,
        name: "Mohammed Khalid",
        role: "Member",
        email: "mohammed.khalid@example.com",
      },
      {
        id: 4,
        name: "Aisha Rahman",
        role: "Member",
        email: "aisha.rahman@example.com",
      },
      {
        id: 5,
        name: "Omar Saeed",
        role: "Member",
        email: "omar.saeed@example.com",
      },
    ],
    pendingSubmissions: [
      {
        id: 1,
        title: "Assessment #1234 Approval",
        submittedBy: "John Doe",
        date: "2023-06-12",
      },
      {
        id: 2,
        title: "Assessment #1235 Approval",
        submittedBy: "Jane Smith",
        date: "2023-06-13",
      },
      {
        id: 3,
        title: "Assessment #1236 Approval",
        submittedBy: "Robert Johnson",
        date: "2023-06-14",
      },
    ],
    meetings: [
      {
        id: 1,
        date: "2023-06-20",
        time: "10:00 AM",
        location: "Conference Room A",
        status: "Scheduled",
      },
      {
        id: 2,
        date: "2023-06-10",
        time: "11:00 AM",
        location: "Conference Room B",
        status: "Completed",
      },
      {
        id: 3,
        date: "2023-06-05",
        time: "02:00 PM",
        location: "Virtual Meeting",
        status: "Completed",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{committee.name}</h1>
          <p className="text-muted-foreground">{committee.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            {t("schedule_meeting")}
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {t("edit_committee")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">{t("committee_members")}</h2>
          </div>
          <div className="p-0">
            <ul className="divide-y">
              {committee.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.role}
                    </div>
                  </div>
                  <div className="text-sm">{member.email}</div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t">
              <button className="w-full inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                {t("add_member")}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {t("pending_submissions")}
            </h2>
          </div>
          <div className="p-0">
            <ul className="divide-y">
              {committee.pendingSubmissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <div className="font-medium">{submission.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("submitted_by", { name: submission.submittedBy })} -{" "}
                      {submission.date}
                    </div>
                  </div>
                  <Link
                    to={`/committees/submissions/${submission.id}`}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {t("review")}
                  </Link>
                </li>
              ))}
            </ul>
            {committee.pendingSubmissions.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                {t("no_pending_submissions")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{t("committee_meetings")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("date")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("time")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("location")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("status")}
                </th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {committee.meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle">{meeting.date}</td>
                  <td className="p-4 align-middle">{meeting.time}</td>
                  <td className="p-4 align-middle">{meeting.location}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        meeting.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                        {meeting.status === "Scheduled"
                          ? t("view_agenda")
                          : t("view_minutes")}
                      </button>
                      {meeting.status === "Scheduled" && (
                        <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                          {t("edit")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommitteeStoryboard;
