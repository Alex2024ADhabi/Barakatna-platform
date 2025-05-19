import React from "react";
import { useTranslation } from "react-i18next";

const UserManagement: React.FC = () => {
  const { t } = useTranslation();

  // Mock user data
  const users = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      role: "Administrator",
      status: "Active",
    },
    {
      id: 2,
      username: "manager",
      email: "manager@example.com",
      role: "Manager",
      status: "Active",
    },
    {
      id: 3,
      username: "user1",
      email: "user1@example.com",
      role: "User",
      status: "Active",
    },
    {
      id: 4,
      username: "user2",
      email: "user2@example.com",
      role: "User",
      status: "Inactive",
    },
    {
      id: 5,
      username: "assessor",
      email: "assessor@example.com",
      role: "Assessor",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("user_management")}</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("add_user")}
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={t("search_users")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="all">{t("all_roles")}</option>
              <option value="admin">{t("administrator")}</option>
              <option value="manager">{t("manager")}</option>
              <option value="user">{t("user")}</option>
              <option value="assessor">{t("assessor")}</option>
            </select>
            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="all">{t("all_statuses")}</option>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("username")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("email")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("role")}
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
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle">{user.username}</td>
                  <td className="p-4 align-middle">{user.email}</td>
                  <td className="p-4 align-middle">{user.role}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button className="inline-flex items-center justify-center rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
                        {t("edit")}
                      </button>
                      <button className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">
                        {t("delete")}
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
              {t("showing_results", { start: 1, end: 5, total: 5 })}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md border border-input bg-background p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled
              >
                {t("previous")}
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md border border-input bg-background p-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled
              >
                {t("next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
