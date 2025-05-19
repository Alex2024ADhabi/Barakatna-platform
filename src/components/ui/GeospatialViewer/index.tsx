import React, { useState } from "react";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  data: any;
  color: string;
  size: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface GeospatialViewerProps {
  locations: Location[];
  title: string;
  height?: number;
  initialZoom?: number;
  initialCenter?: [number, number];
  onLocationSelect?: (location: Location) => void;
  categories?: Category[];
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  className?: string;
}

export const GeospatialViewer: React.FC<GeospatialViewerProps> = ({
  locations = [],
  title,
  height = 400,
  initialZoom = 10,
  initialCenter = [0, 0],
  onLocationSelect,
  categories = [],
  showSearch = false,
  showCategoryFilter = false,
  className = "",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter locations based on search and category
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      !searchTerm ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || location.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className={`geospatial-viewer bg-white p-4 rounded-md ${className}`}
      style={{ height }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {showSearch && (
            <input
              type="text"
              placeholder="Search locations..."
              className="px-3 py-1 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}

          {showCategoryFilter && categories.length > 0 && (
            <select
              className="px-3 py-1 border rounded-md"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Map placeholder - in a real implementation, this would be a map component */}
      <div className="border rounded-md h-[calc(100%-6rem)] flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-2">Map Visualization Placeholder</p>
        <p className="text-sm text-gray-400">
          {filteredLocations.length} locations available
        </p>

        {/* Location list */}
        <div className="mt-4 max-h-[200px] overflow-y-auto w-full max-w-md px-4">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="p-2 border-b hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => onLocationSelect && onLocationSelect(location)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: location.color }}
              />
              <span>{location.name}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
