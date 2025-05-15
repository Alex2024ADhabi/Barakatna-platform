import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/form-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  MoreVertical,
  ArrowRight,
  Download,
  FileDown,
  Phone,
  Mail,
  Globe,
  Heart,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  CohortMember,
  CreateCohortMemberRequest,
  UpdateCohortMemberRequest,
} from "@/lib/api/cohort/types";
import CohortMemberForm from "./CohortMemberForm";

// Mock data for demonstration
const mockCohortMembers = [
  {
    memberId: 1,
    cohortId: 1,
    beneficiaryId: "BEN-001",
    joinDate: new Date(2023, 1, 15),
    exitDate: undefined,
    statusId: 1, // 1: Active, 2: Completed, 3: Dropped, 4: On Hold
    attendanceRate: 85,
    notes: "Regular participant, shows great progress",
    createdBy: 1,
    createdDate: new Date(2023, 1, 15),
    lastModifiedBy: undefined,
    lastModifiedDate: undefined,
    isActive: true,
    // Additional fields for UI display
    beneficiaryName: "Ahmed Al Mansouri",
    beneficiaryAge: 72,
    beneficiaryGender: "Male",
    statusName: "Active",
    contactNumber: "+971 50 123 4567",
    email: "ahmed.mansouri@example.com",
    emergencyContact: {
      name: "Mohammed Al Mansouri",
      relationship: "Son",
      phone: "+971 50 765 4321",
    },
    address: "Villa 42, Al Wasl Road, Jumeirah, Dubai",
    medicalConditions: ["Hypertension", "Mild arthritis"],
    preferredLanguage: "Arabic",
    caregiverName: "Aisha Al Mansouri",
  },
  {
    memberId: 2,
    cohortId: 1,
    beneficiaryId: "BEN-002",
    joinDate: new Date(2023, 1, 20),
    exitDate: undefined,
    statusId: 1,
    attendanceRate: 92,
    notes: "Very engaged in all activities",
    createdBy: 1,
    createdDate: new Date(2023, 1, 20),
    lastModifiedBy: undefined,
    lastModifiedDate: undefined,
    isActive: true,
    beneficiaryName: "Fatima Al Zahra",
    beneficiaryAge: 68,
    beneficiaryGender: "Female",
    statusName: "Active",
    contactNumber: "+971 50 987 6543",
    email: "fatima.zahra@example.com",
    emergencyContact: {
      name: "Noura Al Zahra",
      relationship: "Daughter",
      phone: "+971 55 123 7890",
    },
    address: "Apartment 304, Al Fahidi Street, Bur Dubai, Dubai",
    medicalConditions: ["Diabetes Type 2"],
    preferredLanguage: "Arabic",
    caregiverName: "Mariam Al Zahra",
  },
  {
    memberId: 3,
    cohortId: 1,
    beneficiaryId: "BEN-003",
    joinDate: new Date(2023, 1, 15),
    exitDate: new Date(2023, 3, 10),
    statusId: 3,
    attendanceRate: 45,
    notes: "Dropped due to health issues",
    createdBy: 1,
    createdDate: new Date(2023, 1, 15),
    lastModifiedBy: 2,
    lastModifiedDate: new Date(2023, 3, 10),
    isActive: false,
    beneficiaryName: "Omar Khalid",
    beneficiaryAge: 75,
    beneficiaryGender: "Male",
    statusName: "Dropped",
    contactNumber: "+971 55 456 7890",
    email: "omar.khalid@example.com",
    emergencyContact: {
      name: "Khalid Omar",
      relationship: "Son",
      phone: "+971 52 987 1234",
    },
    address: "Villa 15, Al Khawaneej Road, Al Khawaneej, Dubai",
    medicalConditions: ["Chronic heart disease", "Mobility issues"],
    preferredLanguage: "Arabic",
    caregiverName: "Saeed Omar",
  },
  {
    memberId: 4,
    cohortId: 1,
    beneficiaryId: "BEN-004",
    joinDate: new Date(2023, 1, 25),
    exitDate: undefined,
    statusId: 4,
    attendanceRate: 60,
    notes: "On hold due to temporary relocation",
    createdBy: 1,
    createdDate: new Date(2023, 1, 25),
    lastModifiedBy: 2,
    lastModifiedDate: new Date(2023, 2, 15),
    isActive: true,
    beneficiaryName: "Layla Mohammed",
    beneficiaryAge: 70,
    beneficiaryGender: "Female",
    statusName: "On Hold",
    contactNumber: "+971 54 321 0987",
    email: "layla.mohammed@example.com",
    emergencyContact: {
      name: "Ahmed Mohammed",
      relationship: "Husband",
      phone: "+971 50 432 8765",
    },
    address: "Apartment 512, Sheikh Zayed Road, Al Satwa, Dubai",
    medicalConditions: ["Osteoporosis"],
    preferredLanguage: "English",
    caregiverName: "Fatima Mohammed",
  },
];

