import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  DialogClose,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useToast } from "../ui/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  CheckCircle2,
  History,
  UserCog,
  BarChart,
  Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  status: "active" | "inactive" | "locked";
  lastLogin?: string;
  mfaEnabled?: boolean;
  passwordLastChanged?: string;
  failedLoginAttempts?: number;
  phone?: string;
  department?: string;
  clientType?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventPasswordReuse: number;
  expiryDays: number;
  lockoutThreshold: number;
}

const UserManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isPasswordPolicyOpen, setIsPasswordPolicyOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");

  // Mock data - would be replaced with API calls
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      role: "Administrator",
      roles: ["Administrator", "System Auditor"],
      status: "active",
      lastLogin: "2023-10-15 14:30",
      mfaEnabled: true,
      passwordLastChanged: "2023-09-01",
      failedLoginAttempts: 0,
      phone: "+971 50 123 4567",
      department: "IT",
      clientType: "FDF",
      effectiveFrom: "2023-01-01",
      effectiveTo: "",
      createdAt: "2023-01-01",
      createdBy: "System",
      modifiedAt: "2023-09-01",
      modifiedBy: "Admin",
    },
    {
      id: "2",
      name: "Fatima Khalid",
      email: "fatima@example.com",
      role: "Healthcare Provider",
      roles: ["Healthcare Provider"],
      status: "active",
      lastLogin: "2023-10-14 09:15",
      mfaEnabled: false,
      passwordLastChanged: "2023-08-15",
      failedLoginAttempts: 0,
      phone: "+971 50 987 6543",
      department: "Healthcare",
      clientType: "ADHA",
      effectiveFrom: "2023-02-15",
      effectiveTo: "",
      createdAt: "2023-02-15",
      createdBy: "Admin",
      modifiedAt: "2023-08-15",
      modifiedBy: "Admin",
    },
    {
      id: "3",
      name: "Mohammed Al-Saud",
      email: "mohammed@example.com",
      role: "Project Manager",
      roles: ["Project Manager", "Resource Allocator"],
      status: "inactive",
      lastLogin: "2023-09-30 11:45",
      mfaEnabled: true,
      passwordLastChanged: "2023-07-20",
      failedLoginAttempts: 0,
      phone: "+971 55 456 7890",
      department: "Projects",
      clientType: "CASH",
      effectiveFrom: "2023-03-10",
      effectiveTo: "2023-12-31",
      createdAt: "2023-03-10",
      createdBy: "Admin",
      modifiedAt: "2023-09-30",
      modifiedBy: "Admin",
    },
    {
      id: "4",
      name: "Layla Rahman",
      email: "layla@example.com",
      role: "Financial Officer",
      roles: ["Financial Officer"],
      status: "locked",
      lastLogin: "2023-10-01 08:30",
      mfaEnabled: false,
      passwordLastChanged: "2023-06-15",
      failedLoginAttempts: 5,
      phone: "+971 52 789 1234",
      department: "Finance",
      clientType: "FDF",
      effectiveFrom: "2023-04-05",
      effectiveTo: "",
      createdAt: "2023-04-05",
      createdBy: "Admin",
      modifiedAt: "2023-10-01",
      modifiedBy: "System",
    },
  ]);

  // Mock user activities
  const [userActivities, setUserActivities] = useState<UserActivity[]>([
    {
      id: "1",
      userId: "1",
      action: "Login",
      timestamp: "2023-10-15 14:30",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 117.0.0 / Windows",
      details: "Successful login",
    },
    {
      id: "2",
      userId: "1",
      action: "Password Change",
      timestamp: "2023-09-01 10:15",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 116.0.0 / Windows",
      details: "User changed password",
    },
    {
      id: "3",
      userId: "1",
      action: "Profile Update",
      timestamp: "2023-09-01 10:20",
      ipAddress: "192.168.1.1",
      userAgent: "Chrome 116.0.0 / Windows",
      details: "Updated phone number",
    },
    {
      id: "4",
      userId: "2",
      action: "Login",
      timestamp: "2023-10-14 09:15",
      ipAddress: "192.168.1.2",
      userAgent: "Safari 16.0 / macOS",
      details: "Successful login",
    },
    {
      id: "5",
      userId: "3",
      action: "Failed Login",
      timestamp: "2023-09-30 11:40",
      ipAddress: "192.168.1.3",
      userAgent: "Firefox 118.0 / Ubuntu",
      details: "Invalid password",
    },
    {
      id: "6",
      userId: "3",
      action: "Login",
      timestamp: "2023-09-30 11:45",
      ipAddress: "192.168.1.3",
      userAgent: "Firefox 118.0 / Ubuntu",
      details: "Successful login",
    },
    {
      id: "7",
      userId: "4",
      action: "Failed Login",
      timestamp: "2023-10-01 08:15",
      ipAddress: "192.168.1.4",
      userAgent: "Chrome 117.0.0 / Android",
      details: "Invalid password (Attempt 1)",
    },
    {
      id: "8",
      userId: "4",
      action: "Failed Login",
      timestamp: "2023-10-01 08:20",
      ipAddress: "192.168.1.4",
      userAgent: "Chrome 117.0.0 / Android",
      details: "Invalid password (Attempt 2)",
    },
    {
      id: "9",
      userId: "4",
      action: "Failed Login",
      timestamp: "2023-10-01 08:25",
      ipAddress: "192.168.1.4",
      userAgent: "Chrome 117.0.0 / Android",
      details: "Invalid password (Attempt 3)",
    },
    {
      id: "10",
      userId: "4",
      action: "Failed Login",
      timestamp: "2023-10-01 08:28",
      ipAddress: "192.168.1.4",
      userAgent: "Chrome 117.0.0 / Android",
      details: "Invalid password (Attempt 4)",
    },
    {
      id: "11",
      userId: "4",
      action: "Failed Login",
      timestamp: "2023-10-01 08:30",
      ipAddress: "192.168.1.4",
      userAgent: "Chrome 117.0.0 / Android",
      details: "Invalid password (Attempt 5) - Account locked",
    },
  ]);

  // Password policy
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventPasswordReuse: 5,
    expiryDays: 90,
    lockoutThreshold: 5,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Add user logic would go here
    setIsAddUserOpen(false);
    toast({
      title: t("administration.users.userAdded"),
      description: t("administration.users.userAddedDescription"),
    });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Edit user logic would go here
    setIsEditUserOpen(false);
    toast({
      title: t("administration.users.userUpdated"),
      description: t("administration.users.userUpdatedDescription"),
    });
  };

  const handleDeleteUser = (userId: string) => {
    // Delete user logic would go here
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: t("administration.users.userDeleted"),
      description: t("administration.users.userDeletedDescription"),
    });
  };

  const handleResetPassword = (userId: string) => {
    // Reset password logic would go here
    toast({
      title: t("administration.users.passwordReset"),
      description: t("administration.users.passwordResetDescription"),
    });
  };

  const handleUnlockAccount = (userId: string) => {
    // Unlock account logic would go here
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, status: "active" as const, failedLoginAttempts: 0 };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast({
      title: t("administration.users.accountUnlocked"),
      description: t("administration.users.accountUnlockedDescription"),
    });
  };

  const handleToggleMFA = (userId: string, enabled: boolean) => {
    // Toggle MFA logic would go here
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, mfaEnabled: enabled };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast({
      title: enabled
        ? t("administration.users.mfaEnabled")
        : t("administration.users.mfaDisabled"),
      description: enabled
        ? t("administration.users.mfaEnabledDescription")
        : t("administration.users.mfaDisabledDescription"),
    });
  };

  const handleSavePasswordPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    // Save password policy logic would go here
    setIsPasswordPolicyOpen(false);
    toast({
      title: t("administration.users.passwordPolicyUpdated"),
      description: t("administration.users.passwordPolicyUpdatedDescription"),
    });
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesClient =
      filterClient === "all" || user.clientType === filterClient;

    return matchesSearch && matchesStatus && matchesRole && matchesClient;
  });

  // Get user activities for selected user
  const getUserActivities = (userId: string) => {
    return userActivities.filter((activity) => activity.userId === userId);
  };

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));

  // Get unique client types for filter
  const uniqueClientTypes = Array.from(
    new Set(users.map((user) => user.clientType).filter(Boolean)),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.users.title")}
        </h2>
        <div className="flex space-x-2">
          <Dialog
            open={isPasswordPolicyOpen}
            onOpenChange={setIsPasswordPolicyOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t("administration.users.passwordPolicy")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t("administration.users.passwordPolicy")}
                </DialogTitle>
                <DialogDescription>
                  {t("administration.users.passwordPolicyDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSavePasswordPolicy} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">
                      {t("administration.users.minPasswordLength")}
                    </Label>
                    <Input
                      id="minLength"
                      type="number"
                      min="8"
                      max="24"
                      value={passwordPolicy.minLength}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          minLength: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireUppercase"
                      checked={passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          requireUppercase: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="requireUppercase">
                      {t("administration.users.requireUppercase")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireLowercase"
                      checked={passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          requireLowercase: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="requireLowercase">
                      {t("administration.users.requireLowercase")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireNumbers"
                      checked={passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          requireNumbers: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="requireNumbers">
                      {t("administration.users.requireNumbers")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireSpecialChars"
                      checked={passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          requireSpecialChars: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="requireSpecialChars">
                      {t("administration.users.requireSpecialChars")}
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preventPasswordReuse">
                      {t("administration.users.preventPasswordReuse")}
                    </Label>
                    <Input
                      id="preventPasswordReuse"
                      type="number"
                      min="0"
                      max="20"
                      value={passwordPolicy.preventPasswordReuse}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          preventPasswordReuse: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">
                      {t("administration.users.passwordExpiryDays")}
                    </Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      min="0"
                      max="365"
                      value={passwordPolicy.expiryDays}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          expiryDays: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      {t("administration.users.passwordExpiryDescription")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockoutThreshold">
                      {t("administration.users.accountLockoutThreshold")}
                    </Label>
                    <Input
                      id="lockoutThreshold"
                      type="number"
                      min="0"
                      max="10"
                      value={passwordPolicy.lockoutThreshold}
                      onChange={(e) =>
                        setPasswordPolicy({
                          ...passwordPolicy,
                          lockoutThreshold: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      {t("administration.users.accountLockoutDescription")}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t("common.save")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t("administration.users.addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {t("administration.users.addNewUser")}
                </DialogTitle>
                <DialogDescription>
                  {t("administration.users.addUserDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="general">
                      {t("administration.users.generalInfo")}
                    </TabsTrigger>
                    <TabsTrigger value="security">
                      {t("administration.users.securitySettings")}
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                      {t("administration.users.roleAssignment")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("common.name")}</Label>
                        <Input
                          id="name"
                          placeholder={t("common.namePlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("common.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("common.emailPlaceholder")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("common.phone")}</Label>
                        <Input id="phone" placeholder="+971 5X XXX XXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">
                          {t("common.department")}
                        </Label>
                        <Input
                          id="department"
                          placeholder={t("common.departmentPlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientType">
                          {t("common.clientType")}
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("common.selectClientType")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FDF">
                              {t("clientTypes.fdf")}
                            </SelectItem>
                            <SelectItem value="ADHA">
                              {t("clientTypes.adha")}
                            </SelectItem>
                            <SelectItem value="CASH">
                              {t("clientTypes.cash")}
                            </SelectItem>
                            <SelectItem value="OTHER">
                              {t("clientTypes.other")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">{t("common.status")}</Label>
                        <Select defaultValue="active">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              {t("status.active")}
                            </SelectItem>
                            <SelectItem value="inactive">
                              {t("status.inactive")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="effectiveFrom">
                          {t("common.effectiveFrom")}
                        </Label>
                        <Input
                          id="effectiveFrom"
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="effectiveTo">
                          {t("common.effectiveTo")}
                        </Label>
                        <Input
                          id="effectiveTo"
                          type="date"
                          placeholder={t("common.optional")}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t("common.password")}</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t("administration.users.passwordRequirements", {
                            length: passwordPolicy.minLength,
                          })}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          {t("common.confirmPassword")}
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="requirePasswordChange" />
                            <Label htmlFor="requirePasswordChange">
                              {t("administration.users.requirePasswordChange")}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch id="enableMfa" />
                            <Label htmlFor="enableMfa">
                              {t("administration.users.enableMfa")}
                            </Label>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t("administration.users.mfaDescription")}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="roles" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryRole">
                          {t("administration.users.primaryRole")}
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t("common.selectRole")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="administrator">
                              {t("roles.administrator")}
                            </SelectItem>
                            <SelectItem value="healthcare">
                              {t("roles.healthcareProvider")}
                            </SelectItem>
                            <SelectItem value="project">
                              {t("roles.projectManager")}
                            </SelectItem>
                            <SelectItem value="financial">
                              {t("roles.financialOfficer")}
                            </SelectItem>
                            <SelectItem value="procurement">
                              {t("roles.procurementOfficer")}
                            </SelectItem>
                            <SelectItem value="committee">
                              {t("roles.committeeMember")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {t("administration.users.additionalRoles")}
                        </Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-system-auditor" />
                            <Label htmlFor="role-system-auditor">
                              {t("roles.systemAuditor")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-resource-allocator" />
                            <Label htmlFor="role-resource-allocator">
                              {t("roles.resourceAllocator")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-report-viewer" />
                            <Label htmlFor="role-report-viewer">
                              {t("roles.reportViewer")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-data-exporter" />
                            <Label htmlFor="role-data-exporter">
                              {t("roles.dataExporter")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-client-manager" />
                            <Label htmlFor="role-client-manager">
                              {t("roles.clientManager")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="role-supplier-manager" />
                            <Label htmlFor="role-supplier-manager">
                              {t("roles.supplierManager")}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button type="submit">{t("common.save")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("status.active")}</SelectItem>
              <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
              <SelectItem value="locked">{t("status.locked")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("common.role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allRoles")}</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("common.clientType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allClients")}</SelectItem>
              {uniqueClientTypes.map((clientType) => (
                <SelectItem key={clientType} value={clientType}>
                  {clientType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.email")}</TableHead>
              <TableHead>{t("common.role")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("common.lastLogin")}</TableHead>
              <TableHead>{t("common.clientType")}</TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active"
                        ? t("status.active")
                        : user.status === "inactive"
                          ? t("status.inactive")
                          : t("status.locked")}
                    </span>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.clientType}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title={t("common.view")}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsViewUserOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title={t("common.edit")}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditUserOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title={t("common.delete")}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("administration.users.userDetails")}</DialogTitle>
            <DialogDescription>
              {t("administration.users.userDetailsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="profile">
                    {t("administration.users.profile")}
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    {t("administration.users.security")}
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    {t("administration.users.activity")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.name")}
                      </h3>
                      <p>{selectedUser.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.email")}
                      </h3>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.phone")}
                      </h3>
                      <p>{selectedUser.phone || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.department")}
                      </h3>
                      <p>{selectedUser.department || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.status")}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedUser.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedUser.status === "inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedUser.status === "active"
                          ? t("status.active")
                          : selectedUser.status === "inactive"
                            ? t("status.inactive")
                            : t("status.locked")}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.clientType")}
                      </h3>
                      <p>{selectedUser.clientType || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.effectiveFrom")}
                      </h3>
                      <p>{selectedUser.effectiveFrom || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.effectiveTo")}
                      </h3>
                      <p>
                        {selectedUser.effectiveTo || t("common.indefinite")}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.createdAt")}
                      </h3>
                      <p>{selectedUser.createdAt || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.createdBy")}
                      </h3>
                      <p>{selectedUser.createdBy || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.modifiedAt")}
                      </h3>
                      <p>{selectedUser.modifiedAt || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t("common.modifiedBy")}
                      </h3>
                      <p>{selectedUser.modifiedBy || "-"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.users.securitySettings")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            {t("administration.users.mfaStatus")}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                selectedUser.mfaEnabled
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {selectedUser.mfaEnabled
                                ? t("administration.users.mfaEnabled")
                                : t("administration.users.mfaDisabled")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() =>
                                handleToggleMFA(
                                  selectedUser.id,
                                  !selectedUser.mfaEnabled,
                                )
                              }
                            >
                              {selectedUser.mfaEnabled
                                ? t("administration.users.disableMfa")
                                : t("administration.users.enableMfa")}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            {t("administration.users.passwordLastChanged")}
                          </h3>
                          <p>{selectedUser.passwordLastChanged || "-"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            {t("administration.users.failedLoginAttempts")}
                          </h3>
                          <p>{selectedUser.failedLoginAttempts || 0}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            {t("common.lastLogin")}
                          </h3>
                          <p>{selectedUser.lastLogin || "-"}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleResetPassword(selectedUser.id)}
                        >
                          <Key className="h-3 w-3" />
                          {t("administration.users.resetPassword")}
                        </Button>

                        {selectedUser.status === "locked" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleUnlockAccount(selectedUser.id)}
                          >
                            <Unlock className="h-3 w-3" />
                            {t("administration.users.unlockAccount")}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.users.roleAssignments")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            {t("administration.users.primaryRole")}
                          </h3>
                          <p className="font-medium">{selectedUser.role}</p>
                        </div>

                        {selectedUser.roles &&
                          selectedUser.roles.length > 1 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">
                                {t("administration.users.additionalRoles")}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedUser.roles
                                  .filter((role) => role !== selectedUser.role)
                                  .map((role) => (
                                    <span
                                      key={role}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                    >
                                      {role}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.action")}</TableHead>
                          <TableHead>{t("common.timestamp")}</TableHead>
                          <TableHead>{t("common.ipAddress")}</TableHead>
                          <TableHead>{t("common.userAgent")}</TableHead>
                          <TableHead>{t("common.details")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserActivities(selectedUser.id).length > 0 ? (
                          getUserActivities(selectedUser.id).map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    activity.action === "Login"
                                      ? "bg-green-100 text-green-800"
                                      : activity.action === "Failed Login"
                                        ? "bg-red-100 text-red-800"
                                        : activity.action === "Password Change"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {activity.action}
                                </span>
                              </TableCell>
                              <TableCell>{activity.timestamp}</TableCell>
                              <TableCell>{activity.ipAddress}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {activity.userAgent}
                              </TableCell>
                              <TableCell>{activity.details}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              {t("common.noActivityRecords")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t("common.close")}</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("administration.users.editUser")}</DialogTitle>
            <DialogDescription>
              {t("administration.users.editUserDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="general">
                    {t("administration.users.generalInfo")}
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    {t("administration.users.securitySettings")}
                  </TabsTrigger>
                  <TabsTrigger value="roles">
                    {t("administration.users.roleAssignment")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">{t("common.name")}</Label>
                      <Input id="edit-name" defaultValue={selectedUser.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">{t("common.email")}</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        defaultValue={selectedUser.email}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">{t("common.phone")}</Label>
                      <Input
                        id="edit-phone"
                        defaultValue={selectedUser.phone}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-department">
                        {t("common.department")}
                      </Label>
                      <Input
                        id="edit-department"
                        defaultValue={selectedUser.department}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-clientType">
                        {t("common.clientType")}
                      </Label>
                      <Select defaultValue={selectedUser.clientType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FDF">
                            {t("clientTypes.fdf")}
                          </SelectItem>
                          <SelectItem value="ADHA">
                            {t("clientTypes.adha")}
                          </SelectItem>
                          <SelectItem value="CASH">
                            {t("clientTypes.cash")}
                          </SelectItem>
                          <SelectItem value="OTHER">
                            {t("clientTypes.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">{t("common.status")}</Label>
                      <Select defaultValue={selectedUser.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">
                            {t("status.active")}
                          </SelectItem>
                          <SelectItem value="inactive">
                            {t("status.inactive")}
                          </SelectItem>
                          <SelectItem value="locked">
                            {t("status.locked")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-effectiveFrom">
                        {t("common.effectiveFrom")}
                      </Label>
                      <Input
                        id="edit-effectiveFrom"
                        type="date"
                        defaultValue={selectedUser.effectiveFrom}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-effectiveTo">
                        {t("common.effectiveTo")}
                      </Label>
                      <Input
                        id="edit-effectiveTo"
                        type="date"
                        defaultValue={selectedUser.effectiveTo}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-mfa"
                          checked={selectedUser.mfaEnabled}
                          onCheckedChange={(checked) =>
                            setSelectedUser({
                              ...selectedUser,
                              mfaEnabled: checked,
                            })
                          }
                        />
                        <Label htmlFor="edit-mfa">
                          {t("administration.users.enableMfa")}
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("administration.users.mfaDescription")}
                    </p>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">
                        {t("administration.users.passwordActions")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleResetPassword(selectedUser.id)}
                        >
                          <Key className="h-3 w-3" />
                          {t("administration.users.resetPassword")}
                        </Button>

                        {selectedUser.status === "locked" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleUnlockAccount(selectedUser.id)}
                          >
                            <Unlock className="h-3 w-3" />
                            {t("administration.users.unlockAccount")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-primaryRole">
                        {t("administration.users.primaryRole")}
                      </Label>
                      <Select defaultValue={selectedUser.role.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrator">
                            {t("roles.administrator")}
                          </SelectItem>
                          <SelectItem value="healthcare provider">
                            {t("roles.healthcareProvider")}
                          </SelectItem>
                          <SelectItem value="project manager">
                            {t("roles.projectManager")}
                          </SelectItem>
                          <SelectItem value="financial officer">
                            {t("roles.financialOfficer")}
                          </SelectItem>
                          <SelectItem value="procurement officer">
                            {t("roles.procurementOfficer")}
                          </SelectItem>
                          <SelectItem value="committee member">
                            {t("roles.committeeMember")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("administration.users.additionalRoles")}</Label>
                      <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-role-system-auditor"
                            checked={selectedUser.roles?.includes(
                              "System Auditor",
                            )}
                          />
                          <Label htmlFor="edit-role-system-auditor">
                            {t("roles.systemAuditor")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-role-resource-allocator"
                            checked={selectedUser.roles?.includes(
                              "Resource Allocator",
                            )}
                          />
                          <Label htmlFor="edit-role-resource-allocator">
                            {t("roles.resourceAllocator")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="edit-role-report-viewer" />
                          <Label htmlFor="edit-role-report-viewer">
                            {t("roles.reportViewer")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="edit-role-data-exporter" />
                          <Label htmlFor="edit-role-data-exporter">
                            {t("roles.dataExporter")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="edit-role-client-manager" />
                          <Label htmlFor="edit-role-client-manager">
                            {t("roles.clientManager")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="edit-role-supplier-manager" />
                          <Label htmlFor="edit-role-supplier-manager">
                            {t("roles.supplierManager")}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit">{t("common.save")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
