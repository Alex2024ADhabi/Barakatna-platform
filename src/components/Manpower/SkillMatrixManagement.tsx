import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { SkillMatrix } from "@/lib/api/manpower/types";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";
import { Plus } from "lucide-react";

const SkillMatrixManagement = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillMatrix = async () => {
      try {
        const data = await manpowerApi.getSkillMatrix();
        setSkillMatrix(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching skill matrix:", error);
        setLoading(false);
      }
    };

    fetchSkillMatrix();
  }, []);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-gray-100 text-gray-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-green-100 text-green-800";
      case "expert":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("manpower.skillMatrix")}</CardTitle>
            <CardDescription>
              {t("manpower.skillMatrixDescription")}
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("manpower.addSkill")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p>{t("common.loading")}</p>
          </div>
        ) : skillMatrix ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.skill")}
                  </th>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.beginner")}
                  </th>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.intermediate")}
                  </th>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.advanced")}
                  </th>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.expert")}
                  </th>
                  <th className="border p-2 bg-gray-50">
                    {t("manpower.total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {skillMatrix.skills.map((skill) => {
                  const total =
                    skill.resourceCounts.beginner +
                    skill.resourceCounts.intermediate +
                    skill.resourceCounts.advanced +
                    skill.resourceCounts.expert;
                  return (
                    <tr key={skill.skillId}>
                      <td className="border p-2 font-medium">
                        {skill.skillName}
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor("beginner")}`}
                        >
                          {skill.resourceCounts.beginner}
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor("intermediate")}`}
                        >
                          {skill.resourceCounts.intermediate}
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor("advanced")}`}
                        >
                          {skill.resourceCounts.advanced}
                        </span>
                      </td>
                      <td className="border p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor("expert")}`}
                        >
                          {skill.resourceCounts.expert}
                        </span>
                      </td>
                      <td className="border p-2 text-center font-medium">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>{t("manpower.noSkillMatrixData")}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("manpower.skillGaps")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Accessibility Standards</span>
                  <span className="text-red-500 font-medium">-2 experts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Geriatric Care</span>
                  <span className="text-red-500 font-medium">-1 advanced</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Home Modification</span>
                  <span className="text-red-500 font-medium">
                    -3 intermediate
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("manpower.trainingRecommendations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Accessibility Standards Training</span>
                  <span className="text-green-500 font-medium">
                    5 candidates
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Geriatric Care Certification</span>
                  <span className="text-green-500 font-medium">
                    3 candidates
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Home Modification Workshop</span>
                  <span className="text-green-500 font-medium">
                    7 candidates
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillMatrixManagement;
