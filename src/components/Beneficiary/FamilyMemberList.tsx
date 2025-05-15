import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FamilyMemberForm, FamilyMember } from "./FamilyMemberForm";
import { Plus, Edit, Trash2, Users } from "lucide-react";

interface FamilyMemberListProps {
  beneficiaryId: string;
}

export const FamilyMemberList: React.FC<FamilyMemberListProps> = ({
  beneficiaryId,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentFamilyMember, setCurrentFamilyMember] = useState<
    FamilyMember | undefined
  >();

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock data for now - in a real implementation, this would be an API call
        setTimeout(() => {
          const mockFamilyMembers: FamilyMember[] = [
            {
              id: "fm-1",
              beneficiaryId,
              fullNameEn: "Sarah Ahmed",
              fullNameAr: "سارة أحمد",
              relationship: "spouse",
              dateOfBirth: new Date(1965, 5, 15),
              gender: "female",
              contactNumber: "050-123-4567",
              emiratesId: "784-1965-1234567-8",
              isDependent: true,
              hasMedicalCondition: false,
            },
            {
              id: "fm-2",
              beneficiaryId,
              fullNameEn: "Mohammed Ahmed",
              fullNameAr: "محمد أحمد",
              relationship: "child",
              dateOfBirth: new Date(1990, 3, 10),
              gender: "male",
              contactNumber: "050-987-6543",
              emiratesId: "784-1990-7654321-0",
              isDependent: false,
              hasMedicalCondition: true,
              medicalConditionDetails: "Diabetes Type 2",
            },
          ];
          setFamilyMembers(mockFamilyMembers);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error("Error fetching family members:", err);
        setError("An error occurred while fetching family members");
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, [beneficiaryId]);

  const handleAddFamilyMember = () => {
    setCurrentFamilyMember(undefined);
    setIsFormOpen(true);
  };

  const handleEditFamilyMember = (familyMember: FamilyMember) => {
    setCurrentFamilyMember(familyMember);
    setIsFormOpen(true);
  };

  const handleDeleteFamilyMember = (id: string) => {
    if (window.confirm(t("familyMember.confirmDelete"))) {
      setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const handleSaveFamilyMember = (familyMember: FamilyMember) => {
    if (familyMember.id) {
      // Update existing family member
      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === familyMember.id ? familyMember : member,
        ),
      );
    } else {
      // Add new family member
      const newFamilyMember = {
        ...familyMember,
        id: `fm-${Date.now()}`, // Generate a temporary ID
      };
      setFamilyMembers((prev) => [...prev, newFamilyMember]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">{t("common.error")}:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className={`${directionClass} space-y-6`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("familyMember.title")}
          </CardTitle>
          <Button onClick={handleAddFamilyMember}>
            <Plus className="mr-2 h-4 w-4" />
            {t("familyMember.add")}
          </Button>
        </CardHeader>
        <CardContent>
          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("familyMember.noFamilyMembers")}</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleAddFamilyMember}
              >
                {t("familyMember.addFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {member.fullNameEn}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {t(
                            `familyMember.relationships.${member.relationship}`,
                          )}
                        </span>
                        {member.isDependent && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            {t("familyMember.dependent")}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {member.fullNameAr}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <div>
                          <span className="font-medium">
                            {t("familyMember.gender")}:
                          </span>{" "}
                          {t(`familyMember.${member.gender}`)}
                        </div>
                        <div>
                          <span className="font-medium">
                            {t("familyMember.dateOfBirth")}:
                          </span>{" "}
                          {member.dateOfBirth
                            ? member.dateOfBirth.toLocaleDateString()
                            : t("common.notProvided")}
                        </div>
                        {member.contactNumber && (
                          <div>
                            <span className="font-medium">
                              {t("familyMember.contactNumber")}:
                            </span>{" "}
                            {member.contactNumber}
                          </div>
                        )}
                        {member.emiratesId && (
                          <div>
                            <span className="font-medium">
                              {t("familyMember.emiratesId")}:
                            </span>{" "}
                            {member.emiratesId}
                          </div>
                        )}
                        {member.hasMedicalCondition && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-amber-600">
                              {t("familyMember.medicalCondition")}:
                            </span>{" "}
                            {member.medicalConditionDetails}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 self-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFamilyMember(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteFamilyMember(member.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FamilyMemberForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        familyMember={currentFamilyMember}
        beneficiaryId={beneficiaryId}
        onSave={handleSaveFamilyMember}
      />
    </div>
  );
};

export default FamilyMemberList;
