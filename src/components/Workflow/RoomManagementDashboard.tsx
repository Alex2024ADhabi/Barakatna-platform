import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Room {
  id: string;
  name: string;
  type: string;
  status: "pending" | "in-progress" | "completed";
  lastUpdated: string;
  assignedTo?: string;
}

const sampleRooms: Room[] = [
  {
    id: "room-1",
    name: "Living Room",
    type: "Common Area",
    status: "completed",
    lastUpdated: "2023-10-15",
    assignedTo: "Ahmed Ali",
  },
  {
    id: "room-2",
    name: "Master Bathroom",
    type: "Bathroom",
    status: "in-progress",
    lastUpdated: "2023-10-18",
    assignedTo: "Sara Mohammed",
  },
  {
    id: "room-3",
    name: "Kitchen",
    type: "Kitchen",
    status: "pending",
    lastUpdated: "2023-10-12",
  },
  {
    id: "room-4",
    name: "Bedroom 1",
    type: "Bedroom",
    status: "pending",
    lastUpdated: "2023-10-10",
  },
];

const RoomManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = sampleRooms.filter((room) => {
    if (activeTab !== "all" && room.status !== activeTab) {
      return false;
    }

    if (
      searchQuery &&
      !room.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("Room Management")}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("Add Room")}
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder={t("Search rooms...")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("All Rooms")}</TabsTrigger>
          <TabsTrigger value="pending">{t("Pending")}</TabsTrigger>
          <TabsTrigger value="in-progress">{t("In Progress")}</TabsTrigger>
          <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.type}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}
                      >
                        {t(room.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {room.assignedTo
                          ? t("Assigned to: {{name}}", {
                              name: room.assignedTo,
                            })
                          : t("Unassigned")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("Updated: {{date}}", { date: room.lastUpdated })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No rooms found matching your criteria")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Content will be filtered by the activeTab state */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.type}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}
                      >
                        {t(room.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {room.assignedTo
                          ? t("Assigned to: {{name}}", {
                              name: room.assignedTo,
                            })
                          : t("Unassigned")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("Updated: {{date}}", { date: room.lastUpdated })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No pending rooms found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {/* Same structure as above, filtered by tab */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.type}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}
                      >
                        {t(room.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {room.assignedTo
                          ? t("Assigned to: {{name}}", {
                              name: room.assignedTo,
                            })
                          : t("Unassigned")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("Updated: {{date}}", { date: room.lastUpdated })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No in-progress rooms found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* Same structure as above, filtered by tab */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <Card key={room.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">{room.type}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(room.status)}`}
                      >
                        {t(room.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {room.assignedTo
                          ? t("Assigned to: {{name}}", {
                              name: room.assignedTo,
                            })
                          : t("Unassigned")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("Updated: {{date}}", { date: room.lastUpdated })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No completed rooms found")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoomManagementDashboard;
