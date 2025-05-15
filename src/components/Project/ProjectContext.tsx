import React, { createContext, useContext, useState, useEffect } from "react";
import { useClient } from "@/context/ClientContext";
import { useToast } from "@/components/ui/use-toast";
import eventBus, { EventType } from "@/services/eventBus";

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  projectData: any | null;
  isLoading: boolean;
  error: string | null;
  saveProject: (data: any) => Promise<boolean>;
  completeProject: () => Promise<boolean>;
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextType>({
  projectId: null,
  setProjectId: () => {},
  projectData: null,
  isLoading: false,
  error: null,
  saveProject: async () => false,
  completeProject: async () => false,
  resetProject: () => {},
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { clientType, clientConfig } = useClient();
  const { toast } = useToast();

  // Load project data when ID changes
  useEffect(() => {
    if (!projectId) {
      setProjectData(null);
      return;
    }

    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real implementation, this would call an API
        // For now, we'll simulate an API call with a timeout
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock project data
        const mockData = {
          id: projectId,
          projectCode: `${clientType}-PRJ-${Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0")}`,
          projectName: "Home Modification Project",
          beneficiaryId: "beneficiary-123",
          assessmentId: "assessment-456",
          clientType,
          status: "in-progress",
          startDate: new Date().toISOString(),
          targetCompletionDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          projectManagerId: 1,
          totalBudget: 50000,
          priorityLevel: 2,
          description: "Home modification project for elderly beneficiary",
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setProjectData(mockData);
      } catch (err) {
        console.error("Error loading project data:", err);
        setError("Failed to load project data");
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, clientType, toast]);

  // Save project data
  const saveProject = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setProjectData({
        ...projectData,
        ...data,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Project saved successfully",
      });

      // Publish project updated event
      eventBus.publish({
        id: crypto.randomUUID(),
        type: EventType.PROJECT_UPDATED,
        timestamp: new Date().toISOString(),
        source: "ProjectContext",
        payload: {
          projectId,
          ...data,
        },
      });

      return true;
    } catch (err) {
      console.error("Error saving project data:", err);
      setError("Failed to save project data");
      toast({
        title: "Error",
        description: "Failed to save project data",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete project
  const completeProject = async (): Promise<boolean> => {
    if (!projectData) return false;

    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      const completedData = {
        ...projectData,
        status: "completed",
        completedAt: new Date().toISOString(),
      };
      setProjectData(completedData);

      // Publish project completed event
      eventBus.publishProjectCompleted(
        "ProjectContext",
        projectId!,
        projectData.beneficiaryId,
        projectData.assessmentId,
        new Date().toISOString(),
        projectData.totalBudget,
        "completed",
      );

      toast({
        title: "Success",
        description: "Project completed successfully",
      });

      return true;
    } catch (err) {
      console.error("Error completing project:", err);
      setError("Failed to complete project");
      toast({
        title: "Error",
        description: "Failed to complete project",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset project
  const resetProject = () => {
    setProjectId(null);
    setProjectData(null);
    setError(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId,
        projectData,
        isLoading,
        error,
        saveProject,
        completeProject,
        resetProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
