import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import CaseList from "./CaseList";
import CaseDetail from "./CaseDetail";
import CaseForm from "./CaseForm";
import CaseFilter from "./CaseFilter";
import CaseManagementDashboard from "./CaseManagementDashboard";
import CaseAnalytics from "./CaseAnalytics";
import { caseApi } from "@/lib/api/case/caseApi";
import { Case, CaseFilter as CaseFilterType } from "@/lib/api/case/types";
import eventBus, { EventType } from "@/services/eventBus";

export default function CaseManagementModule() {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeView, setActiveView] = useState<
    "dashboard" | "list" | "detail" | "create" | "edit" | "analytics"
  >("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filter, setFilter] = useState<CaseFilterType>({});
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await caseApi.getCases(filter);
        setCases(result);
      } catch (error) {
        console.error("Error fetching cases:", error);
        setError(t("Failed to fetch cases. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [filter]);

  const handleViewCase = async (caseId: string) => {
    if (caseId === "new") {
      setSelectedCaseId(null);
      setSelectedCase(null);
      setActiveView("create");
      return;
    }

    setSelectedCaseId(caseId);
    setLoading(true);
    setError(null);
    try {
      const caseData = await caseApi.getCaseById(caseId);
      if (caseData) {
        setSelectedCase(caseData);
        setActiveView("detail");
      } else {
        setError(t("Case not found"));
        setActiveView("list");
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
      setError(t("Failed to fetch case details. Please try again."));
      setActiveView("list");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = () => {
    setActiveView("create");
  };

  const handleEditCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setLoading(true);
    setError(null);
    try {
      if (!selectedCase || selectedCaseId !== caseId) {
        const caseData = await caseApi.getCaseById(caseId);
        if (caseData) {
          setSelectedCase(caseData);
          setActiveView("edit");
        } else {
          setError(t("Case not found"));
          setActiveView("list");
        }
      } else {
        setActiveView("edit");
      }
    } catch (error) {
      console.error("Error fetching case details for editing:", error);
      setError(
        t("Failed to fetch case details for editing. Please try again."),
      );
      setActiveView("list");
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSubmit = async (caseData: Partial<Case>) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (activeView === "create") {
        result = await caseApi.createCase(caseData as any);
        // Publish case created event
        eventBus.publish({
          id: `case_created_${Date.now()}`,
          type: EventType.CASE_CREATED,
          timestamp: new Date().toISOString(),
          source: "CaseManagementModule",
          payload: result,
        });
      } else if (activeView === "edit" && selectedCaseId) {
        result = await caseApi.updateCase(selectedCaseId, caseData);
        // Publish case updated event
        eventBus.publish({
          id: `case_updated_${Date.now()}`,
          type: EventType.CASE_UPDATED,
          timestamp: new Date().toISOString(),
          source: "CaseManagementModule",
          payload: result,
        });

        // If status changed, publish status changed event
        if (selectedCase && selectedCase.status !== result?.status) {
          eventBus.publish({
            id: `case_status_${Date.now()}`,
            type: EventType.CASE_STATUS_CHANGED,
            timestamp: new Date().toISOString(),
            source: "CaseManagementModule",
            payload: {
              caseId: result?.id,
              previousStatus: selectedCase.status,
              newStatus: result?.status,
              caseNumber: result?.caseNumber,
              beneficiaryId: result?.beneficiaryId,
            },
          });
        }
      }
      // Refresh the case list
      const cases = await caseApi.getCases(filter);
      setCases(cases);
      setActiveView("list");
    } catch (error) {
      console.error("Error saving case:", error);
      setError(t("Failed to save case. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: CaseFilterType) => {
    setFilter(newFilter);
  };

  const handleFilterReset = () => {
    setFilter({});
  };

  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm(t("Are you sure you want to delete this case?"))) {
      setLoading(true);
      setError(null);
      try {
        // Get case details before deletion for the event
        const caseToDelete =
          selectedCaseId === caseId
            ? selectedCase
            : await caseApi.getCaseById(caseId);

        await caseApi.deleteCase(caseId);

        // Publish case deleted event
        if (caseToDelete) {
          eventBus.publish({
            id: `case_deleted_${Date.now()}`,
            type: EventType.CASE_UPDATED, // Using UPDATED with a deleted flag is more consistent
            timestamp: new Date().toISOString(),
            source: "CaseManagementModule",
            payload: {
              ...caseToDelete,
              deleted: true,
            },
            metadata: {
              action: "delete",
            },
          });
        }

        // Refresh the case list
        const result = await caseApi.getCases(filter);
        setCases(result);
        if (selectedCaseId === caseId) {
          setSelectedCaseId(null);
          setSelectedCase(null);
          setActiveView("list");
        }
      } catch (error) {
        console.error("Error deleting case:", error);
        setError(t("Failed to delete case. Please try again."));
      } finally {
        setLoading(false);
      }
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div>
            <CaseManagementDashboard />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveView("list")}>
                {t("View All Cases")}
              </Button>
            </div>
          </div>
        );

      case "list":
        return (
          <div>
            <CaseFilter
              onFilter={handleFilterChange}
              onReset={handleFilterReset}
            />
            <div className="mt-4">
              <CaseList
                onViewCase={handleViewCase}
                onEditCase={handleEditCase}
                onDeleteCase={handleDeleteCase}
              />
            </div>
          </div>
        );

      case "detail":
        return (
          <div>
            {selectedCaseId && <CaseDetail caseId={selectedCaseId} />}
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveView("list")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back to List")}
              </Button>
              {selectedCaseId && (
                <Button onClick={() => handleEditCase(selectedCaseId)}>
                  {t("Edit Case")}
                </Button>
              )}
            </div>
          </div>
        );

      case "create":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("Create New Case")}
            </h2>
            <CaseForm
              onSubmit={handleCaseSubmit}
              onCancel={() => setActiveView("list")}
            />
          </div>
        );

      case "edit":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("Edit Case")} {selectedCase?.caseNumber}
            </h2>
            <CaseForm
              initialData={selectedCase || undefined}
              onSubmit={handleCaseSubmit}
              onCancel={() =>
                selectedCaseId ? setActiveView("detail") : setActiveView("list")
              }
            />
          </div>
        );

      case "analytics":
        return (
          <div>
            <CaseAnalytics />
            <div className="flex justify-start mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveView("dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back to Dashboard")}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 p-4" dir={dir}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("Case Management")}</h1>
        <div className="flex space-x-2">
          {activeView !== "create" && activeView !== "edit" && (
            <Button onClick={handleCreateCase}>
              <Plus className="mr-2 h-4 w-4" />
              {t("New Case")}
            </Button>
          )}
          {activeView !== "analytics" && (
            <Button
              variant="outline"
              onClick={() => setActiveView("analytics")}
            >
              {t("View Analytics")}
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeView === "analytics" ? "analytics" : "cases"}
        className="w-full"
        onValueChange={(value) => {
          if (value === "dashboard") setActiveView("dashboard");
          else if (value === "cases") setActiveView("list");
          else if (value === "analytics") setActiveView("analytics");
        }}
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
          <TabsTrigger value="cases">{t("Cases")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("Analytics")}</TabsTrigger>
        </TabsList>

        <div className="bg-white p-4 rounded-lg shadow">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </Tabs>
    </div>
  );
}
