import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField, DatePicker } from "@/components/ui/form-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  MapPin,
  User,
  MoreVertical,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cohortApi } from "@/lib/api/cohort/cohortApi";
import { Cohort, CohortType } from "@/lib/api/cohort/types";

// Map cohort status IDs to status strings
const statusMap: Record<number, string> = {
  1: "active",
  2: "upcoming",
  3: "completed",
  4: "cancelled",
};

// Map cohort type IDs to type strings
const typeMap: Record<number, string> = {
  1: "Wellness",
  2: "Education",
  3: "Workshop",
  4: "Social",
};

// Location mapping
const locationMap: Record<number, string> = {
  1: "Abu Dhabi Community Center",
  2: "Dubai Senior Center",
  3: "Sharjah Community Hall",
  4: "Ajman Cultural Center",
};

// Coordinator mapping
const coordinatorMap: Record<number, string> = {
  1: "Ahmed Al Mansouri",
  2: "Fatima Al Zahra",
  3: "Omar Khalid",
  4: "Layla Mohammed",
};

// Transform API cohort to UI cohort
const transformCohort = (cohort: Cohort) => {
  return {
    id: cohort.cohortId.toString(),
    code: cohort.cohortCode,
    name: cohort.cohortName,
    type: typeMap[cohort.cohortTypeId] || "Unknown",
    status: statusMap[cohort.statusId] || "unknown",
    startDate: new Date(cohort.startDate),
    endDate: cohort.endDate ? new Date(cohort.endDate) : undefined,
    location: cohort.locationId
      ? locationMap[cohort.locationId] || "Unknown"
      : "Not specified",
    coordinator: cohort.coordinatorId
      ? coordinatorMap[cohort.coordinatorId] || "Unknown"
      : "Not assigned",
    capacity: cohort.maxCapacity,
    currentMembers: cohort.currentMemberCount,
    description: cohort.description || "",
  };
};

interface CohortListProps {
  cohorts?: any[];
  onViewCohort?: (cohortId: string) => void;
  onCreateCohort?: () => void;
  onEditCohort?: (cohort: any) => void;
  onDeleteCohort?: (cohort: any) => void;
}

