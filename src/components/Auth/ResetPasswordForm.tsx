import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  // Get token from URL
  const token = searchParams.get("token");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Password reset logic would go here using the token
    setSubmitted(true);
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("invalid_reset_link")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("invalid_reset_link_description")}
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/forgot-password"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("try_again")}
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">
            {t("password_reset_successful")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("password_reset_successful_description")}
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("login_with_new_password")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("reset_password")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("enter_new_password")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {t("new_password")}
          </label>
          <input
            id="password"
            type="password"
            placeholder={t("enter_new_password")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            {t("confirm_new_password")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder={t("confirm_new_password")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("reset_password")}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
