import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Home } from "lucide-react";

interface Room {
  id: string;
  name: string;
  type: string;
  completed: boolean;
  progress: number;
  measurements: any[];
  recommendations: any[];
  photos: any[];
}

interface RoomAssessmentLayoutProps {
  rooms: Room[];
  selectedRoom: Room | null;
  activeTab: string;
  overallProgress: number;
  onRoomSelect: (room: Room) => void;
  onTabChange: (value: string) => void;
  onRoomCompletion: () => void;
  children: React.ReactNode;
}

const RoomAssessmentLayout: React.FC<RoomAssessmentLayoutProps> = ({
  rooms,
  selectedRoom,
  activeTab,
  overallProgress,
  onRoomSelect,
  onTabChange,
  onRoomCompletion,
  children,
}) => {
  return (
    <div className="bg-background p-6 min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Room navigation */}
          <div className="w-full lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Room Navigation
                </CardTitle>
                <CardDescription>
                  Overall Progress: {Math.round(overallProgress)}%
                </CardDescription>
                <Progress value={overallProgress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${selectedRoom?.id === room.id ? "bg-accent" : "hover:bg-accent/50"}`}
                      onClick={() => onRoomSelect(room)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${room.completed ? "bg-green-500" : "bg-amber-500"}`}
                        />
                        <span>{room.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {room.progress}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="w-full lg:w-3/4">
            {selectedRoom ? (
              <div className="space-y-6">
                {/* Room header */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {selectedRoom.name} Assessment
                      </CardTitle>
                      <CardDescription>
                        Progress: {selectedRoom.progress}% complete
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={selectedRoom.completed ? "default" : "outline"}
                      >
                        {selectedRoom.completed ? "Completed" : "In Progress"}
                      </Badge>
                      <Button
                        variant={selectedRoom.completed ? "outline" : "default"}
                        onClick={onRoomCompletion}
                      >
                        {selectedRoom.completed ? "Reopen" : "Mark Complete"}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Room content tabs */}
                <Tabs value={activeTab} onValueChange={onTabChange}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="measurements">Measurements</TabsTrigger>
                    <TabsTrigger value="recommendations">
                      Recommendations
                    </TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                  </TabsList>

                  {children}
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    Please select a room to begin assessment
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAssessmentLayout;
