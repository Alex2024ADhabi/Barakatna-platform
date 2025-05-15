import React, { createContext, useContext, useState, useEffect } from "react";
import { useClient } from "@/context/ClientContext";
import { useToast } from "@/components/ui/use-toast";
import eventBus, { EventType } from "@/services/eventBus";

interface AssessmentContextType {
  assessmentId: string | null;
  setAssessmentId: (id: string | null) => void;
  assessmentData: any | null;
  isLoading: boolean;
  error: string | null;
  saveAssessment: (data: any) => Promise<boolean>;
  completeAssessment: () => Promise<boolean>;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType>({
  assessmentId: null,
  setAssessmentId: () => {},
  assessmentData: null,
  isLoading: false,
  error: null,
  saveAssessment: async () => false,
  completeAssessment: async () => false,
  resetAssessment: () => {},
});

export const useAssessment = () => useContext(AssessmentContext);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { clientType, clientConfig } = useClient();
  const { toast } = useToast();

  // Load assessment data when ID changes
  useEffect(() => {
    if (!assessmentId) {
      setAssessmentData(null);
      return;
    }

    const loadAssessmentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real implementation, this would call an API
        // For now, we'll simulate an API call with a timeout
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock assessment data
        const mockData = {
          id: assessmentId,
          beneficiaryId: "beneficiary-123",
          clientType,
          status: "in-progress",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rooms: [],
          totalCost: 0,
          complianceRate: 0,
        };

        setAssessmentData(mockData);
      } catch (err) {
        console.error("Error loading assessment data:", err);
        setError("Failed to load assessment data");
        toast({
          title: "Error",
          description: "Failed to load assessment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessmentData();
  }, [assessmentId, clientType, toast]);

  // Save assessment data
  const saveAssessment = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setAssessmentData({
        ...assessmentData,
        ...data,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Assessment saved successfully",
      });

      return true;
    } catch (err) {
      console.error("Error saving assessment data:", err);
      setError("Failed to save assessment data");
      toast({
        title: "Error",
        description: "Failed to save assessment data",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete assessment
  const completeAssessment = async (): Promise<boolean> => {
    if (!assessmentData) return false;

    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      const completedData = {
        ...assessmentData,
        status: "completed",
        completedAt: new Date().toISOString(),
      };
      setAssessmentData(completedData);

      // Publish assessment completed event
      eventBus.publishAssessmentCompleted(
        "AssessmentContext",
        assessmentId!,
        assessmentData.beneficiaryId,
        clientType,
        assessmentData.rooms,
        assessmentData.totalCost,
        assessmentData.complianceRate,
      );

      toast({
        title: "Success",
        description: "Assessment completed successfully",
      });

      return true;
    } catch (err) {
      console.error("Error completing assessment:", err);
      setError("Failed to complete assessment");
      toast({
        title: "Error",
        description: "Failed to complete assessment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset assessment
  const resetAssessment = () => {
    setAssessmentId(null);
    setAssessmentData(null);
    setError(null);
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessmentId,
        setAssessmentId,
        assessmentData,
        isLoading,
        error,
        saveAssessment,
        completeAssessment,
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};
