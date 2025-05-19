import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const adminModules = [
    {
      id: "users",
      name: t("user_management"),
      path: "/admin/users",
      icon: "👤",
    },
    {
      id: "roles",
      name: t("role_management"),
      path: "/admin/roles",
      icon: "🔑",
    },
    {
      id: "permissions",
      name: t("permission_management"),
      path: "/admin/permissions",
      icon: "🛡️",
    },
    {
      id: "config",
      name: t("system_configuration"),
      path: "/admin/configuration",
      icon: "⚙️",
    },
    {
      id: "audit",
      name: t("audit_logs"),
      path: "/admin/audit-logs",
      icon: "📋",
    },
    {
      id: "backup",
      name: t("system_backup"),
      path: "/admin/backup",
      icon: "💾",
    },
    {
      id: "health",
      name: t("system_health"),
      path: "/admin/health",
      icon: "📊",
    },
    {
      id: "workflow",
      name: t("workflow_definition"),
      path: "/admin/workflow",
      icon: "🔄",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("administration")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminModules.map((module) => (
          <Link
            key={module.id}
            to={module.path}
            className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="text-3xl mb-2">{module.icon}</div>
            <div className="text-lg font-medium">{module.name}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{t("system_status")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>{t("server_status")}</span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {t("online")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("database_status")}</span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {t("connected")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("last_backup")}</span>
            <span className="text-sm text-muted-foreground">
              2023-06-15 14:30
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("active_users")}</span>
            <span className="text-sm">24</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
