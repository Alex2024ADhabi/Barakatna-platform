import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { QrCode } from "lucide-react";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * A component that simulates QR code scanning functionality.
 * In a real implementation, this would use a QR code scanning library.
 */
export const QrScanner = ({
  onScan,
  onError,
  onCancel,
  className = "",
}: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // This is a mock function to simulate scanning
  // In a real implementation, this would use a QR code scanning library
  const simulateScan = () => {
    setIsScanning(true);

    // Generate a mock QR code data after a delay to simulate scanning
    setTimeout(() => {
      const mockQrData = JSON.stringify({
        id: `EQ-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        serialNumber: `SN-${Math.floor(Math.random() * 100000)
          .toString()
          .padStart(5, "0")}`,
        model: "Sample Model",
        timestamp: new Date().toISOString(),
      });

      setIsScanning(false);
      onScan(mockQrData);
    }, 1500);
  };

  // In a real implementation, this would handle camera access and scanning
  const startRealScanner = async () => {
    setIsScanning(true);
    setError(null);

    try {
      // This is where you would initialize a real QR code scanner
      // For example, using a library like jsQR or qr-scanner

      // Mock implementation - just simulate a scan after a delay
      simulateScan();
    } catch (err) {
      setIsScanning(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      if (onError) onError(error);
    }
  };

  const handleCancel = () => {
    setIsScanning(false);
    if (onCancel) onCancel();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md relative overflow-hidden">
        {isScanning ? (
          <>
            {/* This would be a video feed in a real implementation */}
            <div className="absolute inset-0 bg-black bg-opacity-5">
              <div className="absolute left-0 top-0 w-full h-full">
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-primary animate-pulse"></div>
              </div>
            </div>
            <div className="text-center z-10">
              <QrCode className="h-12 w-12 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Scanning...</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Position QR code in the scanner area
            </p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {!isScanning ? (
          <Button onClick={startRealScanner}>Scan QR Code</Button>
        ) : (
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default QrScanner;
