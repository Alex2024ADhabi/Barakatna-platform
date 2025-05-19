import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../App.provider";

const DashboardOverview: React.FC = () => {
  const { t } = useTranslation();
  const { clientType } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <div className="text-sm text-muted-foreground">
          {clientType} {t("client")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("assessments")}
          </div>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("projects")}
          </div>
          <div className="text-2xl font-bold">12</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("beneficiaries")}
          </div>
          <div className="text-2xl font-bold">156</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            {t("pending_approvals")}
          </div>
          <div className="text-2xl font-bold">8</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {t("recent_activities")}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="text-sm">
                  {t("activity_item", { number: i })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t("upcoming_tasks")}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-secondary"></div>
                <div className="text-sm">{t("task_item", { number: i })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
