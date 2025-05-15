import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProgramManagementDashboard from "./ProgramManagementDashboard";
import ProgramList from "./ProgramList";
import ProgramDetail from "./ProgramDetail";
import ProgramForm from "./ProgramForm";
import { Program } from "@/lib/api/program/types";
import { programApi } from "@/lib/api/program/programApi";
import eventBus, { EventType } from "@/services/eventBus";

type ProgramModuleView = "dashboard" | "list" | "detail" | "create" | "edit";

export default function ProgramManagementModule() {
  const { t } = useTranslation();
  const [view, setView] = useState<ProgramModuleView>("dashboard");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewDashboard = () => {
    setView("dashboard");
    setSelectedProgramId(null);
    setProgramToEdit(null);
  };

  const handleViewPrograms = () => {
    setView("list");
    setSelectedProgramId(null);
    setProgramToEdit(null);
  };

  const handleViewProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setView("detail");
  };

  const handleCreateProgram = () => {
    setProgramToEdit(null);
    setView("create");
  };

  const handleEditProgram = async (programId: string) => {
    setLoading(true);
    setError(null);
    try {
      const program = await programApi.getProgramById(programId);
      if (program) {
        setProgramToEdit(program);
        setView("edit");
      }
    } catch (error) {
      console.error("Error fetching program for edit:", error);
      setError(t("Failed to fetch program details. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleProgramSubmit = async (programData: Program) => {
    setLoading(true);
    setError(null);
    try {
      if (view === "create") {
        const newProgram = await programApi.createProgram(programData);
        setSelectedProgramId(newProgram.id);
        setView("detail");

        // Publish program created event
        eventBus.publish({
          id: `program_created_${Date.now()}`,
          type: EventType.PROGRAM_CREATED,
          timestamp: new Date().toISOString(),
          source: "ProgramManagementModule",
          payload: newProgram,
        });
      } else if (view === "edit" && programToEdit) {
        const updatedProgram = await programApi.updateProgram(
          programToEdit.id,
          programData,
        );
        if (updatedProgram) {
          setSelectedProgramId(updatedProgram.id);
          setView("detail");

          // Publish program updated event
          eventBus.publish({
            id: `program_updated_${Date.now()}`,
            type: EventType.PROGRAM_UPDATED,
            timestamp: new Date().toISOString(),
            source: "ProgramManagementModule",
            payload: updatedProgram,
          });

          // Check if program status changed to completed
          if (
            programToEdit.status !== "completed" &&
            updatedProgram.status === "completed"
          ) {
            // Publish program completed event
            eventBus.publish({
              id: `program_completed_${Date.now()}`,
              type: EventType.PROGRAM_COMPLETED,
              timestamp: new Date().toISOString(),
              source: "ProgramManagementModule",
              payload: {
                programId: updatedProgram.id,
                programName: updatedProgram.name,
                completionDate: new Date().toISOString(),
                budget: updatedProgram.budget,
                spentBudget: updatedProgram.spentBudget,
                remainingBudget: updatedProgram.remainingBudget,
                projects: updatedProgram.projects,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error saving program:", error);
      setError(t("Failed to save program. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    if (selectedProgramId) {
      setView("detail");
    } else {
      setView("list");
    }
    setProgramToEdit(null);
  };

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {view === "dashboard" && (
            <ProgramManagementDashboard
              onViewPrograms={handleViewPrograms}
              onCreateProgram={handleCreateProgram}
            />
          )}

          {view === "list" && (
            <ProgramList
              onViewDashboard={handleViewDashboard}
              onViewProgram={handleViewProgram}
              onCreateProgram={handleCreateProgram}
            />
          )}

          {view === "detail" && selectedProgramId && (
            <ProgramDetail
              programId={selectedProgramId}
              onBack={handleViewPrograms}
            />
          )}

          {(view === "create" || view === "edit") && (
            <ProgramForm
              program={programToEdit}
              onSubmit={handleProgramSubmit}
              onCancel={handleCancelForm}
            />
          )}
        </>
      )}
    </div>
  );
}
