import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const RegistrationForm: React.FC = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic would go here
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("register")}</h2>
        <p className="text-sm text-muted-foreground">{t("create_account")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              {t("first_name")}
            </label>
            <input
              id="firstName"
              type="text"
              placeholder={t("enter_first_name")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              {t("last_name")}
            </label>
            <input
              id="lastName"
              type="text"
              placeholder={t("enter_last_name")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>
        </div>
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
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            {t("username")}
          </label>
          <input
            id="username"
            type="text"
            placeholder={t("enter_username")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            placeholder={t("enter_password")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            {t("confirm_password")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder={t("confirm_your_password")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
          <label htmlFor="terms" className="text-sm font-medium">
            {t("agree_to_terms")}
          </label>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("register")}
        </button>
      </form>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t("already_have_account")}{" "}
        </span>
        <Link to="/auth/login" className="text-primary hover:underline">
          {t("login")}
        </Link>
      </div>
    </div>
  );
};

export default RegistrationForm;
