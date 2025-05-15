import React from "react";
import { useTranslation } from "react-i18next";
import { Project } from "@/lib/api/project/types";
import ProjectCard from "./ProjectCard";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Filter } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface ProjectListProps {
  projects: Project[];
  onViewProject: (projectId: number) => void;
  isLoading?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onViewProject,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredProjects, setFilteredProjects] =
    React.useState<Project[]>(projects);

  React.useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.projectName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.projectCode.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("project.searchProjects", "Search projects...")}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          {t("project.filter", "Filter")}
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {searchTerm
              ? t(
                  "project.noProjectsFound",
                  "No projects found matching your search.",
                )
              : t("project.noProjects", "No projects available.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={{
                ...project,
                seniorCitizenName: "John Doe", // This would come from the API in a real implementation
                statusName:
                  project.statusId === 3
                    ? "Completed"
                    : project.statusId === 2
                      ? "In Progress"
                      : "Pending",
                projectManagerName: "Project Manager", // This would come from the API in a real implementation
                completionPercentage: 50, // This would come from the API in a real implementation
                taskCount: 10, // This would come from the API in a real implementation
                completedTasks: 5, // This would come from the API in a real implementation
              }}
              onViewProject={onViewProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
