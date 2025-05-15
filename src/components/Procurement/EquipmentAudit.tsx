import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
  Clipboard,
  ClipboardCheck,
  Loader2,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import {
  Equipment,
  EquipmentAudit as EquipmentAuditType,
} from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const EquipmentAudit: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [audits, setAudits] = useState<EquipmentAuditType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [auditForm, setAuditForm] = useState({
    location: "",
    condition: "good",
    notes: "",
    discrepancies: "",
  });

  useEffect(() => {
    fetchEquipment();
    fetchAudits();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await procurementApi.getInventoryItems({
        page: 1,
        pageSize: 50,
        sortBy: "name",
        sortDirection: "asc",
        isEquipment: true,
      });

      if (response.success && response.data) {
        setEquipment(response.data.items as Equipment[]);
      } else {
        // Mock data for development
        const mockEquipment: Equipment[] = [
          {
            id: "equip-001",
            itemCode: "PL-001",
            name: "Patient Lift",
            description: "Electric patient lift for safe transfers",
            categoryId: "cat-003",
            quantity: 1,
            unit: "each",
            unitCost: 3500,
            totalValue: 3500,
            location: "Warehouse C, Section A",
            minimumStockLevel: 1,
            reorderPoint: 1,
            lastRestockDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: "available",
            isEquipment: true,
            serialNumber: "PL-2023-001",
            model: "PowerLift 5000",
            manufacturer: "MedEquip",
            purchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            warrantyExpiryDate: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            ),
            currentStatus: "available",
            lastMaintenanceDate: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ),
            nextMaintenanceDate: new Date(
              Date.now() + 60 * 24 * 60 * 60 * 1000,
            ),
            depreciationValue: 3000,
            depreciationRate: 10,
            expectedLifespan: 60,
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            id: "equip-002",
            itemCode: "WC-001",
            name: "Wheelchair",
            description: "Standard wheelchair for patient mobility",
            categoryId: "cat-003",
            quantity: 1,
            unit: "each",
            unitCost: 800,
            totalValue: 800,
            location: "Warehouse C, Section B",
            minimumStockLevel: 2,
            reorderPoint: 3,
            lastRestockDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            status: "available",
            isEquipment: true,
            serialNumber: "WC-2023-001",
            model: "MobilityPlus",
            manufacturer: "CareMobility",
            purchaseDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
            warrantyExpiryDate: new Date(
              Date.now() + 180 * 24 * 60 * 60 * 1000,
            ),
            currentStatus: "in_use",
            assignedTo: "Patient ID: 12345",
            lastMaintenanceDate: new Date(
              Date.now() - 45 * 24 * 60 * 60 * 1000,
            ),
            nextMaintenanceDate: new Date(
              Date.now() + 45 * 24 * 60 * 60 * 1000,
            ),
            depreciationValue: 600,
            depreciationRate: 15,
            expectedLifespan: 48,
            createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          },
          {
            id: "equip-003",
            itemCode: "HB-001",
            name: "Hospital Bed",
            description: "Adjustable hospital bed for home care",
            categoryId: "cat-003",
            quantity: 1,
            unit: "each",
            unitCost: 2200,
            totalValue: 2200,
            location: "Warehouse B, Section D",
            minimumStockLevel: 1,
            reorderPoint: 2,
            lastRestockDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            status: "available",
            isEquipment: true,
            serialNumber: "HB-2023-001",
            model: "ComfortCare 3000",
            manufacturer: "MedBeds",
            purchaseDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
            warrantyExpiryDate: new Date(
              Date.now() + 125 * 24 * 60 * 60 * 1000,
            ),
            currentStatus: "maintenance",
            lastMaintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            nextMaintenanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            depreciationValue: 1800,
            depreciationRate: 12,
            expectedLifespan: 72,
            createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        ];
        setEquipment(mockEquipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      // In a real app, this would call an API
      // Mock data for development
      const mockAudits: EquipmentAuditType[] = [
        {
          id: "audit-001",
          equipmentId: "equip-001",
          auditDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          auditedBy: "John Smith",
          location: "Warehouse C, Section A",
          condition: "excellent",
          notes:
            "Equipment in excellent condition, all functions working properly",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "audit-002",
          equipmentId: "equip-002",
          auditDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          auditedBy: "Sarah Johnson",
          location: "Patient Home - 123 Main St",
          condition: "good",
          notes: "Wheelchair in good condition, minor wear on wheels",
          discrepancies: "Location different from recorded location",
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
        {
          id: "audit-003",
          equipmentId: "equip-003",
          auditDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          auditedBy: "Michael Brown",
          location: "Maintenance Shop",
          condition: "fair",
          notes: "Hospital bed being repaired, motor issues",
          discrepancies: "Needs new motor parts",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      ];
      setAudits(mockAudits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      toast({
        title: "Error",
        description: "Failed to load audit history",
        variant: "destructive",
      });
    }
  };

  const handleAudit = (item: Equipment) => {
    setSelectedEquipment(item);
    setAuditForm({
      ...auditForm,
      location: item.location,
    });
    setShowAuditDialog(true);
  };

  const submitAudit = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    const newAudit: EquipmentAuditType = {
      id: `audit-${Date.now()}`,
      equipmentId: selectedEquipment.id,
      auditDate: new Date(),
      auditedBy: "Current User", // In a real app, this would be the logged-in user
      location: auditForm.location,
      condition: auditForm.condition as "excellent" | "good" | "fair" | "poor",
      notes: auditForm.notes,
      discrepancies: auditForm.discrepancies || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAudits([newAudit, ...audits]);

    toast({
      title: "Audit Completed",
      description: `Audit for ${selectedEquipment.name} has been recorded`,
    });

    setShowAuditDialog(false);
    setAuditForm({
      location: "",
      condition: "good",
      notes: "",
      discrepancies: "",
    });
  };

  const getConditionBadgeVariant = (
    condition: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (condition) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      case "fair":
        return "outline";
      case "poor":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredEquipment = equipment.filter((item) =>
    searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  const getEquipmentName = (equipmentId: string): string => {
    const item = equipment.find((e) => e.id === equipmentId);
    return item ? item.name : "Unknown Equipment";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(
              "procurement.searchEquipment",
              "Search equipment...",
            )}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t("procurement.filter", "Filter")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("procurement.exportAudit", "Export Audit")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.totalEquipment", "Total Equipment")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.auditedLast30Days", "Audited (Last 30 Days)")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                audits.filter(
                  (a) =>
                    new Date(a.auditDate).getTime() >
                    Date.now() - 30 * 24 * 60 * 60 * 1000,
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.discrepanciesFound", "Discrepancies Found")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter((a) => a.discrepancies).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("procurement.equipmentList", "Equipment List")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">
                  {t("common.loading", "Loading...")}
                </span>
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  {t("procurement.noEquipmentFound", "No equipment found")}
                </p>
              </div>
            ) : (
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("procurement.itemCode", "Item Code")}
                      </TableHead>
                      <TableHead>{t("procurement.name", "Name")}</TableHead>
                      <TableHead>
                        {t("procurement.serialNumber", "Serial Number")}
                      </TableHead>
                      <TableHead>
                        {t("procurement.location", "Location")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("common.actions", "Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemCode}</TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.serialNumber}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAudit(item)}
                          >
                            <Clipboard className="h-4 w-4 mr-2" />
                            {t("procurement.audit", "Audit")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Audits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {t("procurement.recentAudits", "Recent Audits")}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("procurement.newAudit", "New Audit")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {audits.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">
                  {t("procurement.noAuditsFound", "No audits found")}
                </p>
              </div>
            ) : (
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("procurement.date", "Date")}</TableHead>
                      <TableHead>
                        {t("procurement.equipment", "Equipment")}
                      </TableHead>
                      <TableHead>
                        {t("procurement.auditedBy", "Audited By")}
                      </TableHead>
                      <TableHead>
                        {t("procurement.condition", "Condition")}
                      </TableHead>
                      <TableHead>
                        {t("procurement.discrepancies", "Discrepancies")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>
                          {format(new Date(audit.auditDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getEquipmentName(audit.equipmentId)}
                        </TableCell>
                        <TableCell>{audit.auditedBy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getConditionBadgeVariant(audit.condition)}
                          >
                            {audit.condition.charAt(0).toUpperCase() +
                              audit.condition.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {audit.discrepancies ? (
                            <Badge variant="destructive">
                              {t("procurement.yes", "Yes")}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {t("procurement.no", "No")}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.auditEquipment", "Audit Equipment")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && (
              <div className="mb-4">
                <h4 className="font-medium">{selectedEquipment.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEquipment.serialNumber} | {selectedEquipment.model}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  {t("procurement.currentLocation", "Current Location")}
                </Label>
                <Input
                  id="location"
                  value={auditForm.location}
                  onChange={(e) =>
                    setAuditForm({
                      ...auditForm,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">
                  {t("procurement.condition", "Condition")}
                </Label>
                <Select
                  value={auditForm.condition}
                  onValueChange={(value) =>
                    setAuditForm({
                      ...auditForm,
                      condition: value,
                    })
                  }
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">
                      {t("procurement.excellent", "Excellent")}
                    </SelectItem>
                    <SelectItem value="good">
                      {t("procurement.good", "Good")}
                    </SelectItem>
                    <SelectItem value="fair">
                      {t("procurement.fair", "Fair")}
                    </SelectItem>
                    <SelectItem value="poor">
                      {t("procurement.poor", "Poor")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes", "Notes")}</Label>
                <Textarea
                  id="notes"
                  value={auditForm.notes}
                  onChange={(e) =>
                    setAuditForm({ ...auditForm, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discrepancies">
                  {t("procurement.discrepancies", "Discrepancies")}
                </Label>
                <Textarea
                  id="discrepancies"
                  value={auditForm.discrepancies}
                  onChange={(e) =>
                    setAuditForm({
                      ...auditForm,
                      discrepancies: e.target.value,
                    })
                  }
                  placeholder={t(
                    "procurement.discrepanciesPlaceholder",
                    "Enter any discrepancies found (leave blank if none)",
                  )}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitAudit}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {t("procurement.completeAudit", "Complete Audit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentAudit;