const CohortList: React.FC<CohortListProps> = ({
  cohorts: propCohorts,
  onViewCohort = () => {},
  onCreateCohort = () => {},
  onEditCohort = () => {},
  onDeleteCohort = () => {},
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [filteredCohorts, setFilteredCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortTypes, setCohortTypes] = useState<CohortType[]>([]);

  // Fetch cohort types and use cohorts from props if available
  useEffect(() => {
    const fetchCohortTypes = async () => {
      try {
        // Fetch cohort types
        const typesResponse = await cohortApi.getCohortTypes({
          page: 1,
          pageSize: 100,
        });
        if (typesResponse.success && typesResponse.data) {
          setCohortTypes(typesResponse.data.items || []);
        }
      } catch (err) {
        console.error("Error fetching cohort types:", err);
      }
    };

    fetchCohortTypes();
  }, []);

  // Fetch cohorts from API if not provided via props
  useEffect(() => {
    if (propCohorts) {
      // Use cohorts from props
      const transformedCohorts = propCohorts.map(transformCohort);
      setCohorts(transformedCohorts);
      setFilteredCohorts(transformedCohorts);
      setLoading(false);
    } else {
      // Fetch cohorts from API
      const fetchCohorts = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await cohortApi.getCohorts({
            page: 1,
            pageSize: 100,
          });
          if (response.success && response.data) {
            const transformedCohorts = (response.data.items || []).map(
              transformCohort,
            );
            setCohorts(transformedCohorts);
            setFilteredCohorts(transformedCohorts);
          } else {
            setError(
              response.message ||
                t("errors.fetchFailed", "Failed to fetch cohorts"),
            );
          }
        } catch (err) {
          console.error("Error fetching cohorts:", err);
          setError(t("errors.fetchFailed", "Failed to fetch cohorts"));
        } finally {
          setLoading(false);
        }
      };

      fetchCohorts();
    }
  }, [propCohorts, t]);

  // Filter cohorts based on search, type, status, and active tab
  useEffect(() => {
    let result = cohorts;

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (cohort) =>
          cohort.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cohort.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cohort.location.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by type
    if (selectedType) {
      result = result.filter((cohort) => cohort.type === selectedType);
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter((cohort) => cohort.status === selectedStatus);
    }

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((cohort) => cohort.status === activeTab);
    }

    setFilteredCohorts(result);
  }, [searchQuery, selectedType, selectedStatus, activeTab, cohorts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "upcoming":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const calculateCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${directionClass}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("cohort.cohortList")}</h1>
        <Button onClick={onCreateCohort}>
          <Plus className="mr-2 h-4 w-4" />
          {t("cohort.createCohort")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.totalCohorts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohorts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.activeCohorts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.totalParticipants")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.reduce((sum, c) => sum + c.currentMembers, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("cohort.upcomingCohorts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c) => c.status === "upcoming").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("cohort.searchCohorts")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SelectField
            label=""
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { value: "", label: t("cohort.allTypes") },
              { value: "Wellness", label: t("cohort.types.wellness") },
              { value: "Education", label: t("cohort.types.education") },
              { value: "Workshop", label: t("cohort.types.workshop") },
              { value: "Social", label: t("cohort.types.social") },
            ]}
            placeholder={t("cohort.type")}
          />
          <SelectField
            label=""
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "", label: t("cohort.allStatuses") },
              { value: "active", label: t("cohort.statuses.active") },
              { value: "completed", label: t("cohort.statuses.completed") },
              { value: "upcoming", label: t("cohort.statuses.upcoming") },
              { value: "cancelled", label: t("cohort.statuses.cancelled") },
            ]}
            placeholder={t("cohort.status")}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedType("");
              setSelectedStatus("");
            }}
          >
            {t("common.buttons.reset")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("cohort.allCohorts")}</TabsTrigger>
          <TabsTrigger value="active">
            {t("cohort.statuses.active")}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            {t("cohort.statuses.upcoming")}
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t("cohort.statuses.completed")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t("common.loading", "Loading...")}</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                {t("common.retry", "Retry")}
              </Button>
            </div>
          ) : filteredCohorts.length > 0 ? (
            filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onViewCohort={onViewCohort}
                onEditCohort={onEditCohort}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("cohort.noCohorts", "No cohorts found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t("common.loading", "Loading...")}</span>
            </div>
          ) : filteredCohorts.length > 0 ? (
            filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onViewCohort={onViewCohort}
                onEditCohort={onEditCohort}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("cohort.noActiveCohorts", "No active cohorts found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t("common.loading", "Loading...")}</span>
            </div>
          ) : filteredCohorts.length > 0 ? (
            filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onViewCohort={onViewCohort}
                onEditCohort={onEditCohort}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("cohort.noUpcomingCohorts", "No upcoming cohorts found")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t("common.loading", "Loading...")}</span>
            </div>
          ) : filteredCohorts.length > 0 ? (
            filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onViewCohort={onViewCohort}
                onEditCohort={onEditCohort}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("cohort.noCompletedCohorts", "No completed cohorts found")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CohortCardProps {
  cohort: {
    id: string;
    code: string;
    name: string;
    type: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    location: string;
    coordinator: string;
    capacity: number;
    currentMembers: number;
    description: string;
  };
  onViewCohort: (cohortId: string) => void;
  onEditCohort: (cohort: any) => void;
}

const CohortCard: React.FC<CohortCardProps> = ({
  cohort,
  onViewCohort,
  onEditCohort,
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "upcoming":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const capacityPercentage = Math.round(
    (cohort.currentMembers / cohort.capacity) * 100,
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{cohort.name}</h3>
                <Badge className={getStatusColor(cohort.status)}>
                  {t(`cohort.statuses.${cohort.status}`)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{cohort.code}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewCohort(cohort.id)}>
                  {t("cohort.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditCohort(cohort)}>
                  {t("cohort.editCohort")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {t("cohort.manageMembership")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDeleteCohort(cohort)}
                >
                  {t("cohort.deleteCohort", "Delete Cohort")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.dateRange")}:
                </span>
                <span>
                  {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.location")}:
                </span>
                <span>{cohort.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.coordinator")}:
                </span>
                <span>{cohort.coordinator}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("cohort.capacity")}:
                </span>
                <span>
                  {cohort.currentMembers} / {cohort.capacity}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>{t("cohort.capacityFilled")}:</span>
                  <span>{capacityPercentage}%</span>
                </div>
                <Progress value={capacityPercentage} />
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {t("cohort.type")}:
                </span>
                <span>{t(`cohort.types.${cohort.type.toLowerCase()}`)}</span>
              </div>
            </div>
          </div>

          {cohort.description && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {cohort.description}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => onViewCohort(cohort.id)}
              className="flex items-center"
            >
              {t("cohort.viewDetails")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortList;
