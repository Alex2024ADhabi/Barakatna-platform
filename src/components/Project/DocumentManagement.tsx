import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Plus,
  FileText,
  Download,
  Search,
  Calendar,
  FileUp,
  Trash2,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface DocumentManagementProps {
  projectId?: number;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
  projectId,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call an API
        // For now, we'll use mock data

        // Mock data for documents
        const mockDocuments = [
          {
            id: 1,
            name: "Project Requirements.pdf",
            type: "PDF",
            category: "Requirements",
            uploadedBy: "Ahmed Al-Farsi",
            uploadDate: "2023-05-01",
            size: "2.4 MB",
          },
          {
            id: 2,
            name: "Bathroom Modification Plans.dwg",
            type: "CAD",
            category: "Design",
            uploadedBy: "Layla Ibrahim",
            uploadDate: "2023-05-15",
            size: "5.7 MB",
          },
          {
            id: 3,
            name: "Accessibility Assessment Report.docx",
            type: "Document",
            category: "Assessment",
            uploadedBy: "Mohammed Al-Qahtani",
            uploadDate: "2023-05-20",
            size: "1.2 MB",
          },
          {
            id: 4,
            name: "Material Specifications.xlsx",
            type: "Spreadsheet",
            category: "Procurement",
            uploadedBy: "Fatima Al-Saud",
            uploadDate: "2023-05-25",
            size: "0.9 MB",
          },
          {
            id: 5,
            name: "Client Approval Form.pdf",
            type: "PDF",
            category: "Approvals",
            uploadedBy: "Ahmed Al-Farsi",
            uploadDate: "2023-06-02",
            size: "0.5 MB",
          },
        ];

        setDocuments(mockDocuments);
        setFilteredDocuments(mockDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [projectId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, documents]);

  const handleUploadDocument = () => {
    setIsUploadDialogOpen(true);
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "cad":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-700" />;
      case "spreadsheet":
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("project.searchDocuments", "Search documents...")}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleUploadDocument}>
          <Plus className="mr-2 h-4 w-4" />
          {t("project.uploadDocument", "Upload Document")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("project.projectDocuments", "Project Documents")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm
                  ? t(
                      "project.noDocumentsFound",
                      "No documents found matching your search.",
                    )
                  : t("project.noDocuments", "No documents available.")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("project.documentName", "Name")}</TableHead>
                  <TableHead>{t("project.category", "Category")}</TableHead>
                  <TableHead>
                    {t("project.uploadedBy", "Uploaded By")}
                  </TableHead>
                  <TableHead>{t("project.uploadDate", "Date")}</TableHead>
                  <TableHead>{t("project.size", "Size")}</TableHead>
                  <TableHead className="text-right">
                    {t("project.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getDocumentTypeIcon(document.type)}
                        <span className="ml-2 font-medium">
                          {document.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.category}</Badge>
                    </TableCell>
                    <TableCell>{document.uploadedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("project.download", "Download")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("project.delete", "Delete")}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Dialog - Placeholder */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("project.uploadDocument", "Upload Document")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
              <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {t(
                  "project.dragAndDrop",
                  "Drag and drop files here, or click to select files",
                )}
              </p>
              <Button className="mt-4">
                {t("project.selectFiles", "Select Files")}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={() => setIsUploadDialogOpen(false)}>
              {t("project.upload", "Upload")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;
