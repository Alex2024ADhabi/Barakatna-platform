import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../App.provider";

const MFAVerificationForm: React.FC = () => {
  const { t } = useTranslation();
  const { setIsAuthenticated } = useAppContext();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify MFA code logic would go here
    if (code.length === 6) {
      setIsAuthenticated(true);
      // Redirect would happen here
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("two_factor_authentication")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("enter_verification_code")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            {t("verification_code")}
          </label>
          <input
            id="code"
            type="text"
            placeholder="000000"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-center tracking-widest font-mono"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          disabled={code.length !== 6}
        >
          {t("verify")}
        </button>
      </form>
      <div className="text-center text-sm">
        <button className="text-primary hover:underline">
          {t("resend_code")}
        </button>
      </div>
    </div>
  );
};

export default MFAVerificationForm;
