import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAppContext } from "../../App.provider";

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { setIsAuthenticated } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    setIsAuthenticated(true);
    // Redirect would happen here
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("login")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("enter credentials")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            {t("username")}
          </label>
          <input
            id="username"
            type="text"
            placeholder={t("enter username")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              {t("password")}
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              {t("forgot password")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder={t("enter password")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <label htmlFor="remember" className="text-sm font-medium">
            {t("remember me")}
          </label>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("login")}
        </button>
      </form>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t("dont have account")} </span>
        <Link to="/auth/register" className="text-primary hover:underline">
          {t("register")}
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
