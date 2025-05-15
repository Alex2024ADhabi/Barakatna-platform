import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { CommitteeMember } from "@/lib/api/committee/types";
import { committeeApi } from "@/lib/api/committee/committeeApi";
import { useToast } from "../ui/use-toast";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

interface CommitteeMemberListProps {
  committeeId: string;
  onAddMember?: () => void;
  onEditMember?: (member: CommitteeMember) => void;
}

const CommitteeMemberList: React.FC<CommitteeMemberListProps> = ({
  committeeId,
  onAddMember,
  onEditMember,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CommitteeMember | null>(
    null,
  );

  useEffect(() => {
    fetchMembers();
  }, [committeeId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await committeeApi.getCommitteeMembers(committeeId);

      if (response.success && response.data) {
        setMembers(response.data.items);
      } else {
        // Mock data for development
        const mockMembers: CommitteeMember[] = [
          {
            id: "mem-001",
            userId: "user-001",
            name: "Ahmed Al Mansouri",
            email: "ahmed.almansouri@example.com",
            role: "Chair",
            position: "Director of Assessment",
            department: "Assessment Department",
            isActive: true,
            joinDate: new Date(2023, 0, 15),
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(2023, 0, 15),
          },
          {
            id: "mem-002",
            userId: "user-002",
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            role: "Secretary",
            position: "Senior Assessor",
            department: "Assessment Department",
            isActive: true,
            joinDate: new Date(2023, 0, 15),
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(2023, 0, 15),
          },
          {
            id: "mem-003",
            userId: "user-003",
            name: "Mohammed Al Hashimi",
            email: "mohammed.alhashimi@example.com",
            role: "Member",
            position: "Financial Analyst",
            department: "Finance Department",
            isActive: true,
            joinDate: new Date(2023, 0, 15),
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(2023, 0, 15),
          },
          {
            id: "mem-004",
            userId: "user-004",
            name: "Fatima Al Zaabi",
            email: "fatima.alzaabi@example.com",
            role: "Member",
            position: "Project Manager",
            department: "Project Management Department",
            isActive: false,
            joinDate: new Date(2023, 0, 15),
            endDate: new Date(2023, 6, 30),
            createdAt: new Date(2023, 0, 15),
            updatedAt: new Date(2023, 6, 30),
          },
        ];
        setMembers(mockMembers);
      }
    } catch (error) {
      console.error("Error fetching committee members:", error);
      toast({
        title: "Error",
        description: "Failed to load committee members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await committeeApi.removeCommitteeMember(
        committeeId,
        memberToDelete.id,
      );
      if (response.success) {
        toast({
          title: "Success",
          description: "Committee member removed successfully",
        });
        fetchMembers();
      } else {
        throw new Error(response.error || "Failed to remove committee member");
      }
    } catch (error) {
      console.error("Error removing committee member:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const confirmDelete = (member: CommitteeMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("committee.noMembers", "No committee members found")}
          </p>
          {onAddMember && (
            <Button className="mt-4" onClick={onAddMember}>
              {t("committee.addMember", "Add Member")}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("committee.name", "Name")}</TableHead>
                <TableHead>{t("committee.role", "Role")}</TableHead>
                <TableHead>{t("committee.position", "Position")}</TableHead>
                <TableHead>{t("committee.joinDate", "Join Date")}</TableHead>
                <TableHead>{t("committee.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div>{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <div>{member.position}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.department}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.joinDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive
                        ? t("common.active", "Active")
                        : t("common.inactive", "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onEditMember && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${member.email}`)}
                      >
                        <Mail className="h-4 w-4" />
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
                "committee.deleteMemberWarning",
                "Are you sure you want to remove this member from the committee? This action cannot be undone.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("common.remove", "Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommitteeMemberList;
