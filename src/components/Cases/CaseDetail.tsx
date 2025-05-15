import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  MessageCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Tag,
  DollarSign,
  User,
  Edit,
  Trash,
  Download,
  Upload,
  Plus,
  History,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  Case,
  CaseDocument,
  CaseCommunication,
  CaseNote,
  CaseHistory,
} from "@/lib/api/case/types";

interface CaseDetailProps {
  caseId: string;
}

export default function CaseDetail({ caseId }: CaseDetailProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("overview");
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [communications, setCommunications] = useState<CaseCommunication[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [history, setHistory] = useState<CaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching case data
    const fetchCaseData = async () => {
      setLoading(true);
      try {
        // In a real implementation, these would be API calls
        // For now, we'll use mock data
        const mockCase: Case = {
          id: caseId,
          caseNumber: "CS-2023-001",
          beneficiaryId: "b001",
          beneficiaryName: "Ahmed Al-Saud",
          status: "in-progress",
          priority: "high",
          type: "fdf",
          title: "Home Modification for Mobility",
          description:
            "Bathroom and entrance modifications for wheelchair accessibility",
          createdAt: "2023-10-15",
          updatedAt: "2023-10-20",
          assignedTo: "user123",
          address: "Riyadh, Al Olaya District",
          contactPhone: "+966501234567",
          contactEmail: "ahmed@example.com",
          estimatedCompletionDate: "2023-12-15",
          tags: ["wheelchair", "bathroom", "entrance"],
          totalBudget: 25000,
          spentBudget: 10000,
          remainingBudget: 15000,
        };

        const mockDocuments: CaseDocument[] = [
          {
            id: "d1",
            caseId: caseId,
            name: "Initial Assessment Report.pdf",
            fileUrl: "#",
            fileType: "application/pdf",
            fileSize: 2500000,
            uploadedBy: "user456",
            uploadedAt: "2023-10-16",
            description: "Initial assessment of the home",
            category: "assessment",
          },
          {
            id: "d2",
            caseId: caseId,
            name: "Bathroom Modification Plan.pdf",
            fileUrl: "#",
            fileType: "application/pdf",
            fileSize: 3200000,
            uploadedBy: "user789",
            uploadedAt: "2023-10-18",
            description: "Detailed plans for bathroom modifications",
            category: "report",
          },
          {
            id: "d3",
            caseId: caseId,
            name: "Contractor Agreement.docx",
            fileUrl: "#",
            fileType: "application/docx",
            fileSize: 1800000,
            uploadedBy: "user123",
            uploadedAt: "2023-10-19",
            description: "Agreement with the contractor",
            category: "contract",
          },
        ];

        const mockCommunications: CaseCommunication[] = [
          {
            id: "c1",
            caseId: caseId,
            type: "phone",
            direction: "outgoing",
            contactPerson: "Ahmed Al-Saud",
            timestamp: "2023-10-16T10:30:00",
            content:
              "Called to schedule initial assessment visit. Appointment set for Oct 17 at 2 PM.",
            recordedBy: "user123",
          },
          {
            id: "c2",
            caseId: caseId,
            type: "email",
            direction: "incoming",
            contactPerson: "Ahmed Al-Saud",
            timestamp: "2023-10-18T14:15:00",
            subject: "Questions about modifications",
            content:
              "I have some questions about the proposed bathroom modifications. Can we discuss them?",
            recordedBy: "user456",
          },
          {
            id: "c3",
            caseId: caseId,
            type: "meeting",
            direction: "outgoing",
            contactPerson: "Ahmed Al-Saud and Family",
            timestamp: "2023-10-19T15:00:00",
            content:
              "Met with beneficiary and family to discuss modification plans. They approved the bathroom design but requested changes to the entrance ramp.",
            recordedBy: "user789",
          },
        ];

        const mockNotes: CaseNote[] = [
          {
            id: "n1",
            caseId: caseId,
            content:
              "Beneficiary has specific requirements for the bathroom grab bars. Need to ensure they are installed at the correct height.",
            createdBy: "user123",
            createdAt: "2023-10-17T16:45:00",
            isPrivate: false,
            category: "assessment",
          },
          {
            id: "n2",
            caseId: caseId,
            content:
              "Contractor mentioned potential delay due to material availability. Need to follow up next week.",
            createdBy: "user456",
            createdAt: "2023-10-19T11:20:00",
            isPrivate: true,
            category: "follow-up",
          },
          {
            id: "n3",
            caseId: caseId,
            content:
              "Budget adjustment may be needed for the entrance ramp modifications. Will prepare revised estimate.",
            createdBy: "user789",
            createdAt: "2023-10-20T09:15:00",
            isPrivate: false,
            category: "important",
          },
        ];

        const mockHistory: CaseHistory[] = [
          {
            id: "h1",
            caseId: caseId,
            action: "Case Created",
            description: "Case was created in the system",
            performedBy: "user123",
            timestamp: "2023-10-15T09:00:00",
          },
          {
            id: "h2",
            caseId: caseId,
            action: "Status Updated",
            description: "Case status changed from 'pending' to 'in-progress'",
            performedBy: "user456",
            timestamp: "2023-10-16T14:30:00",
            previousValues: { status: "pending" },
            newValues: { status: "in-progress" },
          },
          {
            id: "h3",
            caseId: caseId,
            action: "Assignment Changed",
            description: "Case assigned to new team member",
            performedBy: "user789",
            timestamp: "2023-10-18T10:15:00",
            previousValues: { assignedTo: "user456" },
            newValues: { assignedTo: "user123" },
          },
          {
            id: "h4",
            caseId: caseId,
            action: "Budget Updated",
            description: "Budget allocation updated",
            performedBy: "user123",
            timestamp: "2023-10-20T11:45:00",
            previousValues: { totalBudget: 20000 },
            newValues: { totalBudget: 25000 },
          },
        ];

        setCaseData(mockCase);
        setDocuments(mockDocuments);
        setCommunications(mockCommunications);
        setNotes(mockNotes);
        setHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching case data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const getStatusColor = (status: Case["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Case["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: Case["type"]) => {
    switch (type) {
      case "fdf":
        return "bg-purple-100 text-purple-800";
      case "adha":
        return "bg-indigo-100 text-indigo-800";
      case "cash":
        return "bg-emerald-100 text-emerald-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Case["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-red-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t("Case Not Found")}
        </h2>
        <p className="text-gray-600">
          {t(
            "The requested case could not be found or you don't have permission to view it.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{caseData.title}</h1>
            <Badge className={getStatusColor(caseData.status)}>
              {t(
                caseData.status.charAt(0).toUpperCase() +
                  caseData.status.slice(1),
              )}
            </Badge>
          </div>
          <div className="text-gray-500 mt-1">
            {t("Case Number")}: {caseData.caseNumber}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            {t("Edit")}
          </Button>
          <Button variant="default">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("Update Status")}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="documents">{t("Documents")}</TabsTrigger>
          <TabsTrigger value="communications">
            {t("Communications")}
          </TabsTrigger>
          <TabsTrigger value="notes">{t("Notes")}</TabsTrigger>
          <TabsTrigger value="history">{t("History")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("Case Details")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">
                      {t("Description")}
                    </h3>
                    <p className="mt-1 text-gray-600">{caseData.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700">
                        {t("Status")}
                      </h3>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(caseData.status)}
                        <span className="ml-2">
                          {t(
                            caseData.status.charAt(0).toUpperCase() +
                              caseData.status.slice(1),
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">
                        {t("Priority")}
                      </h3>
                      <Badge
                        className={`mt-1 ${getPriorityColor(caseData.priority)}`}
                      >
                        {t(
                          caseData.priority.charAt(0).toUpperCase() +
                            caseData.priority.slice(1),
                        )}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">{t("Type")}</h3>
                      <Badge className={`mt-1 ${getTypeColor(caseData.type)}`}>
                        {caseData.type.toUpperCase()}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">
                        {t("Created Date")}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        {new Date(caseData.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">
                        {t("Estimated Completion")}
                      </h3>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        {caseData.estimatedCompletionDate
                          ? new Date(
                              caseData.estimatedCompletionDate,
                            ).toLocaleDateString()
                          : t("Not set")}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-700">{t("Tags")}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {caseData.tags?.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-100"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Beneficiary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {caseData.beneficiaryName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {caseData.beneficiaryName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("Beneficiary ID")}: {caseData.beneficiaryId}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <span>{caseData.address}</span>
                    </div>

                    {caseData.contactPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{caseData.contactPhone}</span>
                      </div>
                    )}

                    {caseData.contactEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{caseData.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Budget")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("Total Budget")}</span>
                      <span className="font-medium">
                        {caseData.totalBudget?.toLocaleString()} SAR
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("Spent")}</span>
                      <span className="font-medium text-red-600">
                        {caseData.spentBudget?.toLocaleString()} SAR
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t("Remaining")}</span>
                      <span className="font-medium text-green-600">
                        {caseData.remainingBudget?.toLocaleString()} SAR
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("Budget Utilization")}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${caseData.totalBudget ? (caseData.spentBudget! / caseData.totalBudget) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Assignment")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {caseData.assignedTo ? (
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">User Name</div>
                        <div className="text-sm text-gray-500">
                          {t("Case Manager")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">{t("No assignment")}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" />
                        {t("Assign Case")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("Documents")}</CardTitle>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                {t("Upload Document")}
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No Documents")}
                  </h3>
                  <p className="text-gray-500">
                    {t("There are no documents attached to this case yet.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="h-10 w-10 text-blue-500 p-2 bg-blue-50 rounded-lg" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-500">
                            {doc.description}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Badge variant="outline" className="mr-2">
                              {doc.category}
                            </Badge>
                            <span>
                              {(doc.fileSize / 1000000).toFixed(1)} MB
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("Communications")}</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Communication")}
              </Button>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No Communications")}
                  </h3>
                  <p className="text-gray-500">
                    {t(
                      "There are no communications recorded for this case yet.",
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={
                              comm.direction === "incoming"
                                ? "bg-green-50 text-green-700"
                                : "bg-blue-50 text-blue-700"
                            }
                          >
                            {t(
                              comm.direction === "incoming"
                                ? "Incoming"
                                : "Outgoing",
                            )}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {t(
                              comm.type.charAt(0).toUpperCase() +
                                comm.type.slice(1),
                            )}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comm.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-medium mb-1">
                        {comm.subject ||
                          t(
                            comm.type.charAt(0).toUpperCase() +
                              comm.type.slice(1) +
                              " Communication",
                          )}
                      </h4>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span>{comm.contactPerson}</span>
                      </div>

                      <p className="text-gray-700">{comm.content}</p>

                      {comm.attachments && comm.attachments.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">
                            {t("Attachments")}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {comm.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center p-2 bg-gray-50 rounded-md"
                              >
                                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">
                                  {attachment.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("Notes")}</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Note")}
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No Notes")}
                  </h3>
                  <p className="text-gray-500">
                    {t("There are no notes added to this case yet.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {note.isPrivate && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 mr-2"
                            >
                              {t("Private")}
                            </Badge>
                          )}
                          {note.category && (
                            <Badge variant="outline">
                              {t(
                                note.category.charAt(0).toUpperCase() +
                                  note.category.slice(1),
                              )}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-gray-700">{note.content}</p>

                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{note.createdBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("Case History")}</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No History")}
                  </h3>
                  <p className="text-gray-500">
                    {t("There is no history recorded for this case yet.")}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {history.map((item, index) => (
                      <div key={item.id} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <History className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>

                          {(item.previousValues || item.newValues) && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                              {item.previousValues &&
                                Object.keys(item.previousValues).map((key) => (
                                  <div key={key} className="flex">
                                    <span className="text-gray-500 w-24">
                                      {key}:
                                    </span>
                                    <span className="text-red-500 line-through mr-2">
                                      {String(item.previousValues[key])}
                                    </span>
                                    <span className="text-green-500">
                                      {String(item.newValues?.[key] || "")}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            <span>{item.performedBy}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
