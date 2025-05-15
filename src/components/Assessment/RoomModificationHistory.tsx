import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  FileText,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  Check,
} from "lucide-react";

interface ModificationEntry {
  id: string;
  roomId: string;
  roomName: string;
  timestamp: string;
  user: string;
  changeType: "measurement" | "recommendation" | "photo" | "status";
  description: string;
  details: {
    before?: any;
    after?: any;
  };
}

interface RoomModificationHistoryProps {
  roomId: string;
  roomName: string;
  modifications?: ModificationEntry[];
}

const RoomModificationHistory: React.FC<RoomModificationHistoryProps> = ({
  roomId,
  roomName,
  modifications = [],
}) => {
  const { t } = useTranslation();
  const [selectedModification, setSelectedModification] =
    useState<ModificationEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const [isRevertSuccessDialogOpen, setIsRevertSuccessDialogOpen] =
    useState(false);
  const [filteredModifications, setFilteredModifications] =
    useState<ModificationEntry[]>(modifications);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>(
    {},
  );

  // Apply filters and search
  useEffect(() => {
    let result = [...modifications];

    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (mod) =>
          mod.description.toLowerCase().includes(lowerSearchTerm) ||
          mod.user.toLowerCase().includes(lowerSearchTerm),
      );
    }

    // Apply change type filter
    if (filterType) {
      result = result.filter((mod) => mod.changeType === filterType);
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter((mod) => new Date(mod.timestamp) >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter((mod) => new Date(mod.timestamp) <= endDate);
    }

    setFilteredModifications(result);
  }, [modifications, searchTerm, filterType, dateRange]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get change type badge
  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case "measurement":
        return <Badge className="bg-blue-500">{t("Measurement")}</Badge>;
      case "recommendation":
        return <Badge className="bg-purple-500">{t("Recommendation")}</Badge>;
      case "photo":
        return <Badge className="bg-green-500">{t("Photo")}</Badge>;
      case "status":
        return <Badge className="bg-amber-500">{t("Status")}</Badge>;
      default:
        return <Badge>{t("Other")}</Badge>;
    }
  };

  // View modification details
  const handleViewDetails = (modification: ModificationEntry) => {
    setSelectedModification(modification);
    setIsDialogOpen(true);
  };

  // Handle revert change
  const handleRevertChange = (modification: ModificationEntry) => {
    setSelectedModification(modification);
    setIsRevertDialogOpen(true);
  };

  // Execute revert change
  const executeRevertChange = () => {
    // In a real implementation, this would call an API to revert the change
    // For now, we'll just show a success dialog
    setIsRevertDialogOpen(false);
    setIsRevertSuccessDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType(null);
    setDateRange({});
  };

  // Render modification details based on type
  const renderModificationDetails = (modification: ModificationEntry) => {
    switch (modification.changeType) {
      case "measurement":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">{t("Before")}</h4>
                {modification.details.before ? (
                  <div>
                    <p>
                      <span className="font-medium">{t("Value")}:</span>{" "}
                      {modification.details.before.value}{" "}
                      {modification.details.before.unit}
                    </p>
                    <p>
                      <span className="font-medium">{t("Compliant")}:</span>{" "}
                      {modification.details.before.isCompliant
                        ? t("Yes")
                        : t("No")}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {t("No previous value")}
                  </p>
                )}
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">{t("After")}</h4>
                {modification.details.after ? (
                  <div>
                    <p>
                      <span className="font-medium">{t("Value")}:</span>{" "}
                      {modification.details.after.value}{" "}
                      {modification.details.after.unit}
                    </p>
                    <p>
                      <span className="font-medium">{t("Compliant")}:</span>{" "}
                      {modification.details.after.isCompliant
                        ? t("Yes")
                        : t("No")}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("No new value")}</p>
                )}
              </div>
            </div>
          </div>
        );
      case "recommendation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">{t("Before")}</h4>
                {modification.details.before ? (
                  <div>
                    <p>
                      <span className="font-medium">{t("Selected")}:</span>{" "}
                      {modification.details.before.selected
                        ? t("Yes")
                        : t("No")}
                    </p>
                    <p>
                      <span className="font-medium">{t("Priority")}:</span>{" "}
                      {modification.details.before.priority}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {t("No previous value")}
                  </p>
                )}
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">{t("After")}</h4>
                {modification.details.after ? (
                  <div>
                    <p>
                      <span className="font-medium">{t("Selected")}:</span>{" "}
                      {modification.details.after.selected ? t("Yes") : t("No")}
                    </p>
                    <p>
                      <span className="font-medium">{t("Priority")}:</span>{" "}
                      {modification.details.after.priority}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("No new value")}</p>
                )}
              </div>
            </div>
          </div>
        );
      case "status":
        return (
          <div className="p-4 bg-muted rounded-md">
            <p>
              <span className="font-medium">{t("Status Changed")}:</span>{" "}
              {modification.details.before?.status || t("Not Started")}{" "}
              <ArrowRight className="inline h-4 w-4 mx-2" />{" "}
              {modification.details.after?.status || t("Completed")}
            </p>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-muted rounded-md">
            <p>{modification.description}</p>
          </div>
        );
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {t("Modification History")}: {roomName}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={
                  !searchTerm &&
                  !filterType &&
                  !dateRange.start &&
                  !dateRange.end
                }
              >
                {t("Clear Filters")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search by description or user")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filterType || ""}
                  onValueChange={(value) => setFilterType(value || null)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("Filter by type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("All Types")}</SelectItem>
                    <SelectItem value="measurement">
                      {t("Measurement")}
                    </SelectItem>
                    <SelectItem value="recommendation">
                      {t("Recommendation")}
                    </SelectItem>
                    <SelectItem value="photo">{t("Photo")}</SelectItem>
                    <SelectItem value="status">{t("Status")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="startDate">{t("Start Date")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start || ""}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate">{t("End Date")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end || ""}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {filteredModifications.length} {t("results found")}
            </div>

            {filteredModifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {modifications.length === 0
                  ? t("No modification history available for this room.")
                  : t("No results match your search criteria.")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Date & Time")}</TableHead>
                    <TableHead>{t("User")}</TableHead>
                    <TableHead>{t("Change Type")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModifications.map((modification) => (
                    <TableRow key={modification.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(modification.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {modification.user}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getChangeTypeBadge(modification.changeType)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {modification.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(modification)}
                          >
                            {t("View Details")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevertChange(modification)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t("Revert")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Modification Details")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedModification && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(selectedModification.timestamp)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{selectedModification.user}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{t("Change Type")}:</h3>
                  <div className="mt-1">
                    {getChangeTypeBadge(selectedModification.changeType)}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{t("Description")}:</h3>
                  <p className="mt-1">{selectedModification.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">{t("Details")}:</h3>
                  <div className="mt-2">
                    {renderModificationDetails(selectedModification)}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleRevertChange(selectedModification!)}
              disabled={!selectedModification}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("Revert This Change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <Dialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Confirm Reversion")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="font-medium">{t("Warning")}</p>
            </div>
            <p>
              {t("Are you sure you want to revert this change")}?
              {selectedModification && (
                <span className="block mt-2 font-medium">
                  "{selectedModification.description}"
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "This action will restore the previous state and cannot be undone.",
              )}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRevertDialogOpen(false)}
            >
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={executeRevertChange}>
              {t("Revert Change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revert Success Dialog */}
      <Dialog
        open={isRevertSuccessDialogOpen}
        onOpenChange={setIsRevertSuccessDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Change Reverted")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center text-green-500 mb-4">
            <Check className="h-5 w-5 mr-2" />
            <p className="font-medium">{t("Success")}</p>
          </div>
          <p>
            {t(
              "The change has been successfully reverted to its previous state.",
            )}
          </p>
          <DialogFooter>
            <Button onClick={() => setIsRevertSuccessDialogOpen(false)}>
              {t("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomModificationHistory;
