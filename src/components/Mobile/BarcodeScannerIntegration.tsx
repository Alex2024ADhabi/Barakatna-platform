import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { AlertCircle, Barcode, Check } from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface BarcodeScannerIntegrationProps {
  assessmentId: string;
  roomId?: string;
  onBarcodeScanned?: (barcodeData: {
    value: string;
    format: string;
    timestamp: number;
  }) => void;
  allowManualEntry?: boolean;
}

export default function BarcodeScannerIntegration({
  assessmentId,
  roomId,
  onBarcodeScanned,
  allowManualEntry = true,
}: BarcodeScannerIntegrationProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<
    Array<{
      value: string;
      format: string;
      timestamp: number;
    }>
  >([]);
  const [manualEntry, setManualEntry] = useState("");
  const [error, setError] = useState("");
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Try to load previously scanned items from local storage
    try {
      const storedItems = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_barcodes`,
      );
      if (storedItems) {
        setScannedItems(JSON.parse(storedItems));
      }
    } catch (err) {
      console.error("Failed to load stored barcode data", err);
    }

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      stopScanner();
    };
  }, [assessmentId, roomId]);

  const startScanner = async () => {
    try {
      setError("");
      // Check if BarcodeDetector is available
      if (!("BarcodeDetector" in window)) {
        setError(
          "Barcode detection is not supported in this browser. Please use manual entry.",
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        detectBarcode();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access camera. Please check permissions or use manual entry.",
      );
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const detectBarcode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    try {
      // @ts-ignore - BarcodeDetector might not be recognized by TypeScript
      const barcodeDetector = new window.BarcodeDetector({
        formats: [
          "aztec",
          "code_128",
          "code_39",
          "code_93",
          "codabar",
          "data_matrix",
          "ean_13",
          "ean_8",
          "itf",
          "pdf417",
          "qr_code",
          "upc_a",
          "upc_e",
        ],
      });

      const video = videoRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          // We found a barcode
          const barcode = barcodes[0];
          handleBarcodeDetected(barcode.rawValue, barcode.format || "unknown");
          stopScanner();
          return;
        }
      }

      // If we get here, no barcode was found, so continue scanning
      requestAnimationFrame(detectBarcode);
    } catch (err) {
      console.error("Barcode detection error:", err);
      setError("Barcode detection failed. Please try manual entry.");
      stopScanner();
    }
  };

  const handleBarcodeDetected = (value: string, format: string) => {
    const newItem = {
      value,
      format,
      timestamp: Date.now(),
    };

    const updatedItems = [...scannedItems, newItem];
    setScannedItems(updatedItems);

    // Save to local storage
    try {
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_barcodes`,
        JSON.stringify(updatedItems),
      );
    } catch (err) {
      console.error("Failed to store barcode data locally", err);
    }

    if (onBarcodeScanned) {
      onBarcodeScanned(newItem);
    }
  };

  const handleManualEntry = () => {
    if (!manualEntry.trim()) {
      setError("Please enter a valid code");
      return;
    }

    handleBarcodeDetected(manualEntry.trim(), "manual");
    setManualEntry("");
    setError("");
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Barcode className="mr-2" /> Barcode Scanner
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs">
              {networkStatus ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden canvas for barcode detection */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {scanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-md bg-black"
            />
            <div className="absolute inset-0 border-2 border-blue-400 border-dashed opacity-70 pointer-events-none"></div>
            <Button
              variant="outline"
              onClick={stopScanner}
              className="absolute top-2 right-2"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <p className="text-gray-500 text-center px-4 mb-4">
                Scan inventory barcodes to track items in this assessment
              </p>
              <Button onClick={startScanner}>Start Scanner</Button>
            </div>

            {allowManualEntry && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Manual Entry</p>
                <div className="flex space-x-2">
                  <Input
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                    placeholder="Enter barcode manually"
                    className="flex-1"
                  />
                  <Button onClick={handleManualEntry}>Add</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {scannedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Scanned Items ({scannedItems.length})
            </p>
            <div className="border rounded-md divide-y">
              {scannedItems.map((item, index) => (
                <div
                  key={index}
                  className="p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-mono text-sm">{item.value}</p>
                    <p className="text-xs text-gray-500">
                      {item.format} · {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                  <Check className="text-green-500" size={18} />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          {scannedItems.length === 0
            ? "No items scanned yet"
            : `${scannedItems.length} item(s) scanned`}
        </p>
      </CardFooter>
    </Card>
  );
}
