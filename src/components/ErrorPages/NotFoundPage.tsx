import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] text-center">
      <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-3xl font-bold mt-4">{t("page_not_found")}</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        {t("page_not_found_description")}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("back_to_home")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
