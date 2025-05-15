import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { ManpowerResource } from "@/lib/api/manpower/types";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";
import { Search, Plus, Filter } from "lucide-react";

const ResourceList = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [resources, setResources] = useState<ManpowerResource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await manpowerApi.getResources();
        setResources(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const departments = [
    ...new Set(resources.map((resource) => resource.department)),
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !selectedDepartment || resource.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("manpower.resourceList")}</CardTitle>
            <CardDescription>
              {t("manpower.resourceListDescription")}
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("manpower.addResource")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> {t("common.filter")}
            </Button>
            {departments.map((department) => (
              <Badge
                key={department}
                variant={
                  selectedDepartment === department ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() =>
                  setSelectedDepartment(
                    selectedDepartment === department ? null : department,
                  )
                }
              >
                {department}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("manpower.name")}</TableHead>
                  <TableHead>{t("manpower.role")}</TableHead>
                  <TableHead>{t("manpower.department")}</TableHead>
                  <TableHead>{t("manpower.utilization")}</TableHead>
                  <TableHead>{t("manpower.type")}</TableHead>
                  <TableHead>{t("manpower.skills")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell>{resource.role}</TableCell>
                      <TableCell>{resource.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${resource.utilization > 90 ? "bg-green-500" : resource.utilization > 70 ? "bg-blue-500" : "bg-yellow-500"}`}
                              style={{ width: `${resource.utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {resource.utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            resource.isContractor ? "outline" : "default"
                          }
                        >
                          {resource.isContractor
                            ? t("manpower.contractor")
                            : t("manpower.employee")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {resource.skills.slice(0, 2).map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {resource.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {t("common.view")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceList;
