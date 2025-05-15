import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface MFAVerificationFormProps {
  onVerify?: (code: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MFAVerificationForm = ({
  onVerify,
  onCancel,
  isLoading = false,
}: MFAVerificationFormProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (onVerify) {
      onVerify(verificationCode);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-center">
          Enter the verification code sent to your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                id="verification-code"
                placeholder="Enter verification code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-xl tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MFAVerificationForm;
