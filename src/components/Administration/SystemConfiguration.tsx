import React from "react";
import { useTranslation } from "react-i18next";

const SystemConfiguration: React.FC = () => {
  const { t } = useTranslation();

  // Mock configuration data
  const configurations = [
    {
      id: 1,
      key: "SYSTEM_NAME",
      value: "Barakatna Platform",
      type: "string",
      module: "Core",
    },
    {
      id: 2,
      key: "DEFAULT_LANGUAGE",
      value: "en",
      type: "string",
      module: "Core",
    },
    {
      id: 3,
      key: "ENABLE_NOTIFICATIONS",
      value: "true",
      type: "boolean",
      module: "Notifications",
    },
    {
      id: 4,
      key: "MAX_FILE_SIZE",
      value: "10",
      type: "number",
      module: "Files",
    },
    {
      id: 5,
      key: "ALLOWED_FILE_TYPES",
      value: ".pdf,.jpg,.png,.doc,.docx",
      type: "string",
      module: "Files",
    },
    {
      id: 6,
      key: "SESSION_TIMEOUT",
      value: "30",
      type: "number",
      module: "Security",
    },
    {
      id: 7,
      key: "PASSWORD_EXPIRY_DAYS",
      value: "90",
      type: "number",
      module: "Security",
    },
    {
      id: 8,
      key: "MAINTENANCE_MODE",
      value: "false",
      type: "boolean",
      module: "Core",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("system_configuration")}</h1>
        <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {t("add_configuration")}
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder={t("search_configurations")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="all">{t("all_modules")}</option>
              <option value="core">{t("core")}</option>
              <option value="security">{t("security")}</option>
              <option value="notifications">{t("notifications")}</option>
              <option value="files">{t("files")}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("key")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("value")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("type")}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {t("module")}
                </th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config) => (
                <tr key={config.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle font-mono text-sm">
                    {config.key}
                  </td>
                  <td className="p-4 align-middle font-mono text-sm">
                    {config.value}
                  </td>
                  <td className="p-4 align-middle">{config.type}</td>
                  <td className="p-4 align-middle">{config.module}</td>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {t("client_specific_configurations")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("client_specific_configurations_description")}
          </p>
          <button className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            {t("manage_client_configurations")}
          </button>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {t("configuration_history")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("configuration_history_description")}
          </p>
          <button className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            {t("view_history")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;
