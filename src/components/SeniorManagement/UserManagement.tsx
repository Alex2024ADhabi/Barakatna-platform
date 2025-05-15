import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  UserPlus,
  Mail,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  avatarUrl?: string;
  phoneNumber?: string;
}

const sampleUsers: User[] = [
  {
    id: "user-1",
    name: "Mohammed Al-Farsi",
    email: "mohammed.alfarsi@barakatna.org",
    role: "Administrator",
    department: "Management",
    status: "active",
    phoneNumber: "+966 50 123 4567",
  },
  {
    id: "user-2",
    name: "Fatima Al-Zahra",
    email: "fatima.alzahra@barakatna.org",
    role: "Assessment Specialist",
    department: "Field Operations",
    status: "active",
    phoneNumber: "+966 55 987 6543",
  },
  {
    id: "user-3",
    name: "Ahmed Ibrahim",
    email: "ahmed.ibrahim@barakatna.org",
    role: "Project Manager",
    department: "Projects",
    status: "inactive",
    phoneNumber: "+966 54 456 7890",
  },
  {
    id: "user-4",
    name: "Layla Mahmoud",
    email: "layla.mahmoud@barakatna.org",
    role: "Financial Officer",
    department: "Finance",
    status: "pending",
    phoneNumber: "+966 56 234 5678",
  },
];

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = sampleUsers.filter((user) => {
    if (activeTab !== "all" && user.status !== activeTab) {
      return false;
    }

    if (
      searchQuery &&
      !(
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            {t("Active")}
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">{t("Inactive")}</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            {t("Pending")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("User Management")}</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("Add User")}
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder={t("Search users...")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("All Users")}</TabsTrigger>
          <TabsTrigger value="active">{t("Active")}</TabsTrigger>
          <TabsTrigger value="inactive">{t("Inactive")}</TabsTrigger>
          <TabsTrigger value="pending">{t("Pending")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.role} • {user.department}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                          {user.phoneNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t("Edit")}</DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("View Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("Change Role")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            {t("Deactivate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No users found matching your criteria")}
            </div>
          )}
        </TabsContent>

        {/* Other tab contents follow the same pattern but are filtered by the activeTab state */}
        <TabsContent value="active" className="space-y-4">
          {/* Same structure as above, filtered by tab */}
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.role} • {user.department}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                          {user.phoneNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t("Edit")}</DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("View Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("Change Role")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            {t("Deactivate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No active users found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {/* Same structure as above */}
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.role} • {user.department}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                          {user.phoneNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t("Edit")}</DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("View Details")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("Change Role")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600">
                            {t("Activate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No inactive users found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Same structure as above */}
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          {getStatusBadge(user.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {user.role} • {user.department}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.email}</span>
                          {user.phoneNumber && (
                            <>
                              <span className="mx-2">•</span>
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          {t("Approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600"
                        >
                          {t("Reject")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("No pending users found")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
