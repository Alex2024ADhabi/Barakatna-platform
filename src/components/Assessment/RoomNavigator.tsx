import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Check,
  Plus,
  Trash2,
  Bath,
  Utensils as Kitchen,
  Bed,
  Sofa,
  DoorOpen,
  Warehouse,
  Car,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface RoomType {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  typeId: number;
  roomTypeDetails?: RoomType;
  completed: boolean;
  progress: number;
  measurements: any[];
  recommendations: any[];
  photos: any[];
}

interface RoomNavigatorProps {
  rooms: Room[];
  currentRoomIndex: number;
  onRoomChange: (index: number) => void;
  overallProgress: number;
  onAddRoom?: () => void;
  onRemoveRoom?: (roomId: string) => void;
  canAddRoom?: boolean;
  canRemoveRoom?: boolean;
}

const RoomNavigator: React.FC<RoomNavigatorProps> = ({
  rooms = [],
  currentRoomIndex = 0,
  onRoomChange,
  overallProgress = 0,
  onAddRoom,
  onRemoveRoom,
  canAddRoom = false,
  canRemoveRoom = false,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  const handlePrevious = () => {
    if (currentRoomIndex > 0) {
      onRoomChange(currentRoomIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentRoomIndex < rooms.length - 1) {
      onRoomChange(currentRoomIndex + 1);
    }
  };

  const getRoomIcon = (room: Room) => {
    // Use room type details if available, otherwise fallback to default icon
    const iconName =
      room.roomTypeDetails?.icon || room.type?.toLowerCase() || "home";

    // Map icon names to Lucide icons
    switch (iconName.toLowerCase()) {
      case "bathroom":
        return <Bath className="h-4 w-4" />;
      case "kitchen":
        return <Kitchen className="h-4 w-4" />;
      case "bedroom":
        return <Bed className="h-4 w-4" />;
      case "living":
        return <Sofa className="h-4 w-4" />;
      case "entrance":
        return <DoorOpen className="h-4 w-4" />;
      case "garage":
        return <Car className="h-4 w-4" />;
      case "dining":
        return <Utensils className="h-4 w-4" />;
      case "storage":
        return <Warehouse className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          {t("assessment.roomNavigation")}
        </h3>
        <div className="flex items-center gap-2">
          {canAddRoom && onAddRoom && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRoom}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {t("assessment.addRoom")}
            </Button>
          )}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">
              {t("assessment.overallProgress")}: {overallProgress}%
            </span>
            <Progress value={overallProgress} className="w-24" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentRoomIndex === 0}
          className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {isRTL ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {t("common.previous")}
        </Button>

        <div className="text-sm font-medium">
          {t("assessment.room")} {currentRoomIndex + 1} {t("common.of")}{" "}
          {rooms.length}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentRoomIndex === rooms.length - 1}
          className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {t("common.next")}
          {isRTL ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {rooms.map((room, index) => (
          <div key={room.id} className="relative">
            {canRemoveRoom && onRemoveRoom && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRoom(room.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={index === currentRoomIndex ? "default" : "outline"}
                    size="sm"
                    className={`flex flex-col items-center justify-center h-20 p-2 ${room.completed ? "border-green-500" : ""}`}
                    onClick={() => onRoomChange(index)}
                  >
                    <div className="relative">
                      {getRoomIcon(room)}
                      {room.completed && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs mt-1 text-center truncate w-full">
                      {room.name}
                    </span>
                    <Progress
                      value={room.progress}
                      className="w-full h-1 mt-1"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.roomTypeDetails?.description || room.type}
                  </p>
                  <p className="text-xs">
                    {t("Progress")}: {room.progress}%
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  );
};

// Change from named export to default export
export default RoomNavigator;
