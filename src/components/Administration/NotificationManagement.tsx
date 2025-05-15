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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Bell,
  Settings,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
  Edit,
  Plus,
  Search,
} from "lucide-react";
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

interface NotificationTemplate {
  id: number;
  name: string;
  type: string;
  subject?: string;
  body: string;
  active: boolean;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface UserNotificationPreference {
  userId: number;
  userName: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

const NotificationManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("templates");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for notification templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 1,
      name: "Assessment Completed",
      type: "email",
      subject: "Assessment Completed for [ClientName]",
      body: "Dear [RecipientName],\n\nThe assessment for [ClientName] has been completed. You can view the details by clicking the link below:\n\n[AssessmentLink]\n\nRegards,\nBarakatna Team",
      active: true,
    },
    {
      id: 2,
      name: "Project Approval Required",
      type: "email",
      subject: "Action Required: Project Approval for [ProjectName]",
      body: "Dear [RecipientName],\n\nA new project [ProjectName] requires your approval. Please review the details and approve or reject by clicking the link below:\n\n[ApprovalLink]\n\nRegards,\nBarakatna Team",
      active: true,
    },
    {
      id: 3,
      name: "Low Inventory Alert",
      type: "sms",
      body: "ALERT: [ItemName] inventory is below threshold ([CurrentCount] remaining). Please reorder soon.",
      active: true,
    },
    {
      id: 4,
      name: "Inspection Scheduled",
      type: "push",
      body: "An inspection has been scheduled for [Date] at [Time]. Location: [Address].",
      active: false,
    },
  ]);

  // Mock data for notification channels
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "email",
      name: "Email",
      type: "smtp",
      enabled: true,
      config: {
        server: "smtp.example.com",
        port: 587,
        username: "notifications@barakatna.org",
        useTLS: true,
      },
    },
    {
      id: "sms",
      name: "SMS",
      type: "twilio",
      enabled: true,
      config: {
        accountSid: "AC1234567890",
        authToken: "*****",
        fromNumber: "+12345678901",
      },
    },
    {
      id: "push",
      name: "Push Notifications",
      type: "firebase",
      enabled: false,
      config: {
        apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
        projectId: "barakatna-app",
      },
    },
    {
      id: "inapp",
      name: "In-App Notifications",
      type: "internal",
      enabled: true,
      config: {
        retentionDays: 30,
        maxNotifications: 100,
      },
    },
  ]);

  // Mock data for user notification preferences
  const [userPreferences, setUserPreferences] = useState<
    UserNotificationPreference[]
  >([
    {
      userId: 1,
      userName: "Ahmed Al-Farsi",
      email: true,
      sms: true,
      push: false,
      inApp: true,
    },
    {
      userId: 2,
      userName: "Fatima Al-Zahra",
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    {
      userId: 3,
      userName: "Mohammed Al-Balushi",
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
  ]);

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: Math.max(0, ...templates.map((t) => t.id)) + 1,
      name: "",
      type: "email",
      subject: "",
      body: "",
      active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate({ ...template });
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (templates.some((t) => t.id === editingTemplate.id)) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id ? editingTemplate : t,
        ),
      );
    } else {
      setTemplates([...templates, editingTemplate]);
    }

    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleToggleChannel = (id: string, enabled: boolean) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, enabled } : channel,
      ),
    );
  };

  const handleToggleUserPreference = (
    userId: number,
    field: "email" | "sms" | "push" | "inApp",
    value: boolean,
  ) => {
    setUserPreferences(
      userPreferences.map((pref) =>
        pref.userId === userId ? { ...pref, [field]: value } : pref,
      ),
    );
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("administration.notificationManagement.title")}
          </CardTitle>
          <CardDescription>
            {t("administration.notificationManagement.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="templates"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger
                value="templates"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t("administration.notificationManagement.tabs.templates")}
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("administration.notificationManagement.tabs.channels")}
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {t("administration.notificationManagement.tabs.preferences")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t(
                      "administration.notificationManagement.searchTemplates",
                    )}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("administration.notificationManagement.createTemplate")}
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("administration.notificationManagement.table.name")}
                      </TableHead>
                      <TableHead>
                        {t("administration.notificationManagement.table.type")}
                      </TableHead>
                      <TableHead>
                        {t(
                          "administration.notificationManagement.table.status",
                        )}
                      </TableHead>
                      <TableHead className="text-right">
                        {t(
                          "administration.notificationManagement.table.actions",
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          {template.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {template.type === "email" && (
                              <Mail className="h-4 w-4" />
                            )}
                            {template.type === "sms" && (
                              <Smartphone className="h-4 w-4" />
                            )}
                            {template.type === "push" && (
                              <Bell className="h-4 w-4" />
                            )}
                            {template.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={template.active}
                              onCheckedChange={(checked) => {
                                setTemplates(
                                  templates.map((t) =>
                                    t.id === template.id
                                      ? { ...t, active: checked }
                                      : t,
                                  ),
                                );
                              }}
                            />
                            <span>
                              {template.active
                                ? t(
                                    "administration.notificationManagement.active",
                                  )
                                : t(
                                    "administration.notificationManagement.inactive",
                                  )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <div className="grid gap-6">
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          {channel.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={(checked) =>
                              handleToggleChannel(channel.id, checked)
                            }
                          />
                          <span>
                            {channel.enabled
                              ? t(
                                  "administration.notificationManagement.enabled",
                                )
                              : t(
                                  "administration.notificationManagement.disabled",
                                )}
                          </span>
                        </div>
                      </div>
                      <CardDescription>
                        {t(
                          `administration.notificationManagement.channelTypes.${channel.type}`,
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {Object.entries(channel.config).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-2 gap-4">
                            <Label htmlFor={`${channel.id}-${key}`}>
                              {t(
                                `administration.notificationManagement.config.${key}`,
                                { defaultValue: key },
                              )}
                            </Label>
                            <Input
                              id={`${channel.id}-${key}`}
                              value={
                                typeof value === "string"
                                  ? value
                                  : JSON.stringify(value)
                              }
                              type={
                                key.includes("token") || key.includes("key")
                                  ? "password"
                                  : "text"
                              }
                              disabled={!channel.enabled}
                              onChange={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("administration.notificationManagement.table.user")}
                      </TableHead>
                      <TableHead className="text-center">
                        {t("administration.notificationManagement.table.email")}
                      </TableHead>
                      <TableHead className="text-center">
                        {t("administration.notificationManagement.table.sms")}
                      </TableHead>
                      <TableHead className="text-center">
                        {t("administration.notificationManagement.table.push")}
                      </TableHead>
                      <TableHead className="text-center">
                        {t("administration.notificationManagement.table.inApp")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPreferences.map((pref) => (
                      <TableRow key={pref.userId}>
                        <TableCell className="font-medium">
                          {pref.userName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={pref.email}
                            onCheckedChange={(checked) =>
                              handleToggleUserPreference(
                                pref.userId,
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
                              handleToggleUserPreference(
                                pref.userId,
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
                              handleToggleUserPreference(
                                pref.userId,
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
                              handleToggleUserPreference(
                                pref.userId,
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
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate && editingTemplate.id
                ? t("administration.notificationManagement.editTemplate")
                : t("administration.notificationManagement.createTemplate")}
            </DialogTitle>
            <DialogDescription>
              {t("administration.notificationManagement.templateDescription")}
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t("administration.notificationManagement.templateName")}
                </Label>
                <Input
                  id="name"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">
                  {t("administration.notificationManagement.templateType")}
                </Label>
                <Select
                  value={editingTemplate.type}
                  onValueChange={(value) =>
                    setEditingTemplate({ ...editingTemplate, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingTemplate.type === "email" && (
                <div className="grid gap-2">
                  <Label htmlFor="subject">
                    {t("administration.notificationManagement.templateSubject")}
                  </Label>
                  <Input
                    id="subject"
                    value={editingTemplate.subject || ""}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="body">
                  {t("administration.notificationManagement.templateBody")}
                </Label>
                <Textarea
                  id="body"
                  rows={6}
                  value={editingTemplate.body}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      body: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {t(
                    "administration.notificationManagement.templatePlaceholders",
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingTemplate.active}
                  onCheckedChange={(checked) =>
                    setEditingTemplate({ ...editingTemplate, active: checked })
                  }
                />
                <Label htmlFor="active">
                  {t("administration.notificationManagement.templateActive")}
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("administration.notificationManagement.cancel")}
            </Button>
            <Button onClick={handleSaveTemplate}>
              {t("administration.notificationManagement.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManagement;
