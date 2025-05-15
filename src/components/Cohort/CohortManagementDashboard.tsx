import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Users,
  Calendar,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CohortList from "./CohortList";
import CohortMemberList from "./CohortMemberList";
import CohortForm from "./CohortForm";
import CohortAnalytics from "./CohortAnalytics";
import { cohortApi } from "@/lib/api/cohort/cohortApi";
import { Cohort } from "@/lib/api/cohort/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CohortManagementDashboardProps {
  // Props can be added as needed
}

const CohortManagementDashboard: React.FC<
  CohortManagementDashboardProps
> = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { directionClass } = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("cohorts");
  const [selectedCohortId, setSelectedCohortId] = useState<number | undefined>(
    undefined,
  );
  const [showCohortMembers, setShowCohortMembers] = useState(false);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats for the dashboard
  const [stats, setStats] = useState({
    totalCohorts: 0,
    activeCohorts: 0,
    totalMembers: 0,
    activeMembers: 0,
    upcomingCohorts: 0,
    completedCohorts: 0,
  });

  // Fetch cohorts and update stats
  const fetchCohorts = async (showRefreshingState = true) => {
    if (showRefreshingState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      // Add a small delay to show loading state (remove in production)
      // This is just for demonstration purposes
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await cohortApi.getCohorts({ page: 1, pageSize: 100 });
      if (response.success && response.data) {
        const fetchedCohorts = response.data.items || [];
        setCohorts(fetchedCohorts);

        // Update stats based on fetched data
        const activeCohorts = fetchedCohorts.filter(
          (c) => c.statusId === 1,
        ).length;
        const upcomingCohorts = fetchedCohorts.filter(
          (c) => c.statusId === 2,
        ).length;
        const completedCohorts = fetchedCohorts.filter(
          (c) => c.statusId === 3,
        ).length;

        // Get total members count
        let totalMembers = 0;
        let activeMembers = 0;

        // This would ideally be a separate API call, but for now we'll estimate
        fetchedCohorts.forEach((cohort) => {
          if (cohort.currentMemberCount) {
            totalMembers += cohort.currentMemberCount;
            if (cohort.statusId === 1) {
              activeMembers += cohort.currentMemberCount;
            }
          }
        });

        setStats({
          totalCohorts: fetchedCohorts.length,
          activeCohorts,
          totalMembers,
          activeMembers,
          upcomingCohorts,
          completedCohorts,
        });
      } else {
        setError(
          response.message ||
            t("errors.fetchFailed", "Failed to fetch cohorts"),
        );
      }
    } catch (err) {
      console.error("Error fetching cohorts:", err);
      setError(
        err instanceof Error
          ? `${t("errors.fetchFailed", "Failed to fetch cohorts")}: ${err.message}`
          : t("errors.fetchFailed", "Failed to fetch cohorts"),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCohorts(false);
  }, [t]);

  const handleViewCohort = (cohortId: string) => {
    setSelectedCohortId(parseInt(cohortId));
    setShowCohortMembers(true);
    setActiveTab("members");
  };

  const handleBackToCohorts = () => {
    setShowCohortMembers(false);
    setSelectedCohortId(undefined);
    setActiveTab("cohorts");
  };

  const handleCreateCohort = () => {
    setEditingCohort(undefined);
    setShowCohortForm(true);
  };

  const handleEditCohort = (cohort: any) => {
    setEditingCohort(cohort);
    setShowCohortForm(true);
  };

  const handleCohortFormClose = () => {
    setShowCohortForm(false);
  };

  const handleDeleteCohort = (cohort: Cohort) => {
    setCohortToDelete(cohort);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCohort = async () => {
    if (!cohortToDelete) return;

    setIsDeleting(true);
    try {
      const response = await cohortApi.deleteCohort(cohortToDelete.cohortId);

      if (response.success) {
        toast({
          title: t("cohort.deleteSuccess", "Cohort Deleted"),
          description: t(
            "cohort.deleteSuccessMessage",
            "The cohort has been deleted successfully.",
          ),
        });

        // Refresh cohort list
        fetchCohorts();
      } else {
        toast({
          title: t("cohort.deleteError", "Deletion Failed"),
          description:
            response.message ||
            t("errors.deleteFailed", "Failed to delete cohort"),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting cohort:", err);
      toast({
        title: t("errors.deleteFailed", "Deletion Failed"),
        description: t(
          "errors.unexpectedError",
          "An unexpected error occurred. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setCohortToDelete(null);
    }
  };

  const handleRefresh = () => {
    // Reset any error state
    setError(null);
    // Fetch cohorts with refreshing state
    fetchCohorts(true);

    // Show toast notification
    toast({
      title: t("common.refreshing", "Refreshing Data"),
      description: t(
        "common.refreshingDescription",
        "Fetching the latest cohort data",
      ),
    });
  };

  const handleCohortFormSubmit = async (cohortData: any) => {
    setIsSubmitting(true);
    try {
      if (editingCohort) {
        // Update existing cohort
        const response = await cohortApi.updateCohort(
          editingCohort.cohortId,
          cohortData,
        );

        if (response.success) {
          toast({
            title: t("cohort.updateSuccess", "Cohort Updated"),
            description: t(
              "cohort.updateSuccessMessage",
              "The cohort has been updated successfully.",
            ),
          });

          // Refresh cohort list
          const updatedCohortsResponse = await cohortApi.getCohorts({
            page: 1,
            pageSize: 100,
          });
          if (updatedCohortsResponse.success && updatedCohortsResponse.data) {
            setCohorts(updatedCohortsResponse.data.items || []);
          }
        } else {
          toast({
            title: t("cohort.updateError", "Update Failed"),
            description:
              response.message ||
              t("errors.updateFailed", "Failed to update cohort"),
            variant: "destructive",
          });
        }
      } else {
        // Create new cohort
        const response = await cohortApi.createCohort(cohortData);

        if (response.success) {
          toast({
            title: t("cohort.createSuccess", "Cohort Created"),
            description: t(
              "cohort.createSuccessMessage",
              "The cohort has been created successfully.",
            ),
          });

          // Refresh cohort list
          const updatedCohortsResponse = await cohortApi.getCohorts({
            page: 1,
            pageSize: 100,
          });
          if (updatedCohortsResponse.success && updatedCohortsResponse.data) {
            setCohorts(updatedCohortsResponse.data.items || []);
          }
        } else {
          toast({
            title: t("cohort.createError", "Creation Failed"),
            description:
              response.message ||
              t("errors.createFailed", "Failed to create cohort"),
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Error submitting cohort form:", err);
      toast({
        title: t("errors.submitFailed", "Submission Failed"),
        description: t(
          "errors.unexpectedError",
          "An unexpected error occurred. Please try again.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowCohortForm(false);
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${directionClass}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("cohort.management", "Cohort Management")}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {t("common.refresh", "Refresh")}
          </Button>
          <Button variant="outline">{t("cohort.reports", "Reports")}</Button>
          <Button onClick={handleCreateCohort}>
            <Plus className="mr-2 h-4 w-4" />
            {t("cohort.createCohort", "Create Cohort")}
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.totalCohorts", "Total Cohorts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{stats.totalCohorts}</div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.activeCohorts} {t("cohort.active", "active")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.totalMembers", "Total Members")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{stats.totalMembers}</div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.activeMembers} {t("cohort.active", "active")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.upcomingCohorts", "Upcoming Cohorts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">
                    {stats.upcomingCohorts}
                  </div>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.completedCohorts} {t("cohort.completed", "completed")}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs
        defaultValue="cohorts"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="cohorts">
            {t("cohort.cohorts", "Cohorts")}
          </TabsTrigger>
          <TabsTrigger value="members">
            {t("cohort.members", "Members")}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {t("cohort.analytics", "Analytics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <span className="text-lg font-medium">
                {t("common.loading", "Loading cohorts...")}
              </span>
              <p className="text-muted-foreground mt-2">
                {t("common.pleaseWait", "Please wait while we fetch the data")}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {t("errors.fetchFailed", "Failed to fetch cohorts")}
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                  onClick={() => fetchCohorts(false)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("common.retry", "Retry")}
                </Button>
              </div>
            </div>
          ) : (
            <CohortList
              cohorts={cohorts}
              onViewCohort={handleViewCohort}
              onCreateCohort={handleCreateCohort}
              onEditCohort={handleEditCohort}
              onDeleteCohort={handleDeleteCohort}
            />
          )}
        </TabsContent>

        <TabsContent value="members">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <span className="text-lg font-medium">
                {t("common.loading", "Loading members...")}
              </span>
              <p className="text-muted-foreground mt-2">
                {t("common.pleaseWait", "Please wait while we fetch the data")}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {t("errors.fetchFailed", "Failed to fetch members")}
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                  onClick={() => fetchCohorts(false)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("common.retry", "Retry")}
                </Button>
              </div>
            </div>
          ) : showCohortMembers && selectedCohortId ? (
            <div>
              <Button
                variant="ghost"
                onClick={handleBackToCohorts}
                className="mb-4 flex items-center"
              >
                <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
                {t("cohort.backToCohorts", "Back to Cohorts")}
              </Button>
              <CohortMemberList cohortId={selectedCohortId} />
            </div>
          ) : (
            <CohortMemberList />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <span className="text-lg font-medium">
                {t("common.loading", "Loading analytics...")}
              </span>
              <p className="text-muted-foreground mt-2">
                {t(
                  "common.pleaseWait",
                  "Please wait while we prepare the data",
                )}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {t("errors.fetchFailed", "Failed to fetch analytics data")}
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                  onClick={() => fetchCohorts(false)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("common.retry", "Retry")}
                </Button>
              </div>
            </div>
          ) : selectedCohortId ? (
            <CohortAnalytics cohortId={selectedCohortId} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  {t(
                    "cohort.selectCohortForAnalytics",
                    "Select a cohort to view analytics",
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      {/* Cohort Form Dialog */}
      <CohortForm
        isOpen={showCohortForm}
        onClose={handleCohortFormClose}
        onSubmit={handleCohortFormSubmit}
        cohort={editingCohort}
        isEditing={!!editingCohort}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("cohort.deleteConfirmTitle", "Delete Cohort")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "cohort.deleteConfirmMessage",
                "Are you sure you want to delete this cohort? This action cannot be undone.",
              )}
              {cohortToDelete && (
                <p className="mt-2 font-medium">
                  {cohortToDelete.cohortName} ({cohortToDelete.cohortCode})
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteCohort();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.deleting", "Deleting...")}
                </>
              ) : (
                t("common.delete", "Delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CohortManagementDashboard;
