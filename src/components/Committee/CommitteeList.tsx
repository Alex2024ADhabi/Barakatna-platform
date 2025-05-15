import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2, Users, Calendar, FileText } from "lucide-react";
import { Committee } from "@/lib/api/committee/types";
import { useToast } from "../ui/use-toast";
import { committeeApi } from "@/lib/api/committee/committeeApi";
import { ClientTypeIndicator } from "../Beneficiary/ClientTypeIndicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface CommitteeListProps {
  committees: Committee[];
  onEdit: (committee: Committee) => void;
  onRefresh: () => void;
  setSelectedCommittee?: (committee: Committee) => void;
  setShowMembers?: (show: boolean) => void;
}

const CommitteeList: React.FC<CommitteeListProps> = ({
  committees,
  onEdit,
  onRefresh,
  setSelectedCommittee,
  setShowMembers,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [committeeToDelete, setCommitteeToDelete] = useState<Committee | null>(
    null,
  );

  const handleDelete = async () => {
    if (!committeeToDelete) return;

    try {
      const response = await committeeApi.deleteCommittee(committeeToDelete.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Committee deleted successfully",
        });
        onRefresh();
      } else {
        throw new Error(response.error || "Failed to delete committee");
      }
    } catch (error) {
      console.error("Error deleting committee:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCommitteeToDelete(null);
    }
  };

  const confirmDelete = (committee: Committee) => {
    setCommitteeToDelete(committee);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      {committees.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("committee.noCommittees", "No committees found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("committee.name", "Name")}</TableHead>
                <TableHead>{t("committee.type", "Type")}</TableHead>
                <TableHead>
                  {t("committee.clientType", "Client Type")}
                </TableHead>
                <TableHead>{t("committee.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committees.map((committee) => (
                <TableRow key={committee.id}>
                  <TableCell className="font-medium">
                    {committee.name}
                  </TableCell>
                  <TableCell>{committee.type}</TableCell>
                  <TableCell>
                    <ClientTypeIndicator
                      clientTypeId={committee.clientTypeId}
                      showLabel={true}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={committee.isActive ? "default" : "secondary"}
                    >
                      {committee.isActive
                        ? t("common.active", "Active")
                        : t("common.inactive", "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(committee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(committee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCommittee(committee);
                          setShowMembers(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("committee.confirmDelete", "Confirm Deletion")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "committee.deleteWarning",
                "Are you sure you want to delete this committee? This action cannot be undone.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommitteeList;
