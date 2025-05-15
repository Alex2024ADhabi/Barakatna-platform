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
import { Textarea } from "../ui/textarea";
import { Spinner } from "../ui/spinner";
import { photoOfflineManager } from "../../services/PhotoOfflineManager";
import { offlineService } from "../../services/offlineService";

interface MobilePhotoCaptureProps {
  assessmentId: string;
  roomId: string;
  onComplete?: () => void;
}

export default function MobilePhotoCapture({
  assessmentId,
  roomId,
  onComplete,
}: MobilePhotoCaptureProps) {
  const [caption, setCaption] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [cameraError, setCameraError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      // Stop camera if active
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        "Could not access camera. Please check permissions or use file upload instead.",
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setDataUrl(imageDataUrl);

      // Stop camera after capture
      stopCamera();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = async () => {
    if (!dataUrl) {
      alert("Please capture or upload a photo first");
      return;
    }

    setSaving(true);
    try {
      await photoOfflineManager.createPhoto({
        assessmentId,
        roomId,
        caption,
        dataUrl,
      });

      // Reset form
      setCaption("");
      setDataUrl("");

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      alert("Failed to save photo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const retakePhoto = () => {
    setDataUrl("");
    startCamera();
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Capture Photo</CardTitle>
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
        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {showCamera ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-md bg-black"
            />
            <Button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-full w-12 h-12 flex items-center justify-center"
            >
              <span className="sr-only">Capture</span>
              <div className="w-8 h-8 rounded-full border-2 border-white"></div>
            </Button>
          </div>
        ) : dataUrl ? (
          <div className="relative">
            <img
              src={dataUrl}
              alt="Captured photo"
              className="w-full h-64 object-cover rounded-md"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={retakePhoto}
              className="absolute top-2 right-2"
            >
              Retake
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              {cameraError ? (
                <p className="text-red-500 text-center px-4">{cameraError}</p>
              ) : (
                <p className="text-gray-500 text-center px-4">
                  No photo captured yet. Use camera or upload a file.
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={startCamera}
                variant="outline"
                className="flex-1"
              >
                Use Camera
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                Upload File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {dataUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a caption for this photo"
              className="w-full"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>

        <Button onClick={savePhoto} disabled={!dataUrl || saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" /> Saving...
            </>
          ) : (
            "Save Photo"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
