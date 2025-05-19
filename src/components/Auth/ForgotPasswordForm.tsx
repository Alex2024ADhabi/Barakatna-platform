import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Password reset logic would go here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t("check_your_email")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("password_reset_email_sent")}
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("back_to_login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("forgot_password")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("enter_email_for_reset")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t("enter_email")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("send_reset_link")}
        </button>
      </form>
      <div className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:underline">
          {t("back_to_login")}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
