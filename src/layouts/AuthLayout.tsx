import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AuthLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("barakatna_platform")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("healthcare_platform")}
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