interface CohortMemberListProps {
  cohortId?: number;
  onViewMember?: (memberId: number) => void;
  onAddMember?: () => void;
  onEditMember?: (memberId: number) => void;
}

const CohortMemberList: React.FC<CohortMemberListProps> = ({
  cohortId,
  onViewMember = () => {},
  onAddMember = () => {},
  onEditMember = () => {},
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredMembers, setFilteredMembers] = useState(mockCohortMembers);
  const [members, setMembers] = useState(mockCohortMembers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<
    (typeof mockCohortMembers)[0] | undefined
  >(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // Filter members based on search, status, and active tab
  useEffect(() => {
    let result = members;

    // Filter by cohort ID if provided
    if (cohortId) {
      result = result.filter((member) => member.cohortId === cohortId);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (member) =>
          member.beneficiaryName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.beneficiaryId
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter(
        (member) => member.statusId === parseInt(selectedStatus),
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      switch (activeTab) {
        case "active":
          result = result.filter(
            (member) => member.statusId === 1 && member.isActive,
          );
          break;
        case "onhold":
          result = result.filter((member) => member.statusId === 4);
          break;
        case "dropped":
          result = result.filter((member) => member.statusId === 3);
          break;
        case "completed":
          result = result.filter((member) => member.statusId === 2);
          break;
      }
    }

    setFilteredMembers(result);
  }, [searchQuery, selectedStatus, activeTab, cohortId, members]);

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: // Active
        return "bg-green-500";
      case 2: // Completed
        return "bg-blue-500";
      case 3: // Dropped
        return "bg-red-500";
      case 4: // On Hold
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // formatDate function moved to the top level scope

  // Handle form submission for adding or editing a member
  const handleFormSubmit = (
    data: CreateCohortMemberRequest | UpdateCohortMemberRequest,
  ) => {
    if (isEditing && currentMember) {
      // Update existing member
      const updatedMembers = members.map((m) => {
        if (m.memberId === currentMember.memberId) {
          return {
            ...m,
            beneficiaryId: data.beneficiaryId as string,
            joinDate: data.joinDate as Date,
            exitDate: data.exitDate,
            statusId: data.statusId,
            notes: data.notes || m.notes,
            lastModifiedDate: new Date(),
            lastModifiedBy: 1, // Assuming current user ID
          };
        }
        return m;
      });
      setMembers(updatedMembers);
    } else {
      // Add new member
      const newMember = {
        memberId:
          members.length > 0
            ? Math.max(...members.map((m) => m.memberId)) + 1
            : 1,
        cohortId: cohortId || 1,
        beneficiaryId: data.beneficiaryId as string,
        joinDate: data.joinDate as Date,
        exitDate: data.exitDate,
        statusId: data.statusId,
        attendanceRate: 0, // Default for new members
        notes: data.notes,
        createdBy: 1, // Assuming current user ID
        createdDate: new Date(),
        lastModifiedBy: undefined,
        lastModifiedDate: undefined,
        isActive: true,
        // Additional fields for UI display
        beneficiaryName: `New Member ${data.beneficiaryId}`, // This would come from a beneficiary lookup in a real app
        beneficiaryAge: 65, // Default value, would come from beneficiary data
        beneficiaryGender: "Unknown", // Default value, would come from beneficiary data
        statusName: getStatusName(data.statusId),
        contactNumber: "", // Default empty contact number
      };
      setMembers([...members, newMember]);
    }
    setIsFormOpen(false);
  };

  // Get status name from status ID
  const getStatusName = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return t("cohort.statuses.active", "Active");
      case 2:
        return t("cohort.statuses.completed", "Completed");
      case 3:
        return t("cohort.statuses.dropped", "Dropped");
      case 4:
        return t("cohort.statuses.onHold", "On Hold");
      default:
        return "Unknown";
    }
  };

  // Handle editing a member
  const handleEditMember = (memberId: number) => {
    const member = members.find((m) => m.memberId === memberId);
    if (member) {
      setCurrentMember(member);
      setIsEditing(true);
      setIsFormOpen(true);
    }
  };

  // Export members to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      "Member ID",
      "Beneficiary ID",
      "Beneficiary Name",
      "Contact Number",
      "Email",
      "Join Date",
      "Exit Date",
      "Status",
      "Attendance Rate",
      "Address",
      "Medical Conditions",
      "Preferred Language",
      "Emergency Contact Name",
      "Emergency Contact Relationship",
      "Emergency Contact Phone",
      "Caregiver Name",
      "Notes",
    ];

    // Convert members to CSV rows
    const csvRows = [
      headers.join(","),
      ...filteredMembers.map((member) => {
        return [
          member.memberId,
          member.beneficiaryId,
          `"${member.beneficiaryName}"`, // Wrap in quotes to handle commas in names
          `"${member.contactNumber || ""}"`,
          `"${member.email || ""}"`,
          formatDate(member.joinDate),
          member.exitDate ? formatDate(member.exitDate) : "",
          member.statusName,
          `${member.attendanceRate || 0}%`,
          `"${member.address || ""}"`,
          `"${member.medicalConditions ? member.medicalConditions.join(", ") : ""}"`,
          `"${member.preferredLanguage || ""}"`,
          `"${member.emergencyContact?.name || ""}"`,
          `"${member.emergencyContact?.relationship || ""}"`,
          `"${member.emergencyContact?.phone || ""}"`,
          `"${member.caregiverName || ""}"`,
          `"${member.notes?.replace(/"/g, '""') || ""}"`, // Escape quotes in notes
        ].join(",");
      }),
    ].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cohort-members-${cohortId || "all"}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show toast notification
    // If you have a toast system, you can add a notification here
  };

  return (
    <>
      <div className={`bg-white p-6 rounded-lg shadow-sm ${directionClass}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {t("cohort.memberList", "Cohort Members")}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {t("cohort.exportMembers", "Export CSV")}
            </Button>
            <Button
              onClick={() => {
                setCurrentMember(undefined);
                setIsEditing(false);
                setIsFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("cohort.addMember", "Add Member")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("cohort.totalMembers", "Total Members")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("cohort.activeMembers", "Active Members")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.statusId === 1 && m.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("cohort.averageAttendance", "Average Attendance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.length > 0
                  ? Math.round(
                      members.reduce(
                        (sum, m) => sum + (m.attendanceRate || 0),
                        0,
                      ) / members.length,
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("cohort.onHoldMembers", "On Hold Members")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter((m) => m.statusId === 4).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t("cohort.searchMembers", "Search members...")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <SelectField
              label=""
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: "", label: t("cohort.allStatuses", "All Statuses") },
                { value: "1", label: t("cohort.statuses.active", "Active") },
                {
                  value: "2",
                  label: t("cohort.statuses.completed", "Completed"),
                },
                { value: "3", label: t("cohort.statuses.dropped", "Dropped") },
                { value: "4", label: t("cohort.statuses.onHold", "On Hold") },
              ]}
              placeholder={t("cohort.status", "Status")}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("");
              }}
            >
              {t("common.buttons.reset", "Reset")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              {t("cohort.allMembers", "All Members")}
            </TabsTrigger>
            <TabsTrigger value="active">
              {t("cohort.statuses.active", "Active")}
            </TabsTrigger>
            <TabsTrigger value="onhold">
              {t("cohort.statuses.onHold", "On Hold")}
            </TabsTrigger>
            <TabsTrigger value="dropped">
              {t("cohort.statuses.dropped", "Dropped")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MemberCard
                  key={member.memberId}
                  member={member}
                  onViewMember={onViewMember}
                  onEditMember={handleEditMember}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("cohort.noMembers", "No members found")}
              </div>
            )}
          </TabsContent>

          {["active", "onhold", "dropped", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <MemberCard
                    key={member.memberId}
                    member={member}
                    onViewMember={onViewMember}
                    onEditMember={handleEditMember}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t(
                    `cohort.no${tab.charAt(0).toUpperCase() + tab.slice(1)}Members`,
                    "No members found",
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Cohort Member Form */}
      <CohortMemberForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        member={currentMember as any}
        cohortId={cohortId}
        isEditing={isEditing}
      />
    </>
  );
};

// Helper function to format dates - moved outside components to be accessible everywhere
const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

interface MemberCardProps {
  member: (typeof mockCohortMembers)[0];
  onViewMember: (memberId: number) => void;
  onEditMember: (memberId: number) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onViewMember,
  onEditMember,
}) => {
  const { t } = useTranslation();
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Add the getStatusColor function inside the MemberCard component
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: // Active
        return "bg-green-500";
      case 2: // Completed
        return "bg-blue-500";
      case 3: // Dropped
        return "bg-red-500";
      case 4: // On Hold
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {member.beneficiaryName}
                </h3>
                <Badge className={getStatusColor(member.statusId)}>
                  {member.statusName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {member.beneficiaryId}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewMember(member.memberId)}>
                  {t("cohort.viewMember", "View Details")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditMember(member.memberId)}>
                  {t("cohort.editMember", "Edit Member")}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  {t("cohort.removeMember", "Remove Member")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.joinDate", "Join Date")}:
                </span>
                <span>{formatDate(member.joinDate)}</span>
              </div>

              {member.exitDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("cohort.exitDate", "Exit Date")}:
                  </span>
                  <span>{formatDate(member.exitDate)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.beneficiaryDetails", "Beneficiary")}:
                </span>
                <span>
                  {member.beneficiaryAge} {t("common.yearsOld", "years old")},{" "}
                  {member.beneficiaryGender}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.contactNumber", "Contact")}:
                </span>
                <span>
                  {member.contactNumber || t("common.notAvailable", "N/A")}
                </span>
              </div>

              {member.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("cohort.email", "Email")}:
                  </span>
                  <span>{member.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>{t("cohort.attendanceRate", "Attendance Rate")}:</span>
                  <span>{member.attendanceRate}%</span>
                </div>
                <Progress value={member.attendanceRate || 0} />
              </div>

              {member.preferredLanguage && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("cohort.preferredLanguage", "Preferred Language")}:
                  </span>
                  <span>{member.preferredLanguage}</span>
                </div>
              )}

              {member.caregiverName && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("cohort.caregiverName", "Caregiver")}:
                  </span>
                  <span>{member.caregiverName}</span>
                </div>
              )}

              {member.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {t("cohort.notes", "Notes")}:
                  </span>
                  <p className="mt-1">{member.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional details section that can be toggled */}
          <Button
            variant="ghost"
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            className="mt-2 text-sm w-full justify-center"
          >
            {showMoreDetails
              ? t("cohort.showLess", "Show Less")
              : t("cohort.showMore", "Show More Details")}
          </Button>

          {showMoreDetails && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {member.address && (
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("cohort.address", "Address")}:
                      </span>
                      <p className="mt-1">{member.address}</p>
                    </div>
                  )}

                  {member.medicalConditions &&
                    member.medicalConditions.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground font-medium">
                          {t("cohort.medicalConditions", "Medical Conditions")}:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.medicalConditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-red-50"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {member.emergencyContact && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("cohort.emergencyContact", "Emergency Contact")}:
                      </span>
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        <p className="font-medium">
                          {member.emergencyContact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.emergencyContact.relationship}
                        </p>
                        <p className="text-sm">
                          {member.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => onViewMember(member.memberId)}
              className="flex items-center"
            >
              {t("cohort.viewDetails", "View Details")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortMemberList;
