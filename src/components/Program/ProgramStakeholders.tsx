import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  phone: string;
  influence: "high" | "medium" | "low";
  interest: "high" | "medium" | "low";
  avatar?: string;
}

interface ProgramStakeholdersProps {
  programId: string;
}

const influenceColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const interestColors: Record<string, string> = {
  high: "bg-blue-100 text-blue-800",
  medium: "bg-purple-100 text-purple-800",
  low: "bg-gray-100 text-gray-800",
};

const ProgramStakeholders: React.FC<ProgramStakeholdersProps> = ({
  programId,
}) => {
  const { t } = useTranslation();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState<
    Stakeholder[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStakeholder, setCurrentStakeholder] =
    useState<Stakeholder | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const mockStakeholders: Stakeholder[] = [
      {
        id: "1",
        name: "Ahmed Al-Mansour",
        role: "Program Sponsor",
        organization: "Ministry of Health",
        email: "ahmed.mansour@moh.gov",
        phone: "+966 50 123 4567",
        influence: "high",
        interest: "high",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
      },
      {
        id: "2",
        name: "Fatima Al-Harbi",
        role: "Community Representative",
        organization: "Senior Care Association",
        email: "fatima@seniorcare.org",
        phone: "+966 55 987 6543",
        influence: "medium",
        interest: "high",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
      },
      {
        id: "3",
        name: "Mohammed Al-Qahtani",
        role: "Technical Advisor",
        organization: "Accessibility Consultants",
        email: "mohammed@accessibility.com",
        phone: "+966 54 456 7890",
        influence: "medium",
        interest: "medium",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
      },
      {
        id: "4",
        name: "Sarah Johnson",
        role: "Financial Controller",
        organization: "FDF",
        email: "sarah@fdf.org",
        phone: "+966 56 234 5678",
        influence: "high",
        interest: "medium",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      },
      {
        id: "5",
        name: "Khalid Al-Otaibi",
        role: "Regulatory Compliance",
        organization: "ADHA",
        email: "khalid@adha.gov",
        phone: "+966 59 876 5432",
        influence: "low",
        interest: "low",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid",
      },
    ];

    setStakeholders(mockStakeholders);
    setFilteredStakeholders(mockStakeholders);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stakeholders.filter(
        (stakeholder) =>
          stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stakeholder.organization
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredStakeholders(filtered);
    } else {
      setFilteredStakeholders(stakeholders);
    }
  }, [searchTerm, stakeholders]);

  const handleAddStakeholder = () => {
    // In a real app, this would send data to an API
    setIsAddDialogOpen(false);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setCurrentStakeholder(stakeholder);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStakeholder = (id: string) => {
    // In a real app, this would send a delete request to an API
    setStakeholders(stakeholders.filter((s) => s.id !== id));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const renderMatrixCell = (
    influence: string,
    interest: string,
    stakeholders: Stakeholder[],
  ) => {
    const cellStakeholders = stakeholders.filter(
      (s) => s.influence === influence && s.interest === interest,
    );

    return (
      <div className="border p-2 h-32 overflow-y-auto bg-white">
        {cellStakeholders.length > 0 ? (
          cellStakeholders.map((stakeholder) => (
            <div
              key={stakeholder.id}
              className="flex items-center gap-2 mb-2 p-1 rounded hover:bg-gray-50"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
                <AvatarFallback>{getInitials(stakeholder.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs truncate">{stakeholder.name}</span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            {t("No stakeholders")}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("Stakeholder Management")}
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            {t("Add Stakeholder")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="list">{t("List View")}</TabsTrigger>
              <TabsTrigger value="matrix">{t("Matrix View")}</TabsTrigger>
            </TabsList>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("Search stakeholders...")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Role")}</TableHead>
                    <TableHead>{t("Organization")}</TableHead>
                    <TableHead>{t("Contact")}</TableHead>
                    <TableHead>{t("Influence")}</TableHead>
                    <TableHead>{t("Interest")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStakeholders.length > 0 ? (
                    filteredStakeholders.map((stakeholder) => (
                      <TableRow key={stakeholder.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={stakeholder.avatar}
                                alt={stakeholder.name}
                              />
                              <AvatarFallback>
                                {getInitials(stakeholder.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {stakeholder.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{stakeholder.role}</TableCell>
                        <TableCell>{stakeholder.organization}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {stakeholder.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">
                                {stakeholder.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${influenceColors[stakeholder.influence]} capitalize`}
                          >
                            {t(stakeholder.influence)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${interestColors[stakeholder.interest]} capitalize`}
                          >
                            {t(stakeholder.interest)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStakeholder(stakeholder)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteStakeholder(stakeholder.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-4 text-gray-500"
                      >
                        {t("No stakeholders found matching your criteria")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="mt-0">
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-1">
                  {t("Stakeholder Matrix")}
                </h3>
                <p className="text-xs text-gray-500">
                  {t(
                    "Visualize stakeholders based on their influence and interest in the program",
                  )}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1"></div>
                <div className="text-center text-sm font-medium">
                  {t("Low Interest")}
                </div>
                <div className="text-center text-sm font-medium">
                  {t("Medium Interest")}
                </div>
                <div className="text-center text-sm font-medium">
                  {t("High Interest")}
                </div>

                <div className="flex items-center justify-end pr-2">
                  <span
                    className="text-sm font-medium rotate-180"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {t("High Influence")}
                  </span>
                </div>
                {renderMatrixCell("high", "low", filteredStakeholders)}
                {renderMatrixCell("high", "medium", filteredStakeholders)}
                {renderMatrixCell("high", "high", filteredStakeholders)}

                <div className="flex items-center justify-end pr-2">
                  <span
                    className="text-sm font-medium rotate-180"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {t("Medium Influence")}
                  </span>
                </div>
                {renderMatrixCell("medium", "low", filteredStakeholders)}
                {renderMatrixCell("medium", "medium", filteredStakeholders)}
                {renderMatrixCell("medium", "high", filteredStakeholders)}

                <div className="flex items-center justify-end pr-2">
                  <span
                    className="text-sm font-medium rotate-180"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {t("Low Influence")}
                  </span>
                </div>
                {renderMatrixCell("low", "low", filteredStakeholders)}
                {renderMatrixCell("low", "medium", filteredStakeholders)}
                {renderMatrixCell("low", "high", filteredStakeholders)}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Stakeholder Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add New Stakeholder")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">{t("Full Name")}</Label>
                  <Input id="name" placeholder={t("Enter full name")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">{t("Role")}</Label>
                  <Input id="role" placeholder={t("Enter role")} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="organization">{t("Organization")}</Label>
                <Input
                  id="organization"
                  placeholder={t("Enter organization")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{t("Email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("Enter email")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">{t("Phone")}</Label>
                  <Input id="phone" placeholder={t("Enter phone number")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="influence">{t("Influence Level")}</Label>
                  <Select>
                    <SelectTrigger id="influence">
                      <SelectValue placeholder={t("Select level")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t("High")}</SelectItem>
                      <SelectItem value="medium">{t("Medium")}</SelectItem>
                      <SelectItem value="low">{t("Low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interest">{t("Interest Level")}</Label>
                  <Select>
                    <SelectTrigger id="interest">
                      <SelectValue placeholder={t("Select level")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t("High")}</SelectItem>
                      <SelectItem value="medium">{t("Medium")}</SelectItem>
                      <SelectItem value="low">{t("Low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddStakeholder}>
                {t("Add Stakeholder")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Stakeholder Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Edit Stakeholder")}</DialogTitle>
            </DialogHeader>
            {currentStakeholder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-name">{t("Full Name")}</Label>
                    <Input
                      id="edit-name"
                      defaultValue={currentStakeholder.name}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-role">{t("Role")}</Label>
                    <Input
                      id="edit-role"
                      defaultValue={currentStakeholder.role}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-organization">{t("Organization")}</Label>
                  <Input
                    id="edit-organization"
                    defaultValue={currentStakeholder.organization}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-email">{t("Email")}</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      defaultValue={currentStakeholder.email}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-phone">{t("Phone")}</Label>
                    <Input
                      id="edit-phone"
                      defaultValue={currentStakeholder.phone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-influence">
                      {t("Influence Level")}
                    </Label>
                    <Select defaultValue={currentStakeholder.influence}>
                      <SelectTrigger id="edit-influence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t("High")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="low">{t("Low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-interest">{t("Interest Level")}</Label>
                    <Select defaultValue={currentStakeholder.interest}>
                      <SelectTrigger id="edit-interest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t("High")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="low">{t("Low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                {t("Save Changes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProgramStakeholders;
