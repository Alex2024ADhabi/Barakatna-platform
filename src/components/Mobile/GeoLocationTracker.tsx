import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { AlertCircle, MapPin } from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface GeoLocationTrackerProps {
  assessmentId: string;
  onLocationCaptured?: (location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
}

export default function GeoLocationTracker({
  assessmentId,
  onLocationCaptured,
  initialLocation,
}: GeoLocationTrackerProps) {
  const [location, setLocation] = useState(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setLocation(newLocation);
        setLoading(false);

        if (onLocationCaptured) {
          onLocationCaptured(newLocation);
        }

        // Store location in offline storage
        try {
          localStorage.setItem(
            `assessment_${assessmentId}_location`,
            JSON.stringify(newLocation),
          );
        } catch (err) {
          console.error("Failed to store location data locally", err);
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const formatCoordinate = (value: number) => {
    return value.toFixed(6);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <MapPin className="mr-2" /> Location Tracker
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
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {location ? (
          <div className="space-y-2">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Latitude</p>
                  <p className="font-mono">
                    {formatCoordinate(location.latitude)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Longitude</p>
                  <p className="font-mono">
                    {formatCoordinate(location.longitude)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Accuracy</p>
                  <p>{location.accuracy.toFixed(1)} meters</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Timestamp</p>
                  <p className="text-xs">
                    {formatTimestamp(location.timestamp)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={captureLocation}
                disabled={loading}
              >
                Update Location
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-4 text-center">
              Capture the property's location to include in the assessment
            </p>
            <Button onClick={captureLocation} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Getting Location...
                </>
              ) : (
                "Capture Location"
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          {location
            ? "Location data captured successfully"
            : "No location data captured yet"}
        </div>
      </CardFooter>
    </Card>
  );
}
