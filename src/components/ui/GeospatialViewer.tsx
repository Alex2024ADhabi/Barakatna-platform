import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import { Input } from "./input";

export interface GeoLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  data?: Record<string, any>;
  color?: string;
  size?: number;
}

export interface GeospatialViewerProps {
  locations: GeoLocation[];
  title?: string;
  className?: string;
  height?: number;
  width?: string;
  initialZoom?: number;
  initialCenter?: [number, number];
  onLocationSelect?: (location: GeoLocation) => void;
  categories?: Array<{ id: string; name: string; color?: string }>;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
}

/**
 * GeospatialViewer component for location-based analysis
 *
 * Uses leaflet for map rendering and location visualization
 */
export function GeospatialViewer({
  locations = [],
  title = "Geospatial Viewer",
  className = "",
  height = 500,
  width = "100%",
  initialZoom = 3,
  initialCenter = [0, 0],
  onLocationSelect,
  categories = [],
  showSearch = true,
  showCategoryFilter = true,
}: GeospatialViewerProps) {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filter locations based on search and category filters
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      searchQuery === "" ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      (location.category && selectedCategories.includes(location.category));
    return matchesSearch && matchesCategory;
  });

  // Initialize map when component mounts
  useEffect(() => {
    let map: any;
    let L: any;

    const initializeMap = async () => {
      try {
        // Dynamic import of leaflet
        const leaflet = await import("leaflet");
        L = leaflet.default;

        // Import CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Initialize map if container exists
        if (mapContainerRef.current && !mapInstanceRef.current) {
          map = L.map(mapContainerRef.current).setView(
            initialCenter,
            initialZoom,
          );

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          mapInstanceRef.current = map;
          setMapLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load map:", error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  // Update markers when locations or filters change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapLoaded || !mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add new markers for filtered locations
        filteredLocations.forEach((location) => {
          const category = categories.find((c) => c.id === location.category);
          const markerColor = location.color || category?.color || "#3b82f6";

          // Create custom icon
          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="
              background-color: ${markerColor};
              width: ${location.size || 10}px;
              height: ${location.size || 10}px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [location.size || 10, location.size || 10],
          });

          const marker = L.marker([location.latitude, location.longitude], {
            icon,
          })
            .addTo(mapInstanceRef.current)
            .bindTooltip(location.name)
            .on("click", () => {
              setSelectedLocation(location);
              if (onLocationSelect) onLocationSelect(location);
            });

          markersRef.current.push(marker);
        });

        // Fit bounds if we have markers and no location is selected
        if (filteredLocations.length > 0 && !selectedLocation) {
          const bounds = L.latLngBounds(
            filteredLocations.map((loc) => [loc.latitude, loc.longitude]),
          );
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Center on selected location if any
        if (selectedLocation) {
          mapInstanceRef.current.setView(
            [selectedLocation.latitude, selectedLocation.longitude],
            mapInstanceRef.current.getZoom() < 10
              ? 10
              : mapInstanceRef.current.getZoom(),
          );
        }
      } catch (error) {
        console.error("Failed to update markers:", error);
      }
    };

    updateMarkers();
  }, [
    filteredLocations,
    selectedLocation,
    categories,
    mapLoaded,
    onLocationSelect,
  ]);

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="text-sm text-gray-500">
            {filteredLocations.length} locations
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {showSearch && (
            <div className="w-full md:w-auto flex-grow md:flex-grow-0 mb-2 md:mb-0">
              <Input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {showCategoryFilter && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1 text-sm rounded-full border ${selectedCategories.includes(category.id) ? "bg-gray-100" : "bg-white text-gray-400"}`}
                  style={
                    selectedCategories.includes(category.id) && category.color
                      ? { borderColor: category.color }
                      : {}
                  }
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color || "#3b82f6" }}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map container */}
        <div
          ref={mapContainerRef}
          style={{ height: `${height}px`, width, backgroundColor: "#f0f0f0" }}
          className="rounded-md overflow-hidden border"
        >
          {!mapLoaded && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Selected location details */}
      {selectedLocation && (
        <CardFooter className="flex flex-col items-start">
          <div className="w-full p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedLocation.latitude.toFixed(6)},{" "}
                  {selectedLocation.longitude.toFixed(6)}
                </p>
                {selectedLocation.category && (
                  <p className="text-sm mt-1">
                    Category:{" "}
                    {categories.find((c) => c.id === selectedLocation.category)
                      ?.name || selectedLocation.category}
                  </p>
                )}
                {selectedLocation.data && (
                  <div className="mt-2">
                    {Object.entries(selectedLocation.data).map(
                      ([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span>{" "}
                          {value.toString()}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
