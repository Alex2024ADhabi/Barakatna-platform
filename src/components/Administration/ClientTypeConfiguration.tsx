import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Search, Plus, Edit, Trash2, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ClientType {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  requiresApproval: boolean;
  fields: ClientTypeField[];
  workflows: ClientTypeWorkflow[];
}

interface ClientTypeField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  isRequired: boolean;
  options?: string[];
}

interface ClientTypeWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: string[];
}

const ClientTypeConfiguration = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientTypeOpen, setIsAddClientTypeOpen] = useState(false);
  const [isEditClientTypeOpen, setIsEditClientTypeOpen] = useState(false);
  const [selectedClientType, setSelectedClientType] =
    useState<ClientType | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Mock data - would be replaced with API calls
  const [clientTypes, setClientTypes] = useState<ClientType[]>([
    {
      id: "1",
      name: "FDF",
      code: "fdf",
      description: "Family Development Foundation clients",
      isActive: true,
      requiresApproval: true,
      fields: [
        { id: "f1", name: "FDF ID", type: "text", isRequired: true },
        {
          id: "f2",
          name: "Income Level",
          type: "select",
          isRequired: true,
          options: ["Low", "Medium", "High"],
        },
        { id: "f3", name: "Family Size", type: "number", isRequired: true },
      ],
      workflows: [
        {
          id: "w1",
          name: "FDF Assessment Workflow",
          description: "Standard workflow for FDF client assessments",
          isActive: true,
          steps: [
            "Initial Assessment",
            "Committee Review",
            "Approval",
            "Implementation",
            "Follow-up",
          ],
        },
      ],
    },
    {
      id: "2",
      name: "ADHA",
      code: "adha",
      description: "Abu Dhabi Housing Authority clients",
      isActive: true,
      requiresApproval: true,
      fields: [
        { id: "f4", name: "ADHA ID", type: "text", isRequired: true },
        {
          id: "f5",
          name: "Property Type",
          type: "select",
          isRequired: true,
          options: ["Apartment", "Villa", "House"],
        },
        { id: "f6", name: "Property Age", type: "number", isRequired: true },
      ],
      workflows: [
        {
          id: "w2",
          name: "ADHA Assessment Workflow",
          description: "Standard workflow for ADHA client assessments",
          isActive: true,
          steps: [
            "Initial Assessment",
            "Technical Review",
            "Budget Approval",
            "Implementation",
            "Inspection",
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Cash",
      code: "cash",
      description: "Direct paying clients",
      isActive: true,
      requiresApproval: false,
      fields: [
        { id: "f7", name: "Client ID", type: "text", isRequired: true },
        {
          id: "f8",
          name: "Payment Method",
          type: "select",
          isRequired: true,
          options: ["Credit Card", "Bank Transfer", "Cash"],
        },
      ],
      workflows: [
        {
          id: "w3",
          name: "Cash Client Workflow",
          description: "Simplified workflow for cash clients",
          isActive: true,
          steps: ["Assessment", "Quote Approval", "Payment", "Implementation"],
        },
      ],
    },
  ]);

  const handleAddClientType = (e: React.FormEvent) => {
    e.preventDefault();
    // Add client type logic would go here
    setIsAddClientTypeOpen(false);
  };

  const handleEditClientType = (e: React.FormEvent) => {
    e.preventDefault();
    // Edit client type logic would go here
    setIsEditClientTypeOpen(false);
  };

  const handleDeleteClientType = (clientTypeId: string) => {
    // Delete client type logic would go here
    setClientTypes(clientTypes.filter((ct) => ct.id !== clientTypeId));
  };

  const filteredClientTypes = clientTypes.filter(
    (clientType) =>
      clientType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientType.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.clientTypes.title")}
        </h2>
        <Dialog
          open={isAddClientTypeOpen}
          onOpenChange={setIsAddClientTypeOpen}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t("administration.clientTypes.addClientType")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("administration.clientTypes.addNewClientType")}
              </DialogTitle>
              <DialogDescription>
                {t("administration.clientTypes.addClientTypeDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClientType} className="space-y-4">
              <Tabs
                defaultValue="general"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="general">
                    {t("administration.clientTypes.tabs.general")}
                  </TabsTrigger>
                  <TabsTrigger value="fields">
                    {t("administration.clientTypes.tabs.fields")}
                  </TabsTrigger>
                  <TabsTrigger value="workflows">
                    {t("administration.clientTypes.tabs.workflows")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("common.name")}</Label>
                      <Input
                        id="name"
                        placeholder={t(
                          "administration.clientTypes.namePlaceholder",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">{t("common.code")}</Label>
                      <Input
                        id="code"
                        placeholder={t(
                          "administration.clientTypes.codePlaceholder",
                        )}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">
                        {t("common.description")}
                      </Label>
                      <Textarea
                        id="description"
                        placeholder={t(
                          "administration.clientTypes.descriptionPlaceholder",
                        )}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="isActive" defaultChecked />
                      <Label htmlFor="isActive">
                        {t("administration.clientTypes.isActive")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="requiresApproval" defaultChecked />
                      <Label htmlFor="requiresApproval">
                        {t("administration.clientTypes.requiresApproval")}
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.clientTypes.customFields")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "administration.clientTypes.customFieldsDescription",
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t("administration.clientTypes.addField")}
                        </Button>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("common.name")}</TableHead>
                              <TableHead>{t("common.type")}</TableHead>
                              <TableHead>{t("common.required")}</TableHead>
                              <TableHead>{t("common.options")}</TableHead>
                              <TableHead className="text-right">
                                {t("common.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-4"
                              >
                                {t("administration.clientTypes.noFieldsAdded")}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflows" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.clientTypes.workflows")}
                      </CardTitle>
                      <CardDescription>
                        {t("administration.clientTypes.workflowsDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t("administration.clientTypes.addWorkflow")}
                        </Button>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("common.name")}</TableHead>
                              <TableHead>{t("common.description")}</TableHead>
                              <TableHead>{t("common.status")}</TableHead>
                              <TableHead>
                                {t("administration.clientTypes.steps")}
                              </TableHead>
                              <TableHead className="text-right">
                                {t("common.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-4"
                              >
                                {t(
                                  "administration.clientTypes.noWorkflowsAdded",
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

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
              <TableHead>{t("common.code")}</TableHead>
              <TableHead>{t("common.description")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>
                {t("administration.clientTypes.approvalRequired")}
              </TableHead>
              <TableHead>
                {t("administration.clientTypes.customFields")}
              </TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientTypes.length > 0 ? (
              filteredClientTypes.map((clientType) => (
                <TableRow key={clientType.id}>
                  <TableCell className="font-medium">
                    {clientType.name}
                  </TableCell>
                  <TableCell>{clientType.code}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {clientType.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${clientType.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {clientType.isActive
                        ? t("status.active")
                        : t("status.inactive")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {clientType.requiresApproval
                      ? t("common.yes")
                      : t("common.no")}
                  </TableCell>
                  <TableCell>{clientType.fields.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedClientType(clientType);
                          setIsEditClientTypeOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClientType(clientType.id)}
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

      {/* Edit Client Type Dialog */}
      <Dialog
        open={isEditClientTypeOpen}
        onOpenChange={setIsEditClientTypeOpen}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("administration.clientTypes.editClientType")}
            </DialogTitle>
            <DialogDescription>
              {t("administration.clientTypes.editClientTypeDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedClientType && (
            <form onSubmit={handleEditClientType} className="space-y-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="general">
                    {t("administration.clientTypes.tabs.general")}
                  </TabsTrigger>
                  <TabsTrigger value="fields">
                    {t("administration.clientTypes.tabs.fields")}
                  </TabsTrigger>
                  <TabsTrigger value="workflows">
                    {t("administration.clientTypes.tabs.workflows")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">{t("common.name")}</Label>
                      <Input
                        id="edit-name"
                        defaultValue={selectedClientType.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-code">{t("common.code")}</Label>
                      <Input
                        id="edit-code"
                        defaultValue={selectedClientType.code}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="edit-description">
                        {t("common.description")}
                      </Label>
                      <Textarea
                        id="edit-description"
                        defaultValue={selectedClientType.description}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-isActive"
                        defaultChecked={selectedClientType.isActive}
                      />
                      <Label htmlFor="edit-isActive">
                        {t("administration.clientTypes.isActive")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-requiresApproval"
                        defaultChecked={selectedClientType.requiresApproval}
                      />
                      <Label htmlFor="edit-requiresApproval">
                        {t("administration.clientTypes.requiresApproval")}
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.clientTypes.customFields")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "administration.clientTypes.customFieldsDescription",
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t("administration.clientTypes.addField")}
                        </Button>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("common.name")}</TableHead>
                              <TableHead>{t("common.type")}</TableHead>
                              <TableHead>{t("common.required")}</TableHead>
                              <TableHead>{t("common.options")}</TableHead>
                              <TableHead className="text-right">
                                {t("common.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedClientType.fields.length > 0 ? (
                              selectedClientType.fields.map((field) => (
                                <TableRow key={field.id}>
                                  <TableCell>{field.name}</TableCell>
                                  <TableCell>
                                    {t(`fieldTypes.${field.type}`)}
                                  </TableCell>
                                  <TableCell>
                                    {field.isRequired
                                      ? t("common.yes")
                                      : t("common.no")}
                                  </TableCell>
                                  <TableCell>
                                    {field.options
                                      ? field.options.join(", ")
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-4"
                                >
                                  {t(
                                    "administration.clientTypes.noFieldsAdded",
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflows" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {t("administration.clientTypes.workflows")}
                      </CardTitle>
                      <CardDescription>
                        {t("administration.clientTypes.workflowsDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {t("administration.clientTypes.addWorkflow")}
                        </Button>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("common.name")}</TableHead>
                              <TableHead>{t("common.description")}</TableHead>
                              <TableHead>{t("common.status")}</TableHead>
                              <TableHead>
                                {t("administration.clientTypes.steps")}
                              </TableHead>
                              <TableHead className="text-right">
                                {t("common.actions")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedClientType.workflows.length > 0 ? (
                              selectedClientType.workflows.map((workflow) => (
                                <TableRow key={workflow.id}>
                                  <TableCell>{workflow.name}</TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {workflow.description}
                                  </TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${workflow.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                    >
                                      {workflow.isActive
                                        ? t("status.active")
                                        : t("status.inactive")}
                                    </span>
                                  </TableCell>
                                  <TableCell>{workflow.steps.length}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" size="icon">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="outline" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center py-4"
                                >
                                  {t(
                                    "administration.clientTypes.noWorkflowsAdded",
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
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

export default ClientTypeConfiguration;
