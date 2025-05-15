import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import {
  Search,
  Save,
  UserPlus,
  Trash2,
  Copy,
  AlertTriangle,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  userRolesApi,
  Role,
  Permission,
} from "../../lib/api/user/userRolesApi";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../context/AuthContext";
import {
  WorkflowEngine,
  WorkflowPhase,
  WorkflowStatus,
} from "../../services/workflowEngine";
import {
  NotificationService,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
} from "../../services/notificationService";

interface PermissionsManagerProps {
  onSave?: (roles: Role[]) => void;
  onUserAssign?: (roleId: string, userIds: string[]) => void;
}

const PermissionsManager = ({
  onSave,
  onUserAssign,
}: PermissionsManagerProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingRole, setIsCreatingRole] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDescription, setNewRoleDescription] = useState<string>("");
  const [newRoleParent, setNewRoleParent] = useState<string>("");
  const [hasPermissionConflicts, setHasPermissionConflicts] =
    useState<boolean>(false);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [cloneRoleName, setCloneRoleName] = useState<string>("");
  const [isAssigningUsers, setIsAssigningUsers] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { toast } = useToast();
  const { user, checkPermission } = useAuth();
  const notificationService = NotificationService.getInstance();
  const workflowEngine = WorkflowEngine.getInstance();

  const currentRole = roles.find((role) => role.id === selectedRole);

  const filteredPermissions = currentRole
    ? currentRole.permissions.filter((p) =>
        p.module.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Fetch roles and available modules on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesResponse, modulesResponse] = await Promise.all([
          userRolesApi.getRoles(),
          userRolesApi.getAvailableModules(),
        ]);

        if (rolesResponse.success && rolesResponse.data) {
          setRoles(rolesResponse.data.items || []);
          if (rolesResponse.data.items && rolesResponse.data.items.length > 0) {
            setSelectedRole(rolesResponse.data.items[0].id);
          }

          // Register workflow for role management
          const roleManagementWorkflow = {
            id: "role-management-workflow",
            name: "Role Management Workflow",
            description: "Workflow for managing user roles and permissions",
            clientTypeId: 1, // Default client type
            steps: [
              {
                id: "create-role",
                name: "Create Role",
                description: "Create a new role with permissions",
                phase: WorkflowPhase.ProjectPlanning,
                order: 1,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Administrator"],
                previousSteps: [],
                nextSteps: ["assign-users"],
              },
              {
                id: "assign-users",
                name: "Assign Users",
                description: "Assign users to the role",
                phase: WorkflowPhase.ProjectPlanning,
                order: 2,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Administrator"],
                previousSteps: ["create-role"],
                nextSteps: ["review-permissions"],
              },
              {
                id: "review-permissions",
                name: "Review Permissions",
                description: "Review and finalize role permissions",
                phase: WorkflowPhase.ApprovalProcess,
                order: 3,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Administrator"],
                previousSteps: ["assign-users"],
                nextSteps: [],
              },
            ],
            currentStepId: "create-role",
            status: WorkflowStatus.InProgress,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          workflowEngine.registerWorkflow(roleManagementWorkflow);
        } else {
          toast({
            title: "Error fetching roles",
            description: rolesResponse.error || "Failed to fetch roles",
            variant: "destructive",
          });
          // Fall back to mock data if API fails
          setRoles(mockRoles);
          setSelectedRole(mockRoles[0].id);
        }

        if (modulesResponse.success && modulesResponse.data) {
          setAvailableModules(modulesResponse.data);
        }

        // Register notification templates
        const roleCreatedTemplate = {
          id: "role-created",
          name: "Role Created",
          description: "Notification sent when a new role is created",
          type: NotificationType.Info,
          channels: [NotificationChannel.InApp, NotificationChannel.Email],
          titleTemplate: "New Role Created: {{roleName}}",
          bodyTemplate:
            "A new role '{{roleName}}' has been created with {{permissionCount}} permissions.",
          defaultPriority: NotificationPriority.Medium,
        };

        const roleUpdatedTemplate = {
          id: "role-updated",
          name: "Role Updated",
          description: "Notification sent when a role is updated",
          type: NotificationType.Info,
          channels: [NotificationChannel.InApp],
          titleTemplate: "Role Updated: {{roleName}}",
          bodyTemplate: "The role '{{roleName}}' has been updated.",
          defaultPriority: NotificationPriority.Low,
        };

        const roleDeletedTemplate = {
          id: "role-deleted",
          name: "Role Deleted",
          description: "Notification sent when a role is deleted",
          type: NotificationType.Warning,
          channels: [NotificationChannel.InApp, NotificationChannel.Email],
          titleTemplate: "Role Deleted: {{roleName}}",
          bodyTemplate: "The role '{{roleName}}' has been deleted.",
          defaultPriority: NotificationPriority.Medium,
        };

        notificationService.registerTemplate(roleCreatedTemplate);
        notificationService.registerTemplate(roleUpdatedTemplate);
        notificationService.registerTemplate(roleDeletedTemplate);

        // Mock available users for assignment
        setAvailableUsers([
          { id: "user-1", name: "John Doe" },
          { id: "user-2", name: "Jane Smith" },
          { id: "user-3", name: "Ahmed Al-Farsi" },
          { id: "user-4", name: "Maria Garcia" },
          { id: "user-5", name: "Li Wei" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch roles and modules",
          variant: "destructive",
        });
        // Fall back to mock data if API fails
        setRoles(mockRoles);
        setSelectedRole(mockRoles[0].id);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Check for permission inheritance conflicts
  useEffect(() => {
    if (currentRole?.parentRoleId) {
      const parentRole = roles.find(
        (role) => role.id === currentRole.parentRoleId,
      );
      if (parentRole) {
        // Check for conflicts where child has fewer permissions than parent
        const hasConflicts = currentRole.permissions.some((childPerm) => {
          const parentPerm = parentRole.permissions.find(
            (p) => p.module === childPerm.module,
          );
          if (!parentPerm) return false;

          return Object.entries(childPerm).some(([key, value]) => {
            if (key === "module") return false;
            return !value && parentPerm[key as keyof Permission];
          });
        });

        setHasPermissionConflicts(hasConflicts);
      }
    } else {
      setHasPermissionConflicts(false);
    }
  }, [currentRole, roles]);

  const handlePermissionChange = async (
    moduleIndex: number,
    field: keyof Permission,
    value: boolean,
  ) => {
    if (!currentRole) return;

    const updatedRoles = roles.map((role) => {
      if (role.id === selectedRole) {
        const updatedPermissions = [...role.permissions];
        updatedPermissions[moduleIndex] = {
          ...updatedPermissions[moduleIndex],
          [field]: value,
        };
        return { ...role, permissions: updatedPermissions };
      }
      return role;
    });

    setRoles(updatedRoles);
  };

  const handleSave = async () => {
    if (!currentRole) return;

    setIsLoading(true);
    try {
      const response = await userRolesApi.updateRole(currentRole.id, {
        permissions: currentRole.permissions,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Role permissions updated successfully",
        });

        // Send notification about role update
        await notificationService.sendNotification(
          "role-updated",
          user?.id || "system",
          {
            roleName: currentRole.name,
            updatedBy: user?.firstName
              ? `${user.firstName} ${user.lastName}`
              : "System",
          },
        );

        // Update workflow status
        await workflowEngine.transitionToStep(
          "role-management-workflow",
          "review-permissions",
          { userId: user?.id },
        );

        if (onSave) {
          onSave(roles);
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update role permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create default permissions for all available modules
      const defaultPermissions: Permission[] = availableModules.map(
        (module) => ({
          module,
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
        }),
      );

      const createRoleData = {
        name: newRoleName,
        description: newRoleDescription,
        permissions: defaultPermissions,
        parentRoleId: newRoleParent || undefined,
      };

      const response = await userRolesApi.createRole(createRoleData);

      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Role created successfully",
        });

        // Add the new role to the roles list and select it
        setRoles([...roles, response.data]);
        setSelectedRole(response.data.id);

        // Send notification about role creation
        await notificationService.sendNotification(
          "role-created",
          user?.id || "system",
          {
            roleName: newRoleName,
            permissionCount: defaultPermissions.length,
            createdBy: user?.firstName
              ? `${user.firstName} ${user.lastName}`
              : "System",
          },
        );

        // Update workflow status
        await workflowEngine.transitionToStep(
          "role-management-workflow",
          "assign-users",
          { userId: user?.id },
        );

        // Reset form
        setNewRoleName("");
        setNewRoleDescription("");
        setNewRoleParent("");
        setIsCreatingRole(false);

        // Open user assignment dialog
        setIsAssigningUsers(true);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    setIsLoading(true);
    try {
      const roleToDelete = roles.find((role) => role.id === roleId);
      const response = await userRolesApi.deleteRole(roleId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });

        if (roleToDelete) {
          // Send notification about role deletion
          await notificationService.sendNotification(
            "role-deleted",
            user?.id || "system",
            {
              roleName: roleToDelete.name,
              deletedBy: user?.firstName
                ? `${user.firstName} ${user.lastName}`
                : "System",
            },
          );
        }

        // Remove the deleted role from the roles list
        const updatedRoles = roles.filter((role) => role.id !== roleId);
        setRoles(updatedRoles);

        // Select another role if available
        if (updatedRoles.length > 0) {
          setSelectedRole(updatedRoles[0].id);
        } else {
          setSelectedRole("");
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneRole = async () => {
    if (!currentRole || !cloneRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required for cloning",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await userRolesApi.cloneRole(
        currentRole.id,
        cloneRoleName,
      );

      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Role cloned successfully",
        });

        // Add the cloned role to the roles list and select it
        setRoles([...roles, response.data]);
        setSelectedRole(response.data.id);

        // Reset form
        setCloneRoleName("");
        setIsCloning(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to clone role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cloning role:", error);
      toast({
        title: "Error",
        description: "Failed to clone role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveConflicts = async () => {
    if (!currentRole) return;

    setIsLoading(true);
    try {
      const response = await userRolesApi.resolvePermissionConflicts(
        currentRole.id,
      );

      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Permission conflicts resolved successfully",
        });

        // Update the role in the roles list
        const updatedRoles = roles.map((role) =>
          role.id === currentRole.id ? response.data : role,
        );
        setRoles(updatedRoles);
        setHasPermissionConflicts(false);

        // Send notification about conflict resolution
        await notificationService.sendNotification(
          "role-updated",
          user?.id || "system",
          {
            roleName: currentRole.name,
            updatedBy: user?.firstName
              ? `${user.firstName} ${user.lastName}`
              : "System",
            action: "resolved permission conflicts",
          },
        );
      } else {
        toast({
          title: "Error",
          description:
            response.error || "Failed to resolve permission conflicts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resolving conflicts:", error);
      toast({
        title: "Error",
        description: "Failed to resolve permission conflicts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user assignment to roles
  const handleAssignUsers = async () => {
    if (!currentRole) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would call an API to assign users to the role
      // For now, we'll simulate a successful assignment

      toast({
        title: "Success",
        description: `${selectedUsers.length} users assigned to ${currentRole.name} role`,
      });

      // Send notification about user assignment
      await notificationService.sendNotification(
        "role-updated",
        user?.id || "system",
        {
          roleName: currentRole.name,
          updatedBy: user?.firstName
            ? `${user.firstName} ${user.lastName}`
            : "System",
          action: `assigned ${selectedUsers.length} users`,
        },
      );

      // Call the onUserAssign callback if provided
      if (onUserAssign) {
        onUserAssign(currentRole.id, selectedUsers);
      }

      // Reset selected users and close dialog
      setSelectedUsers([]);
      setIsAssigningUsers(false);
    } catch (error) {
      console.error("Error assigning users:", error);
      toast({
        title: "Error",
        description: "Failed to assign users to role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refreshing the user list
  const handleRefreshUserList = () => {
    setIsRefreshing(true);

    // Simulate API call to refresh user list
    setTimeout(() => {
      // Add a few more mock users
      setAvailableUsers([
        ...availableUsers,
        { id: "user-6", name: "Robert Johnson" },
        { id: "user-7", name: "Sarah Lee" },
      ]);

      setIsRefreshing(false);

      toast({
        title: "Success",
        description: "User list refreshed successfully",
      });
    }, 1000);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>
          Manage access permissions for different user roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">{currentRole?.description}</p>

            {currentRole?.parentRoleId && (
              <div className="flex items-center">
                <p className="text-xs text-gray-500 mr-2">
                  Inherits from:{" "}
                  {roles.find((r) => r.id === currentRole.parentRoleId)?.name}
                </p>
                {hasPermissionConflicts && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-amber-600"
                    onClick={handleResolveConflicts}
                    disabled={isLoading}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Resolve Conflicts
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search modules"
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              disabled={!currentRole || isLoading}
              onClick={() => setIsAssigningUsers(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Users
            </Button>

            <Dialog open={isCloning} onOpenChange={setIsCloning}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!currentRole || isLoading}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clone Role</DialogTitle>
                  <DialogDescription>
                    Create a copy of {currentRole?.name} with all its
                    permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clone-name" className="text-right">
                      New Role Name
                    </Label>
                    <Input
                      id="clone-name"
                      value={cloneRoleName}
                      onChange={(e) => setCloneRoleName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCloning(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCloneRole} disabled={isLoading}>
                    Clone
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssigningUsers} onOpenChange={setIsAssigningUsers}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assign Users to Role</DialogTitle>
                  <DialogDescription>
                    Select users to assign to the {currentRole?.name} role.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Available Users</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshUserList}
                      disabled={isRefreshing}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>

                  <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 py-2 border-b last:border-0"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter((id) => id !== user.id),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`user-${user.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {user.name}
                        </Label>
                      </div>
                    ))}

                    {availableUsers.length === 0 && (
                      <p className="text-sm text-gray-500 p-2">
                        No users available
                      </p>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {selectedUsers.length} users selected
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAssigningUsers(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignUsers}
                    disabled={isLoading || selectedUsers.length === 0}
                  >
                    Assign Users
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreatingRole} onOpenChange={setIsCreatingRole}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new role with custom permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Role Name
                    </Label>
                    <Input
                      id="name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="parent" className="text-right">
                      Parent Role
                    </Label>
                    <Select
                      value={newRoleParent}
                      onValueChange={setNewRoleParent}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select parent role (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingRole(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} disabled={isLoading}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {currentRole && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Role
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the role "{currentRole.name}" and remove its permissions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteRole(currentRole.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Module</TableHead>
                  <TableHead className="text-center">View</TableHead>
                  <TableHead className="text-center">Create</TableHead>
                  <TableHead className="text-center">Edit</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                  <TableHead className="text-center">Approve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission, index) => {
                  const moduleIndex =
                    currentRole?.permissions.findIndex(
                      (p) => p.module === permission.module,
                    ) ?? -1;

                  // Find parent permission if exists
                  const parentRole = currentRole?.parentRoleId
                    ? roles.find((r) => r.id === currentRole.parentRoleId)
                    : null;
                  const parentPermission = parentRole?.permissions.find(
                    (p) => p.module === permission.module,
                  );

                  return (
                    <TableRow key={permission.module}>
                      <TableCell className="font-medium">
                        {permission.module}
                      </TableCell>
                      {["view", "create", "edit", "delete", "approve"].map(
                        (action) => {
                          const actionKey = action as keyof Permission;
                          const isInherited =
                            parentPermission && parentPermission[actionKey];
                          const isConflicting =
                            isInherited && !permission[actionKey];

                          return (
                            <TableCell key={action} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={permission[actionKey]}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(
                                      moduleIndex,
                                      actionKey,
                                      checked === true,
                                    )
                                  }
                                  className={
                                    isConflicting ? "border-amber-500" : ""
                                  }
                                  disabled={isLoading}
                                />
                                {isInherited && (
                                  <span
                                    className="ml-1 text-xs text-gray-400"
                                    title="Inherited from parent role"
                                  >
                                    ↑
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          );
                        },
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading || !currentRole}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data for fallback if API fails
const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "Administrator",
    description: "Full system access",
    permissions: [
      {
        module: "Assessment",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Beneficiary",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Project",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Financial",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Committee",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Inventory",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Suppliers",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Reports",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: false,
      },
      {
        module: "User Management",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: false,
      },
    ],
  },
  {
    id: "role-2",
    name: "Assessor",
    description: "Conducts home assessments",
    permissions: [
      {
        module: "Assessment",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: false,
      },
      {
        module: "Beneficiary",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: false,
      },
      {
        module: "Project",
        view: true,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Financial",
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Committee",
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Inventory",
        view: true,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Suppliers",
        view: true,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Reports",
        view: true,
        create: true,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "User Management",
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
    ],
  },
  {
    id: "role-3",
    name: "Project Manager",
    description: "Manages implementation projects",
    permissions: [
      {
        module: "Assessment",
        view: true,
        create: false,
        edit: false,
        delete: false,
        approve: true,
      },
      {
        module: "Beneficiary",
        view: true,
        create: false,
        edit: true,
        delete: false,
        approve: false,
      },
      {
        module: "Project",
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      {
        module: "Financial",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: false,
      },
      {
        module: "Committee",
        view: true,
        create: true,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "Inventory",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: true,
      },
      {
        module: "Suppliers",
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: true,
      },
      {
        module: "Reports",
        view: true,
        create: true,
        edit: false,
        delete: false,
        approve: false,
      },
      {
        module: "User Management",
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
    ],
  },
];

export default PermissionsManager;
