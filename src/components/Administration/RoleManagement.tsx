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
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Search, Plus, Edit, Trash2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
}

const RoleManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Mock data - would be replaced with API calls
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Administrator",
      description: "Full system access",
      permissions: [
        "user_manage",
        "role_manage",
        "system_config",
        "audit_view",
        "client_config",
      ],
      usersCount: 3,
    },
    {
      id: "2",
      name: "Healthcare Provider",
      description: "Access to assessment and beneficiary modules",
      permissions: [
        "assessment_manage",
        "beneficiary_view",
        "beneficiary_edit",
      ],
      usersCount: 12,
    },
    {
      id: "3",
      name: "Project Manager",
      description: "Access to project management modules",
      permissions: ["project_manage", "resource_allocate", "budget_view"],
      usersCount: 8,
    },
  ]);

  const permissions: Permission[] = [
    {
      id: "user_manage",
      name: "User Management",
      description: "Create, edit, delete users",
      module: "Administration",
    },
    {
      id: "role_manage",
      name: "Role Management",
      description: "Create, edit, delete roles",
      module: "Administration",
    },
    {
      id: "system_config",
      name: "System Configuration",
      description: "Configure system settings",
      module: "Administration",
    },
    {
      id: "audit_view",
      name: "Audit Log Viewing",
      description: "View audit logs",
      module: "Administration",
    },
    {
      id: "client_config",
      name: "Client Type Configuration",
      description: "Configure client types",
      module: "Administration",
    },
    {
      id: "assessment_manage",
      name: "Assessment Management",
      description: "Create and manage assessments",
      module: "Assessment",
    },
    {
      id: "beneficiary_view",
      name: "Beneficiary Viewing",
      description: "View beneficiary details",
      module: "Beneficiary",
    },
    {
      id: "beneficiary_edit",
      name: "Beneficiary Editing",
      description: "Edit beneficiary details",
      module: "Beneficiary",
    },
    {
      id: "project_manage",
      name: "Project Management",
      description: "Create and manage projects",
      module: "Project",
    },
    {
      id: "resource_allocate",
      name: "Resource Allocation",
      description: "Allocate resources to projects",
      module: "Project",
    },
    {
      id: "budget_view",
      name: "Budget Viewing",
      description: "View budget information",
      module: "Budget",
    },
  ];

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    // Add role logic would go here
    setIsAddRoleOpen(false);
  };

  const handleEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    // Edit role logic would go here
    setIsEditRoleOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    // Delete role logic would go here
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group permissions by module for the form
  const permissionsByModule = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.roles.title")}
        </h2>
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {t("administration.roles.addRole")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("administration.roles.addNewRole")}</DialogTitle>
              <DialogDescription>
                {t("administration.roles.addRoleDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("common.name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("administration.roles.roleName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("common.description")}</Label>
                  <Input
                    id="description"
                    placeholder={t("administration.roles.roleDescription")}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("administration.roles.permissions")}
                </h3>
                {Object.entries(permissionsByModule).map(
                  ([module, modulePermissions]) => (
                    <Card key={module}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{module}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {modulePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2"
                            >
                              <Checkbox id={`permission-${permission.id}`} />
                              <div className="grid gap-1.5">
                                <Label
                                  htmlFor={`permission-${permission.id}`}
                                  className="font-medium"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-sm text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>

              <DialogFooter>
                <Button type="submit">{t("common.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.description")}</TableHead>
              <TableHead>
                {t("administration.roles.permissionsCount")}
              </TableHead>
              <TableHead>{t("administration.roles.usersCount")}</TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell>{role.usersCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsEditRoleOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {t("common.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("administration.roles.editRole")}</DialogTitle>
            <DialogDescription>
              {t("administration.roles.editRoleDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form onSubmit={handleEditRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">{t("common.name")}</Label>
                  <Input id="edit-name" defaultValue={selectedRole.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">
                    {t("common.description")}
                  </Label>
                  <Input
                    id="edit-description"
                    defaultValue={selectedRole.description}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("administration.roles.permissions")}
                </h3>
                {Object.entries(permissionsByModule).map(
                  ([module, modulePermissions]) => (
                    <Card key={module}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{module}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {modulePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2"
                            >
                              <Checkbox
                                id={`edit-permission-${permission.id}`}
                                defaultChecked={selectedRole.permissions.includes(
                                  permission.id,
                                )}
                              />
                              <div className="grid gap-1.5">
                                <Label
                                  htmlFor={`edit-permission-${permission.id}`}
                                  className="font-medium"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-sm text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>

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

export default RoleManagement;
