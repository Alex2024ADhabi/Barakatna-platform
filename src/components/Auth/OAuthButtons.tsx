import React from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface OAuthButtonsProps {
  onSuccess?: () => void;
  isDisabled?: boolean;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onSuccess,
  isDisabled = false,
}) => {
  const { toast } = useToast();

  const handleOAuthLogin = (provider: string) => {
    // In a real application, this would redirect to the OAuth provider
    toast({
      title: "OAuth Login",
      description: `${provider} login would be implemented in production`,
    });

    // Simulate successful login after a delay
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      }
    }, 1500);
  };

  return (
    <div className="grid gap-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button
          variant="outline"
          type="button"
          disabled={isDisabled}
          onClick={() => handleOAuthLogin("Google")}
          className="flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
          Google
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isDisabled}
          onClick={() => handleOAuthLogin("Microsoft")}
          className="flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <rect width="20" height="20" x="2" y="2" rx="2" />
          </svg>
          Microsoft
        </Button>
      </div>
    </div>
  );
};

export default OAuthButtons;
