import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../App.provider";

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const { theme, clientType } = useAppContext();

  return (
    <div
      className={`min-h-screen bg-background ${theme === "dark" ? "dark" : ""}`}
    >
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Barakatna Platform</h1>
            <span className="text-sm text-muted-foreground">{clientType}</span>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium">
              {t("dashboard")}
            </a>
            <a href="/procurement" className="text-sm font-medium">
              {t("procurement")}
            </a>
             <a href="/manpower" className="text-sm font-medium">
              {t("manpower")}
            </a>
             <a href="/beneficiary" className="text-sm font-medium">
              {t("beneficiaries")}
            </a>
             <a href="/pricelist" className="text-sm font-medium">
              {t("pricelist")}
            </a>
             <a href="/cohort" className="text-sm font-medium">
              {t("cohort")}
            </a>
             <a href="/projects" className="text-sm font-medium">
              {t("projects")}
            </a>
            <a href="/supplier" className="text-sm font-medium">
              {t("supplier")}
            </a>
            <a href="/budget" className="text-sm font-medium">
              {t("budget")}
            </a>
            <a href="/financial" className="text-sm font-medium">
              {t("financial")}
            </a>
            <a href="/clients" className="text-sm font-medium">
              {t("client")}
            </a>
            <a href="/assessments" className="text-sm font-medium">
              {t("assessments")}
            </a>
            <a href="/committees" className="text-sm font-medium">
              {t("committees")}
            </a>
            <a href="/admin" className="text-sm font-medium">
              {t("admin")}
            </a>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-background py-4">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Barakatna Platform
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
