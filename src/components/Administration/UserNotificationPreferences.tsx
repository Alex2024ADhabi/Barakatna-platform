import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Bell,
  Clock,
  Languages,
  Mail,
  MessageSquare,
  Moon,
  Save,
  Settings,
  Smartphone,
  User,
} from "lucide-react";

interface TimeRange {
  start: string;
  end: string;
  days: string[];
}

interface NotificationPreference {
  type: string;
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface UserNotificationSettings {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  language: string;
  groupingPreference: string;
  doNotDisturb: TimeRange[];
  preferences: NotificationPreference[];
}

const UserNotificationPreferences = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isAddingDnd, setIsAddingDnd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      role: "Administrator",
    },
    {
      id: 2,
      name: "Fatima Al-Zahra",
      email: "fatima@example.com",
      role: "Project Manager",
    },
    {
      id: 3,
      name: "Mohammed Al-Balushi",
      email: "mohammed@example.com",
      role: "Field Inspector",
    },
  ]);

  // Mock data for notification settings
  const [userSettings, setUserSettings] = useState<UserNotificationSettings[]>([
    {
      userId: 1,
      userName: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      phone: "+968 9123 4567",
      language: "ar",
      groupingPreference: "category",
      doNotDisturb: [
        {
          start: "22:00",
          end: "06:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      ],
      preferences: [
        {
          type: "Assessment Completed",
          category: "Assessment",
          email: true,
          sms: false,
          push: true,
          inApp: true,
        },
        {
          type: "Project Approval Required",
          category: "Approval",
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
        {
          type: "Low Inventory Alert",
          category: "Inventory",
          email: false,
          sms: true,
          push: true,
          inApp: false,
        },
        {
          type: "Inspection Scheduled",
          category: "Inspection",
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
      ],
    },
    {
      userId: 2,
      userName: "Fatima Al-Zahra",
      email: "fatima@example.com",
      phone: "+968 9876 5432",
      language: "en",
      groupingPreference: "time",
      doNotDisturb: [
        {
          start: "23:00",
          end: "07:00",
          days: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
      preferences: [
        {
          type: "Assessment Completed",
          category: "Assessment",
          email: true,
          sms: false,
          push: false,
          inApp: true,
        },
        {
          type: "Project Approval Required",
          category: "Approval",
          email: true,
          sms: false,
          push: false,
          inApp: true,
        },
        {
          type: "Low Inventory Alert",
          category: "Inventory",
          email: true,
          sms: false,
          push: false,
          inApp: true,
        },
        {
          type: "Inspection Scheduled",
          category: "Inspection",
          email: true,
          sms: true,
          push: false,
          inApp: true,
        },
      ],
    },
    {
      userId: 3,
      userName: "Mohammed Al-Balushi",
      email: "mohammed@example.com",
      phone: "+968 9456 7890",
      language: "ar",
      groupingPreference: "priority",
      doNotDisturb: [],
      preferences: [
        {
          type: "Assessment Completed",
          category: "Assessment",
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
        {
          type: "Project Approval Required",
          category: "Approval",
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
        {
          type: "Low Inventory Alert",
          category: "Inventory",
          email: false,
          sms: true,
          push: true,
          inApp: false,
        },
        {
          type: "Inspection Scheduled",
          category: "Inspection",
          email: true,
          sms: true,
          push: true,
          inApp: true,
        },
      ],
    },
  ]);

  const [newDndSchedule, setNewDndSchedule] = useState<TimeRange>({
    start: "22:00",
    end: "06:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleUserSelect = (userId: number) => {
    setSelectedUser(userId);
    setActiveTab("preferences");
  };

  const handleTogglePreference = (
    userId: number,
    notificationType: string,
    channel: "email" | "sms" | "push" | "inApp",
    value: boolean,
  ) => {
    setUserSettings(
      userSettings.map((settings) =>
        settings.userId === userId
          ? {
              ...settings,
              preferences: settings.preferences.map((pref) =>
                pref.type === notificationType
                  ? { ...pref, [channel]: value }
                  : pref,
              ),
            }
          : settings,
      ),
    );
  };

  const handleLanguageChange = (userId: number, language: string) => {
    setUserSettings(
      userSettings.map((settings) =>
        settings.userId === userId ? { ...settings, language } : settings,
      ),
    );
  };

  const handleGroupingPreferenceChange = (
    userId: number,
    groupingPreference: string,
  ) => {
    setUserSettings(
      userSettings.map((settings) =>
        settings.userId === userId
          ? { ...settings, groupingPreference }
          : settings,
      ),
    );
  };

  const handleAddDndSchedule = () => {
    if (selectedUser !== null) {
      setUserSettings(
        userSettings.map((settings) =>
          settings.userId === selectedUser
            ? {
                ...settings,
                doNotDisturb: [...settings.doNotDisturb, newDndSchedule],
              }
            : settings,
        ),
      );
      setIsAddingDnd(false);
      setNewDndSchedule({
        start: "22:00",
        end: "06:00",
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      });
    }
  };

  const handleRemoveDndSchedule = (userId: number, index: number) => {
    setUserSettings(
      userSettings.map((settings) =>
        settings.userId === userId
          ? {
              ...settings,
              doNotDisturb: settings.doNotDisturb.filter((_, i) => i !== index),
            }
          : settings,
      ),
    );
  };

  const handleDayToggle = (day: string) => {
    if (newDndSchedule.days.includes(day)) {
      setNewDndSchedule({
        ...newDndSchedule,
        days: newDndSchedule.days.filter((d) => d !== day),
      });
    } else {
      setNewDndSchedule({
        ...newDndSchedule,
        days: [...newDndSchedule.days, day],
      });
    }
  };

  const getDayLabel = (day: string) => {
    const days: Record<string, string> = {
      monday: t("common.days.monday"),
      tuesday: t("common.days.tuesday"),
      wednesday: t("common.days.wednesday"),
      thursday: t("common.days.thursday"),
      friday: t("common.days.friday"),
      saturday: t("common.days.saturday"),
      sunday: t("common.days.sunday"),
    };
    return days[day] || day;
  };

  const selectedUserSettings =
    selectedUser !== null
      ? userSettings.find((settings) => settings.userId === selectedUser)
      : null;

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("administration.userNotificationPreferences.title")}
          </CardTitle>
          <CardDescription>
            {t("administration.userNotificationPreferences.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder={t(
                    "administration.userNotificationPreferences.searchUsers",
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-2 rounded-md cursor-pointer flex items-center ${selectedUser === user.id ? "bg-primary/10" : "hover:bg-muted"}`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              {selectedUserSettings ? (
                <Tabs
                  defaultValue="preferences"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger
                      value="preferences"
                      className="flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      {t(
                        "administration.userNotificationPreferences.tabs.preferences",
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="doNotDisturb"
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      {t(
                        "administration.userNotificationPreferences.tabs.doNotDisturb",
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {t(
                        "administration.userNotificationPreferences.tabs.settings",
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preferences" className="space-y-4">
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t(
                                "administration.userNotificationPreferences.table.notificationType",
                              )}
                            </TableHead>
                            <TableHead>
                              {t(
                                "administration.userNotificationPreferences.table.category",
                              )}
                            </TableHead>
                            <TableHead className="text-center">
                              {t(
                                "administration.userNotificationPreferences.table.email",
                              )}
                            </TableHead>
                            <TableHead className="text-center">
                              {t(
                                "administration.userNotificationPreferences.table.sms",
                              )}
                            </TableHead>
                            <TableHead className="text-center">
                              {t(
                                "administration.userNotificationPreferences.table.push",
                              )}
                            </TableHead>
                            <TableHead className="text-center">
                              {t(
                                "administration.userNotificationPreferences.table.inApp",
                              )}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUserSettings.preferences.map((pref) => (
                            <TableRow key={pref.type}>
                              <TableCell className="font-medium">
                                {pref.type}
                              </TableCell>
                              <TableCell>{pref.category}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={pref.email}
                                  onCheckedChange={(checked) =>
                                    handleTogglePreference(
                                      selectedUserSettings.userId,
                                      pref.type,
                                      "email",
                                      !!checked,
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={pref.sms}
                                  onCheckedChange={(checked) =>
                                    handleTogglePreference(
                                      selectedUserSettings.userId,
                                      pref.type,
                                      "sms",
                                      !!checked,
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={pref.push}
                                  onCheckedChange={(checked) =>
                                    handleTogglePreference(
                                      selectedUserSettings.userId,
                                      pref.type,
                                      "push",
                                      !!checked,
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={pref.inApp}
                                  onCheckedChange={(checked) =>
                                    handleTogglePreference(
                                      selectedUserSettings.userId,
                                      pref.type,
                                      "inApp",
                                      !!checked,
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="doNotDisturb" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {t(
                          "administration.userNotificationPreferences.doNotDisturbSchedules",
                        )}
                      </h3>
                      <Button onClick={() => setIsAddingDnd(true)}>
                        {t(
                          "administration.userNotificationPreferences.addSchedule",
                        )}
                      </Button>
                    </div>

                    {selectedUserSettings.doNotDisturb.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t(
                          "administration.userNotificationPreferences.noSchedules",
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedUserSettings.doNotDisturb.map(
                          (schedule, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <span className="font-medium">
                                      {schedule.start} - {schedule.end}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveDndSchedule(
                                        selectedUserSettings.userId,
                                        index,
                                      )
                                    }
                                  >
                                    {t(
                                      "administration.userNotificationPreferences.remove",
                                    )}
                                  </Button>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {[
                                    "monday",
                                    "tuesday",
                                    "wednesday",
                                    "thursday",
                                    "friday",
                                    "saturday",
                                    "sunday",
                                  ].map((day) => (
                                    <div
                                      key={day}
                                      className={`px-3 py-1 text-xs rounded-full ${schedule.days.includes(day) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                    >
                                      {getDayLabel(day)}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="language">
                          {t(
                            "administration.userNotificationPreferences.language",
                          )}
                        </Label>
                        <Select
                          value={selectedUserSettings.language}
                          onValueChange={(value) =>
                            handleLanguageChange(
                              selectedUserSettings.userId,
                              value,
                            )
                          }
                        >
                          <SelectTrigger id="language" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">
                              <div className="flex items-center">
                                <Languages className="h-4 w-4 mr-2" />
                                {t("common.languages.english")}
                              </div>
                            </SelectItem>
                            <SelectItem value="ar">
                              <div className="flex items-center">
                                <Languages className="h-4 w-4 mr-2" />
                                {t("common.languages.arabic")}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="grouping">
                          {t(
                            "administration.userNotificationPreferences.groupingPreference",
                          )}
                        </Label>
                        <Select
                          value={selectedUserSettings.groupingPreference}
                          onValueChange={(value) =>
                            handleGroupingPreferenceChange(
                              selectedUserSettings.userId,
                              value,
                            )
                          }
                        >
                          <SelectTrigger id="grouping" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="category">
                              {t(
                                "administration.userNotificationPreferences.groupBy.category",
                              )}
                            </SelectItem>
                            <SelectItem value="time">
                              {t(
                                "administration.userNotificationPreferences.groupBy.time",
                              )}
                            </SelectItem>
                            <SelectItem value="priority">
                              {t(
                                "administration.userNotificationPreferences.groupBy.priority",
                              )}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "administration.userNotificationPreferences.groupingDescription",
                          )}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">
                          {t(
                            "administration.userNotificationPreferences.emailAddress",
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={selectedUserSettings.email}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">
                          {t(
                            "administration.userNotificationPreferences.phoneNumber",
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={selectedUserSettings.phone}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t("administration.userNotificationPreferences.selectUser")}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {t(
                      "administration.userNotificationPreferences.selectUserDescription",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingDnd} onOpenChange={setIsAddingDnd}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t(
                "administration.userNotificationPreferences.addDoNotDisturbSchedule",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                "administration.userNotificationPreferences.scheduleDescription",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">
                  {t("administration.userNotificationPreferences.startTime")}
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newDndSchedule.start}
                  onChange={(e) =>
                    setNewDndSchedule({
                      ...newDndSchedule,
                      start: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">
                  {t("administration.userNotificationPreferences.endTime")}
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newDndSchedule.end}
                  onChange={(e) =>
                    setNewDndSchedule({
                      ...newDndSchedule,
                      end: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                {t("administration.userNotificationPreferences.activeDays")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className={`px-3 py-1 text-sm rounded-full cursor-pointer ${newDndSchedule.days.includes(day) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    onClick={() => handleDayToggle(day)}
                  >
                    {getDayLabel(day)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDnd(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddDndSchedule}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserNotificationPreferences;
