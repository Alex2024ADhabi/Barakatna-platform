import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useTranslation } from "react-i18next";
import { Save, Globe, Bell, Lock, Database, Server } from "lucide-react";

interface SystemSettings {
  general: {
    systemName: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
    defaultLanguage: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: string;
  };
  security: {
    passwordPolicy: string;
    mfaEnabled: boolean;
    sessionTimeout: number;
    ipRestriction: boolean;
  };
  database: {
    backupFrequency: string;
    retentionPeriod: number;
    autoCleanup: boolean;
  };
  api: {
    rateLimit: number;
    tokenExpiry: number;
    loggingEnabled: boolean;
  };
}

const SystemConfiguration = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");

  // Mock data - would be replaced with API calls
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: "Barakatna Platform",
      supportEmail: "support@barakatna.com",
      supportPhone: "+966 12 345 6789",
      maintenanceMode: false,
      defaultLanguage: "ar",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      notificationFrequency: "immediate",
    },
    security: {
      passwordPolicy: "strong",
      mfaEnabled: true,
      sessionTimeout: 30,
      ipRestriction: false,
    },
    database: {
      backupFrequency: "daily",
      retentionPeriod: 90,
      autoCleanup: true,
    },
    api: {
      rateLimit: 100,
      tokenExpiry: 24,
      loggingEnabled: true,
    },
  });

  const handleSaveSettings = () => {
    // Save settings logic would go here
    console.log("Saving settings:", settings);
    // Show success message
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.system.title")}
        </h2>
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {t("common.saveChanges")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("administration.system.tabs.general")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {t("administration.system.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t("administration.system.tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {t("administration.system.tabs.database")}
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            {t("administration.system.tabs.api")}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.system.general.title")}</CardTitle>
              <CardDescription>
                {t("administration.system.general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">
                    {t("administration.system.general.systemName")}
                  </Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          systemName: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">
                    {t("administration.system.general.defaultLanguage")}
                  </Label>
                  <Select
                    value={settings.general.defaultLanguage}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          defaultLanguage: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">
                        {t("languages.arabic")}
                      </SelectItem>
                      <SelectItem value="en">
                        {t("languages.english")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">
                    {t("administration.system.general.supportEmail")}
                  </Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          supportEmail: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">
                    {t("administration.system.general.supportPhone")}
                  </Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          supportPhone: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        general: {
                          ...settings.general,
                          maintenanceMode: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="maintenanceMode">
                    {t("administration.system.general.maintenanceMode")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("administration.system.notifications.title")}
              </CardTitle>
              <CardDescription>
                {t("administration.system.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          emailNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="emailNotifications">
                    {t(
                      "administration.system.notifications.emailNotifications",
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          smsNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="smsNotifications">
                    {t("administration.system.notifications.smsNotifications")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          pushNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="pushNotifications">
                    {t("administration.system.notifications.pushNotifications")}
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationFrequency">
                    {t("administration.system.notifications.frequency")}
                  </Label>
                  <Select
                    value={settings.notifications.notificationFrequency}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          notificationFrequency: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">
                        {t(
                          "administration.system.notifications.frequencies.immediate",
                        )}
                      </SelectItem>
                      <SelectItem value="hourly">
                        {t(
                          "administration.system.notifications.frequencies.hourly",
                        )}
                      </SelectItem>
                      <SelectItem value="daily">
                        {t(
                          "administration.system.notifications.frequencies.daily",
                        )}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {t(
                          "administration.system.notifications.frequencies.weekly",
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.system.security.title")}</CardTitle>
              <CardDescription>
                {t("administration.system.security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">
                    {t("administration.system.security.passwordPolicy")}
                  </Label>
                  <Select
                    value={settings.security.passwordPolicy}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        {t("administration.system.security.policies.basic")}
                      </SelectItem>
                      <SelectItem value="medium">
                        {t("administration.system.security.policies.medium")}
                      </SelectItem>
                      <SelectItem value="strong">
                        {t("administration.system.security.policies.strong")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    {t("administration.system.security.sessionTimeout")}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeout: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {t("common.minutes")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mfaEnabled"
                    checked={settings.security.mfaEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, mfaEnabled: checked },
                      })
                    }
                  />
                  <Label htmlFor="mfaEnabled">
                    {t("administration.system.security.mfaEnabled")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ipRestriction"
                    checked={settings.security.ipRestriction}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          ipRestriction: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="ipRestriction">
                    {t("administration.system.security.ipRestriction")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.system.database.title")}</CardTitle>
              <CardDescription>
                {t("administration.system.database.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">
                    {t("administration.system.database.backupFrequency")}
                  </Label>
                  <Select
                    value={settings.database.backupFrequency}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        database: {
                          ...settings.database,
                          backupFrequency: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">
                        {t("administration.system.database.frequencies.hourly")}
                      </SelectItem>
                      <SelectItem value="daily">
                        {t("administration.system.database.frequencies.daily")}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {t("administration.system.database.frequencies.weekly")}
                      </SelectItem>
                      <SelectItem value="monthly">
                        {t(
                          "administration.system.database.frequencies.monthly",
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">
                    {t("administration.system.database.retentionPeriod")}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="retentionPeriod"
                      type="number"
                      value={settings.database.retentionPeriod}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          database: {
                            ...settings.database,
                            retentionPeriod: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {t("common.days")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoCleanup"
                    checked={settings.database.autoCleanup}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        database: {
                          ...settings.database,
                          autoCleanup: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="autoCleanup">
                    {t("administration.system.database.autoCleanup")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.system.api.title")}</CardTitle>
              <CardDescription>
                {t("administration.system.api.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">
                    {t("administration.system.api.rateLimit")}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="rateLimit"
                      type="number"
                      value={settings.api.rateLimit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          api: {
                            ...settings.api,
                            rateLimit: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {t("administration.system.api.requestsPerMinute")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenExpiry">
                    {t("administration.system.api.tokenExpiry")}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="tokenExpiry"
                      type="number"
                      value={settings.api.tokenExpiry}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          api: {
                            ...settings.api,
                            tokenExpiry: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {t("common.hours")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="loggingEnabled"
                    checked={settings.api.loggingEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        api: { ...settings.api, loggingEnabled: checked },
                      })
                    }
                  />
                  <Label htmlFor="loggingEnabled">
                    {t("administration.system.api.loggingEnabled")}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
