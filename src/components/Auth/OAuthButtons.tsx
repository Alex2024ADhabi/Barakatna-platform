import React from "react";
import { useTranslation } from "react-i18next";

interface OAuthButtonsProps {
  onSuccess?: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess }) => {
  const { t } = useTranslation();

  const handleOAuthLogin = (provider: string) => {
    // OAuth login logic would go here
    console.log(`Logging in with ${provider}`);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => handleOAuthLogin("google")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
            fill="#EA4335"
          />
        </svg>
        {t("continue_with_google")}
      </button>
      <button
        onClick={() => handleOAuthLogin("microsoft")}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.31H0V16h7.462V8.31zM16 8.31H8.538V16H16V8.31z"
            fill="#00A4EF"
          />
        </svg>
        {t("continue_with_microsoft")}
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OAuthButtons;
