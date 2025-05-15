import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { clientConfigService } from "@/services/clientConfigService";
import { ClientType } from "@/lib/forms/types";
import ClientTypeIndicator from "./ClientTypeIndicator";

interface ClientTypeManagerProps {
  onClientTypeSelected?: (clientType: any) => void;
  clientTypes?: any[];
  isLoading?: boolean;
}

const ClientTypeManager: React.FC<ClientTypeManagerProps> = ({
  onClientTypeSelected,
  clientTypes: initialClientTypes,
  isLoading: initialLoading,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [clientTypes, setClientTypes] = useState<any[]>(
    initialClientTypes || [],
  );
  const [loading, setLoading] = useState(
    initialLoading !== undefined ? initialLoading : true,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClientType, setSelectedClientType] = useState<any | null>(
    null,
  );

  const [newClientType, setNewClientType] = useState({
    typeCode: "",
    typeNameEN: "",
    typeNameAR: "",
    description: "",
    isActive: true,
  });

  // Fetch client types on component mount if not provided as props
  useEffect(() => {
    if (!initialClientTypes) {
      fetchClientTypes();
    }
  }, [initialClientTypes]);

  // Update state when props change
  useEffect(() => {
    if (initialClientTypes) {
      setClientTypes(initialClientTypes);
    }
    if (initialLoading !== undefined) {
      setLoading(initialLoading);
    }
  }, [initialClientTypes, initialLoading]);

  const fetchClientTypes = async () => {
    setLoading(true);
    try {
      // Get client types from the service
      // Convert the Map to an array of client types
      const configsMap = clientConfigService.getAllClientConfigs();
      const types = [];

      // Convert client configs to client types
      configsMap.forEach((config, id) => {
        types.push({
          clientTypeId: id,
          typeCode: `CT-${id}`,
          typeNameEN:
            config.general?.notes?.split(" ")[0] || `Client Type ${id}`,
          typeNameAR: `نوع العميل ${id}`,
          description: config.general?.notes || "",
          isActive: true,
          createdBy: 1,
          createdDate: new Date(),
        });
      });

      setClientTypes(types);
    } catch (error) {
      console.error("Error fetching client types:", error);
      toast({
        title: "Error",
        description: "Failed to load client types.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClientType = async () => {
    // Validate form
    if (
      !newClientType.typeCode ||
      !newClientType.typeNameEN ||
      !newClientType.typeNameAR
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new client type
      const newId =
        Math.max(...clientTypes.map((ct) => ct.clientTypeId), 0) + 1;
      const newType = {
        ...newClientType,
        clientTypeId: newId,
        createdBy: 1,
        createdDate: new Date(),
      };

      // Add to the service
      clientConfigService.addClientType(newType);

      // Update local state
      setClientTypes([...clientTypes, newType]);
      setIsAddDialogOpen(false);
      setNewClientType({
        typeCode: "",
        typeNameEN: "",
        typeNameAR: "",
        description: "",
        isActive: true,
      });

      toast({
        title: "Success",
        description: "Client type added successfully.",
      });
    } catch (error) {
      console.error("Error adding client type:", error);
      toast({
        title: "Error",
        description: "Failed to add client type.",
        variant: "destructive",
      });
    }
  };

  const handleEditClientType = async () => {
    if (!selectedClientType) return;

    try {
      // Update the client type in the service
      clientConfigService.updateClientType(selectedClientType);

      // Update local state
      const updatedClientTypes = clientTypes.map((ct) =>
        ct.clientTypeId === selectedClientType.clientTypeId
          ? selectedClientType
          : ct,
      );

      setClientTypes(updatedClientTypes);
      setIsEditDialogOpen(false);
      setSelectedClientType(null);

      toast({
        title: "Success",
        description: "Client type updated successfully.",
      });
    } catch (error) {
      console.error("Error updating client type:", error);
      toast({
        title: "Error",
        description: "Failed to update client type.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClientType = async () => {
    if (!selectedClientType) return;

    try {
      // Remove from the service
      clientConfigService.removeClientType(selectedClientType.clientTypeId);

      // Update local state
      const updatedClientTypes = clientTypes.filter(
        (ct) => ct.clientTypeId !== selectedClientType.clientTypeId,
      );

      setClientTypes(updatedClientTypes);
      setIsDeleteDialogOpen(false);
      setSelectedClientType(null);

      toast({
        title: "Success",
        description: "Client type deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting client type:", error);
      toast({
        title: "Error",
        description: "Failed to delete client type.",
        variant: "destructive",
      });
    }
  };

  const handleSelectClientType = (clientType: any) => {
    setSelectedClientType(clientType);

    try {
      clientConfigService.setActiveClientType(clientType.clientTypeId);

      // Notify listeners about the change
      if (onClientTypeSelected) {
        onClientTypeSelected(clientType);
      }

      // Show toast notification
      toast({
        title: t("client.clientTypeSelected", "Client Type Selected"),
        description: t(
          "client.clientTypeSelectedDescription",
          "Selected {{name}}",
          { name: clientType.typeNameEN },
        ),
      });
    } catch (error) {
      console.error("Error setting active client type:", error);
      toast({
        title: "Error",
        description: "Failed to set active client type.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {t("client.clientTypeManager", "Client Type Management")}
          </CardTitle>
          <CardDescription>
            {t(
              "client.clientTypeDescription",
              "Manage client types and their configurations",
            )}
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("client.addClientType", "Add Client Type")}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t("common.loading", "Loading...")}</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("client.id", "ID")}</TableHead>
                  <TableHead>{t("client.type", "Type")}</TableHead>
                  <TableHead>{t("client.code", "Code")}</TableHead>
                  <TableHead>{t("client.nameEN", "Name (English)")}</TableHead>
                  <TableHead>{t("client.nameAR", "Name (Arabic)")}</TableHead>
                  <TableHead>{t("client.status", "Status")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientTypes.length > 0 ? (
                  clientTypes.map((clientType) => (
                    <TableRow
                      key={clientType.clientTypeId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelectClientType(clientType)}
                    >
                      <TableCell>{clientType.clientTypeId}</TableCell>
                      <TableCell>
                        <ClientTypeIndicator
                          clientType={clientType.clientTypeId}
                          showLabel={false}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>{clientType.typeCode}</TableCell>
                      <TableCell>{clientType.typeNameEN}</TableCell>
                      <TableCell>{clientType.typeNameAR}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            clientType.isActive ? "default" : "secondary"
                          }
                        >
                          {clientType.isActive
                            ? t("common.active", "Active")
                            : t("common.inactive", "Inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClientType(clientType);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClientType(clientType);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t("client.noClientTypes", "No client types found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Client Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("client.addClientType", "Add Client Type")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "client.addClientTypeDescription",
                "Create a new client type for the platform",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="typeCode" className="text-right">
                {t("client.code", "Code")}*
              </Label>
              <Input
                id="typeCode"
                value={newClientType.typeCode}
                onChange={(e) =>
                  setNewClientType({
                    ...newClientType,
                    typeCode: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="typeNameEN" className="text-right">
                {t("client.nameEN", "Name (English)")}*
              </Label>
              <Input
                id="typeNameEN"
                value={newClientType.typeNameEN}
                onChange={(e) =>
                  setNewClientType({
                    ...newClientType,
                    typeNameEN: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="typeNameAR" className="text-right">
                {t("client.nameAR", "Name (Arabic)")}*
              </Label>
              <Input
                id="typeNameAR"
                value={newClientType.typeNameAR}
                onChange={(e) =>
                  setNewClientType({
                    ...newClientType,
                    typeNameAR: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t("common.description", "Description")}
              </Label>
              <Textarea
                id="description"
                value={newClientType.description}
                onChange={(e) =>
                  setNewClientType({
                    ...newClientType,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                {t("common.active", "Active")}
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newClientType.isActive}
                  onCheckedChange={(checked) =>
                    setNewClientType({ ...newClientType, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">
                  {newClientType.isActive
                    ? t("common.active", "Active")
                    : t("common.inactive", "Inactive")}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleAddClientType}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("client.editClientType", "Edit Client Type")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "client.editClientTypeDescription",
                "Update client type details",
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedClientType && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-typeCode" className="text-right">
                  {t("client.code", "Code")}*
                </Label>
                <Input
                  id="edit-typeCode"
                  value={selectedClientType.typeCode}
                  onChange={(e) =>
                    setSelectedClientType({
                      ...selectedClientType,
                      typeCode: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-typeNameEN" className="text-right">
                  {t("client.nameEN", "Name (English)")}*
                </Label>
                <Input
                  id="edit-typeNameEN"
                  value={selectedClientType.typeNameEN}
                  onChange={(e) =>
                    setSelectedClientType({
                      ...selectedClientType,
                      typeNameEN: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-typeNameAR" className="text-right">
                  {t("client.nameAR", "Name (Arabic)")}*
                </Label>
                <Input
                  id="edit-typeNameAR"
                  value={selectedClientType.typeNameAR}
                  onChange={(e) =>
                    setSelectedClientType({
                      ...selectedClientType,
                      typeNameAR: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  {t("common.description", "Description")}
                </Label>
                <Textarea
                  id="edit-description"
                  value={selectedClientType.description || ""}
                  onChange={(e) =>
                    setSelectedClientType({
                      ...selectedClientType,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isActive" className="text-right">
                  {t("common.active", "Active")}
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={selectedClientType.isActive}
                    onCheckedChange={(checked) =>
                      setSelectedClientType({
                        ...selectedClientType,
                        isActive: checked,
                      })
                    }
                  />
                  <Label htmlFor="edit-isActive">
                    {selectedClientType.isActive
                      ? t("common.active", "Active")
                      : t("common.inactive", "Inactive")}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleEditClientType}>
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Type Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("client.deleteClientType", "Delete Client Type")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "client.deleteClientTypeDescription",
                "Are you sure you want to delete this client type? This action cannot be undone.",
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedClientType && (
            <div className="py-4">
              <p className="mb-2">
                <strong>{t("client.code", "Code")}:</strong>{" "}
                {selectedClientType.typeCode}
              </p>
              <p className="mb-2">
                <strong>{t("client.nameEN", "Name (English)")}:</strong>{" "}
                {selectedClientType.typeNameEN}
              </p>
              <p>
                <strong>{t("client.nameAR", "Name (Arabic)")}:</strong>{" "}
                {selectedClientType.typeNameAR}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteClientType}>
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClientTypeManager;
