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
  Edit,
  History,
  Loader2,
  Search,
  AlertTriangle,
  Wrench,
  Calendar,
  UserCheck,
  MapPin,
  DollarSign,
  Barcode,
  QrCode,
  ClipboardCheck,
} from "lucide-react";
import {
  Equipment,
  InventoryItem,
  MaintenanceSchedule,
  EquipmentCheckout,
  EquipmentAudit,
} from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";
import BarcodeScanner from "../ui/barcode-scanner";
import QrScanner from "../ui/qr-scanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";

const EquipmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showDepreciationDialog, setShowDepreciationDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [selectedCheckout, setSelectedCheckout] =
    useState<EquipmentCheckout | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    checkedOutBy: "",
    checkedOutTo: "",
    expectedReturnDate: "",
    notes: "",
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: "routine",
    scheduledDate: "",
    assignedTechnician: "",
    notes: "",
  });

  const [locationForm, setLocationForm] = useState({
    location: "",
  });

  const [depreciationForm, setDepreciationForm] = useState({
    depreciationValue: 0,
    depreciationRate: 0,
  });

  const [auditForm, setAuditForm] = useState({
    condition: "good",
    location: "",
    notes: "",
    discrepancies: "",
  });

  const [checkInForm, setCheckInForm] = useState({
    condition: "good",
    notes: "",
  });

  const [scannedCode, setScannedCode] = useState("");

  useEffect(() => {
    fetchEquipment();
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

  const handleEdit = (item: Equipment) => {
    // Logic to edit equipment
    toast({
      title: "Edit Equipment",
      description: `Editing equipment ${item.name}`,
    });
  };

  const handleViewTransactions = (item: Equipment) => {
    // Logic to view equipment transactions
    toast({
      title: "View Transactions",
      description: `Viewing transactions for equipment ${item.name}`,
    });
  };

  const handleCheckout = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowCheckoutDialog(true);
  };

  const handleCheckIn = (item: Equipment) => {
    // In a real app, we would fetch the active checkout for this equipment
    // For now, we'll create a mock checkout
    const mockCheckout: EquipmentCheckout = {
      id: `checkout-${item.id}`,
      equipmentId: item.id,
      checkedOutBy: "Staff ID: 1234",
      checkedOutTo: item.assignedTo || "Unknown",
      checkoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "checked_out",
      condition: "good",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };

    setSelectedEquipment(item);
    setSelectedCheckout(mockCheckout);
    setShowCheckInDialog(true);
  };

  const handleScheduleMaintenance = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowMaintenanceDialog(true);
  };

  const handleUpdateLocation = (item: Equipment) => {
    setSelectedEquipment(item);
    setLocationForm({ location: item.location });
    setShowLocationDialog(true);
  };

  const handleUpdateDepreciation = (item: Equipment) => {
    setSelectedEquipment(item);
    setDepreciationForm({
      depreciationValue: item.depreciationValue || 0,
      depreciationRate: item.depreciationRate || 0,
    });
    setShowDepreciationDialog(true);
  };

  const handleAudit = (item: Equipment) => {
    setSelectedEquipment(item);
    setAuditForm({
      condition: "good",
      location: item.location,
      notes: "",
      discrepancies: "",
    });
    setShowAuditDialog(true);
  };

  const handleScanBarcode = (item: Equipment) => {
    setSelectedEquipment(item);
    setScannedCode("");
    setShowBarcodeDialog(true);
  };

  const handleScanQrCode = (item: Equipment) => {
    setSelectedEquipment(item);
    setScannedCode("");
    setShowQrDialog(true);
  };

  const submitCheckout = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    toast({
      title: "Equipment Checked Out",
      description: `${selectedEquipment.name} has been checked out to ${checkoutForm.checkedOutTo}`,
    });

    // Update the equipment status in the UI
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) =>
        item.id === selectedEquipment.id
          ? {
              ...item,
              currentStatus: "in_use",
              assignedTo: checkoutForm.checkedOutTo,
            }
          : item,
      ),
    );

    setShowCheckoutDialog(false);
    setCheckoutForm({
      checkedOutBy: "",
      checkedOutTo: "",
      expectedReturnDate: "",
      notes: "",
    });
  };

  const submitCheckIn = () => {
    if (!selectedEquipment || !selectedCheckout) return;

    // In a real app, this would call an API
    toast({
      title: "Equipment Checked In",
      description: `${selectedEquipment.name} has been checked in with condition: ${checkInForm.condition}`,
    });

    // Update the equipment status in the UI
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) =>
        item.id === selectedEquipment.id
          ? { ...item, currentStatus: "available", assignedTo: undefined }
          : item,
      ),
    );

    setShowCheckInDialog(false);
    setCheckInForm({
      condition: "good",
      notes: "",
    });
    setSelectedCheckout(null);
  };

  const submitMaintenance = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance for ${selectedEquipment.name} has been scheduled for ${maintenanceForm.scheduledDate}`,
    });

    // Update the equipment in the UI if it's scheduled for immediate maintenance
    const scheduledDate = new Date(maintenanceForm.scheduledDate);
    const today = new Date();
    if (scheduledDate.toDateString() === today.toDateString()) {
      setEquipment((prevEquipment) =>
        prevEquipment.map((item) =>
          item.id === selectedEquipment.id
            ? {
                ...item,
                currentStatus: "maintenance",
                nextMaintenanceDate: scheduledDate,
              }
            : item,
        ),
      );
    }

    setShowMaintenanceDialog(false);
    setMaintenanceForm({
      maintenanceType: "routine",
      scheduledDate: "",
      assignedTechnician: "",
      notes: "",
    });
  };

  const submitLocationUpdate = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    toast({
      title: "Location Updated",
      description: `${selectedEquipment.name} location has been updated to ${locationForm.location}`,
    });

    // Update the equipment in the UI
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) =>
        item.id === selectedEquipment.id
          ? { ...item, location: locationForm.location }
          : item,
      ),
    );

    setShowLocationDialog(false);
    setLocationForm({ location: "" });
  };

  const submitDepreciationUpdate = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    toast({
      title: "Depreciation Updated",
      description: `${selectedEquipment.name} depreciation values have been updated`,
    });

    // Update the equipment in the UI
    setEquipment((prevEquipment) =>
      prevEquipment.map((item) =>
        item.id === selectedEquipment.id
          ? {
              ...item,
              depreciationValue: depreciationForm.depreciationValue,
              depreciationRate: depreciationForm.depreciationRate,
            }
          : item,
      ),
    );

    setShowDepreciationDialog(false);
    setDepreciationForm({ depreciationValue: 0, depreciationRate: 0 });
  };

  const submitAudit = () => {
    if (!selectedEquipment) return;

    // In a real app, this would call an API
    toast({
      title: "Audit Completed",
      description: `Audit for ${selectedEquipment.name} has been recorded`,
    });

    // Update the equipment location if it changed during audit
    if (auditForm.location !== selectedEquipment.location) {
      setEquipment((prevEquipment) =>
        prevEquipment.map((item) =>
          item.id === selectedEquipment.id
            ? { ...item, location: auditForm.location }
            : item,
        ),
      );
    }

    setShowAuditDialog(false);
    setAuditForm({
      condition: "good",
      location: "",
      notes: "",
      discrepancies: "",
    });
  };

  const handleBarcodeScanned = () => {
    if (!selectedEquipment) return;

    // In a real app, this would validate the scanned code against the equipment
    const mockScannedCode = selectedEquipment.itemCode;
    setScannedCode(mockScannedCode);

    setTimeout(() => {
      toast({
        title: "Barcode Scanned",
        description: `Equipment identified: ${selectedEquipment.name}`,
      });
      setShowBarcodeDialog(false);
    }, 1500);
  };

  const handleQrCodeScanned = () => {
    if (!selectedEquipment) return;

    // In a real app, this would validate the scanned code against the equipment
    const mockScannedCode = JSON.stringify({
      id: selectedEquipment.id,
      code: selectedEquipment.itemCode,
      serial: selectedEquipment.serialNumber,
    });
    setScannedCode(mockScannedCode);

    setTimeout(() => {
      toast({
        title: "QR Code Scanned",
        description: `Equipment identified: ${selectedEquipment.name}`,
      });
      setShowQrDialog(false);
    }, 1500);
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "available":
        return "default";
      case "in_use":
        return "secondary";
      case "maintenance":
        return "destructive";
      case "retired":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "available":
        return t("procurement.available", "Available");
      case "in_use":
        return t("procurement.inUse", "In Use");
      case "maintenance":
        return t("procurement.maintenance", "Maintenance");
      case "retired":
        return t("procurement.retired", "Retired");
      default:
        return status;
    }
  };

  // Get unique categories for filter
  const categories = Array.from(
    new Set(equipment.map((item) => item.categoryId)),
  );

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = categoryFilter
      ? item.categoryId === categoryFilter
      : true;

    const matchesStatus = statusFilter
      ? item.currentStatus === statusFilter
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t(
                  "procurement.filterByCategory",
                  "Filter by category",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allCategories", "All Categories")}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t(
                  "procurement.filterByStatus",
                  "Filter by status",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allStatuses", "All Statuses")}
              </SelectItem>
              <SelectItem value="available">
                {t("procurement.available", "Available")}
              </SelectItem>
              <SelectItem value="in_use">
                {t("procurement.inUse", "In Use")}
              </SelectItem>
              <SelectItem value="maintenance">
                {t("procurement.maintenance", "Maintenance")}
              </SelectItem>
              <SelectItem value="retired">
                {t("procurement.retired", "Retired")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noEquipmentFound", "No equipment found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("procurement.itemCode", "Item Code")}</TableHead>
                <TableHead>{t("procurement.name", "Name")}</TableHead>
                <TableHead>
                  {t("procurement.serialModel", "Serial/Model")}
                </TableHead>
                <TableHead>{t("procurement.location", "Location")}</TableHead>
                <TableHead>
                  {t("procurement.maintenance", "Maintenance")}
                </TableHead>
                <TableHead>{t("procurement.status", "Status")}</TableHead>
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
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">SN:</span>{" "}
                      {item.serialNumber}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Model:</span> {item.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.manufacturer}
                    </div>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.nextMaintenanceDate && (
                        <div>
                          <span className="font-medium">Next:</span>{" "}
                          {format(
                            new Date(item.nextMaintenanceDate),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}
                      {item.lastMaintenanceDate && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Last:</span>{" "}
                          {format(
                            new Date(item.lastMaintenanceDate),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.currentStatus)}>
                      {getStatusLabel(item.currentStatus)}
                    </Badge>
                    {item.assignedTo && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.assignedTo}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2 flex-wrap">
                      {item.currentStatus === "available" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckout(item)}
                          title={t("procurement.checkout", "Checkout")}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : item.currentStatus === "in_use" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckIn(item)}
                          title={t("procurement.checkin", "Check In")}
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScheduleMaintenance(item)}
                        title={t("procurement.maintenance", "Maintenance")}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateLocation(item)}
                        title={t("procurement.location", "Location")}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateDepreciation(item)}
                        title={t("procurement.depreciation", "Depreciation")}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAudit(item)}
                        title={t("procurement.audit", "Audit")}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScanBarcode(item)}
                        title={t("procurement.barcode", "Barcode")}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScanQrCode(item)}
                        title={t("procurement.qrCode", "QR Code")}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransactions(item)}
                        title={t("procurement.history", "History")}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title={t("common.edit", "Edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.checkoutEquipment", "Checkout Equipment")}
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
                <Label htmlFor="checkedOutBy">
                  {t("procurement.checkedOutBy", "Checked Out By")}
                </Label>
                <Input
                  id="checkedOutBy"
                  value={checkoutForm.checkedOutBy}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      checkedOutBy: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkedOutTo">
                  {t("procurement.checkedOutTo", "Checked Out To")}
                </Label>
                <Input
                  id="checkedOutTo"
                  value={checkoutForm.checkedOutTo}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      checkedOutTo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedReturnDate">
                  {t("procurement.expectedReturnDate", "Expected Return Date")}
                </Label>
                <Input
                  id="expectedReturnDate"
                  type="date"
                  value={checkoutForm.expectedReturnDate}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      expectedReturnDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes", "Notes")}</Label>
                <Input
                  id="notes"
                  value={checkoutForm.notes}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitCheckout}>
              {t("procurement.checkout", "Checkout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.scheduleMaintenance", "Schedule Maintenance")}
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
                <Label htmlFor="maintenanceType">
                  {t("procurement.maintenanceType", "Maintenance Type")}
                </Label>
                <Select
                  value={maintenanceForm.maintenanceType}
                  onValueChange={(value) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      maintenanceType: value as any,
                    })
                  }
                >
                  <SelectTrigger id="maintenanceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">
                      {t("procurement.routine", "Routine")}
                    </SelectItem>
                    <SelectItem value="repair">
                      {t("procurement.repair", "Repair")}
                    </SelectItem>
                    <SelectItem value="inspection">
                      {t("procurement.inspection", "Inspection")}
                    </SelectItem>
                    <SelectItem value="calibration">
                      {t("procurement.calibration", "Calibration")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  {t("procurement.scheduledDate", "Scheduled Date")}
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={maintenanceForm.scheduledDate}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      scheduledDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTechnician">
                  {t("procurement.assignedTechnician", "Assigned Technician")}
                </Label>
                <Input
                  id="assignedTechnician"
                  value={maintenanceForm.assignedTechnician}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      assignedTechnician: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceNotes">
                  {t("common.notes", "Notes")}
                </Label>
                <Input
                  id="maintenanceNotes"
                  value={maintenanceForm.notes}
                  onChange={(e) =>
                    setMaintenanceForm({
                      ...maintenanceForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaintenanceDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitMaintenance}>
              {t("procurement.schedule", "Schedule")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.updateLocation", "Update Location")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && (
              <div className="mb-4">
                <h4 className="font-medium">{selectedEquipment.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEquipment.serialNumber} | {selectedEquipment.model}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">
                    {t("procurement.currentLocation", "Current Location")}:
                  </span>{" "}
                  {selectedEquipment.location}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  {t("procurement.newLocation", "New Location")}
                </Label>
                <Input
                  id="location"
                  value={locationForm.location}
                  onChange={(e) =>
                    setLocationForm({
                      ...locationForm,
                      location: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLocationDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitLocationUpdate}>
              {t("common.update", "Update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Depreciation Dialog */}
      <Dialog
        open={showDepreciationDialog}
        onOpenChange={setShowDepreciationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.updateDepreciation", "Update Depreciation")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && (
              <div className="mb-4">
                <h4 className="font-medium">{selectedEquipment.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEquipment.serialNumber} | {selectedEquipment.model}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">
                    {t("procurement.purchaseDate", "Purchase Date")}:
                  </span>{" "}
                  {selectedEquipment.purchaseDate
                    ? format(
                        new Date(selectedEquipment.purchaseDate),
                        "MMM d, yyyy",
                      )
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    {t("procurement.purchaseValue", "Purchase Value")}:
                  </span>{" "}
                  {selectedEquipment.unitCost}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depreciationValue">
                  {t("procurement.currentValue", "Current Value")}
                </Label>
                <Input
                  id="depreciationValue"
                  type="number"
                  value={depreciationForm.depreciationValue}
                  onChange={(e) =>
                    setDepreciationForm({
                      ...depreciationForm,
                      depreciationValue: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationRate">
                  {t(
                    "procurement.depreciationRate",
                    "Depreciation Rate (% per year)",
                  )}
                </Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  value={depreciationForm.depreciationRate}
                  onChange={(e) =>
                    setDepreciationForm({
                      ...depreciationForm,
                      depreciationRate: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDepreciationDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitDepreciationUpdate}>
              {t("common.update", "Update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="auditCondition">
                  {t("procurement.condition", "Condition")}
                </Label>
                <Select
                  value={auditForm.condition}
                  onValueChange={(value) =>
                    setAuditForm({
                      ...auditForm,
                      condition: value as any,
                    })
                  }
                >
                  <SelectTrigger id="auditCondition">
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
                <Label htmlFor="auditLocation">
                  {t("procurement.verifyLocation", "Verify Location")}
                </Label>
                <Input
                  id="auditLocation"
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
                <Label htmlFor="discrepancies">
                  {t("procurement.discrepancies", "Discrepancies")}
                </Label>
                <Input
                  id="discrepancies"
                  value={auditForm.discrepancies}
                  onChange={(e) =>
                    setAuditForm({
                      ...auditForm,
                      discrepancies: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditNotes">{t("common.notes", "Notes")}</Label>
                <Input
                  id="auditNotes"
                  value={auditForm.notes}
                  onChange={(e) =>
                    setAuditForm({
                      ...auditForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitAudit}>
              {t("procurement.completeAudit", "Complete Audit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.scanBarcode", "Scan Barcode")}
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

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                {scannedCode ? (
                  <div className="text-center">
                    <p className="font-medium">
                      {t("procurement.codeScanned", "Code Scanned")}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scannedCode}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Barcode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "procurement.positionBarcode",
                        "Position barcode in the scanner area",
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* This button simulates scanning in the demo */}
              <Button onClick={handleBarcodeScanned} disabled={!!scannedCode}>
                {t("procurement.simulateScan", "Simulate Scan")}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBarcodeDialog(false)}
            >
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.scanQrCode", "Scan QR Code")}
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

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                {scannedCode ? (
                  <div className="text-center">
                    <p className="font-medium">
                      {t("procurement.codeScanned", "Code Scanned")}:
                    </p>
                    <p className="text-sm text-muted-foreground overflow-auto max-h-32">
                      {scannedCode}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "procurement.positionQrCode",
                        "Position QR code in the scanner area",
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* This button simulates scanning in the demo */}
              <Button onClick={handleQrCodeScanned} disabled={!!scannedCode}>
                {t("procurement.simulateScan", "Simulate Scan")}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.checkInEquipment", "Check In Equipment")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEquipment && selectedCheckout && (
              <div className="mb-4">
                <h4 className="font-medium">{selectedEquipment.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEquipment.serialNumber} | {selectedEquipment.model}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {t("procurement.checkedOutBy", "Checked Out By")}:
                    </span>{" "}
                    {selectedCheckout.checkedOutBy}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">
                      {t("procurement.checkedOutTo", "Checked Out To")}:
                    </span>{" "}
                    {selectedCheckout.checkedOutTo}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">
                      {t("procurement.checkoutDate", "Checkout Date")}:
                    </span>{" "}
                    {format(
                      new Date(selectedCheckout.checkoutDate),
                      "MMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">
                      {t(
                        "procurement.expectedReturnDate",
                        "Expected Return Date",
                      )}
                      :
                    </span>{" "}
                    {format(
                      new Date(selectedCheckout.expectedReturnDate),
                      "MMM d, yyyy",
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInCondition">
                  {t("procurement.returnCondition", "Return Condition")}
                </Label>
                <Select
                  value={checkInForm.condition}
                  onValueChange={(value) =>
                    setCheckInForm({
                      ...checkInForm,
                      condition: value as any,
                    })
                  }
                >
                  <SelectTrigger id="checkInCondition">
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
                <Label htmlFor="checkInNotes">
                  {t("common.notes", "Notes")}
                </Label>
                <Input
                  id="checkInNotes"
                  value={checkInForm.notes}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckInDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitCheckIn}>
              {t("procurement.checkIn", "Check In")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentManagement;
