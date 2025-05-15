import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  Star,
  StarOff,
  Edit,
  Trash2,
  FileText,
  BarChart2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Supplier {
  id: string;
  name: string;
  arabicName: string;
  contactPerson: string;
  email: string;
  phone: string;
  categories: string[];
  status: "approved" | "pending" | "rejected" | "inactive";
  rating: number;
  isPreferred: boolean;
}

interface SupplierManagementProps {
  clientId?: string;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({
  clientId,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    arabicName: "",
    contactPerson: "",
    email: "",
    phone: "",
    categories: [] as string[],
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: "sup-001",
        name: "Al Futtaim Building Materials",
        arabicName: "الفطيم لمواد البناء",
        categories: ["Bathroom Fixtures", "Kitchen Fixtures", "Flooring"],
        status: "approved",
        rating: 4.5,
        contactPerson: "Ahmed Al Mansouri",
        email: "ahmed@alfuttaim.ae",
        phone: "+971 2 123 4567",
        isPreferred: true,
      },
      {
        id: "sup-002",
        name: "Emirates Safety Equipment",
        arabicName: "معدات السلامة الإماراتية",
        categories: ["Safety Equipment", "Mobility Aids"],
        status: "approved",
        rating: 4.2,
        contactPerson: "Sara Al Zaabi",
        email: "sara@emiratessafety.ae",
        phone: "+971 2 234 5678",
        isPreferred: false,
      },
      {
        id: "sup-003",
        name: "Dubai Home Accessibility Solutions",
        arabicName: "حلول سهولة الوصول المنزلية دبي",
        categories: ["Mobility Aids", "Bathroom Fixtures", "Ramps"],
        status: "pending",
        rating: 0,
        contactPerson: "Mohammed Al Hashimi",
        email: "mohammed@dhas.ae",
        phone: "+971 4 345 6789",
        isPreferred: false,
      },
      {
        id: "sup-004",
        name: "Abu Dhabi Construction Supplies",
        arabicName: "مستلزمات البناء أبوظبي",
        categories: ["Building Materials", "Flooring", "Electrical"],
        status: "approved",
        rating: 3.8,
        contactPerson: "Fatima Al Mazrouei",
        email: "fatima@adcs.ae",
        phone: "+971 2 456 7890",
        isPreferred: true,
      },
      {
        id: "sup-005",
        name: "Sharjah Medical Equipment",
        arabicName: "المعدات الطبية الشارقة",
        categories: ["Medical Equipment", "Mobility Aids", "Safety Equipment"],
        status: "rejected",
        rating: 2.5,
        contactPerson: "Khalid Al Qasimi",
        email: "khalid@sharjahmedical.ae",
        phone: "+971 6 567 8901",
        isPreferred: false,
      },
    ];

    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setFilteredSuppliers(mockSuppliers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Apply filters when search term, status filter, or category filter changes
  useEffect(() => {
    let filtered = [...suppliers];

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contactPerson
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (supplier) => supplier.status === statusFilter,
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((supplier) =>
        supplier.categories.some(
          (category) => category.toLowerCase() === categoryFilter.toLowerCase(),
        ),
      );
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  const handleApproveSupplier = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, status: "approved" }
          : supplier,
      ),
    );
    toast({
      title: t("supplier.approved"),
      description: t("supplier.supplierApproved"),
    });
  };

  const handleRejectSupplier = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, status: "rejected" }
          : supplier,
      ),
    );
    toast({
      title: t("supplier.rejected"),
      description: t("supplier.supplierRejected"),
      variant: "destructive",
    });
  };

  const handleTogglePreferred = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, isPreferred: !supplier.isPreferred }
          : supplier,
      ),
    );

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (supplier) {
      toast({
        title: supplier.isPreferred
          ? t("supplier.removedPreferred")
          : t("supplier.markedPreferred"),
        description: supplier.isPreferred
          ? t("supplier.supplierRemovedFromPreferred", { name: supplier.name })
          : t("supplier.supplierMarkedAsPreferred", { name: supplier.name }),
      });
    }
  };

  const handleCreateSupplier = () => {
    if (
      !newSupplierData.name ||
      !newSupplierData.contactPerson ||
      !newSupplierData.email
    ) {
      toast({
        title: t("common.error"),
        description: t("supplier.fillRequiredFields"),
        variant: "destructive",
      });
      return;
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now().toString().substring(8)}`,
      name: newSupplierData.name,
      arabicName: newSupplierData.arabicName,
      categories: newSupplierData.categories,
      status: "pending",
      rating: 0,
      contactPerson: newSupplierData.contactPerson,
      email: newSupplierData.email,
      phone: newSupplierData.phone,
      isPreferred: false,
    };

    setSuppliers([...suppliers, newSupplier]);
    setNewSupplierData({
      name: "",
      arabicName: "",
      contactPerson: "",
      email: "",
      phone: "",
      categories: [],
    });
    setIsAddDialogOpen(false);

    toast({
      title: t("supplier.created"),
      description: t("supplier.supplierCreated"),
    });
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== supplierId));
    toast({
      title: t("supplier.deleted"),
      description: t("supplier.supplierDeleted"),
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get unique categories from all suppliers
  const allCategories = Array.from(
    new Set(suppliers.flatMap((supplier) => supplier.categories)),
  ).sort();

  const handleCategoryToggle = (category: string) => {
    setNewSupplierData((prev) => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category],
        };
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("supplier.management", "Supplier Management")}</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("supplier.addSupplier", "Add Supplier")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {t("supplier.addNewSupplier", "Add New Supplier")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "supplier.addNewSupplierDescription",
                  "Enter the details of the new supplier",
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("supplier.name", "Name")} *
                </label>
                <Input
                  placeholder="Supplier name"
                  value={newSupplierData.name}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("supplier.arabicName", "Arabic Name")}
                </label>
                <Input
                  placeholder="اسم المورد"
                  value={newSupplierData.arabicName}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      arabicName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("supplier.contactPerson", "Contact Person")} *
                </label>
                <Input
                  placeholder="Contact person name"
                  value={newSupplierData.contactPerson}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      contactPerson: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("common.email", "Email")} *
                </label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={newSupplierData.email}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("common.phone", "Phone")}
                </label>
                <Input
                  placeholder="+971 2 123 4567"
                  value={newSupplierData.phone}
                  onChange={(e) =>
                    setNewSupplierData({
                      ...newSupplierData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">
                  {t("supplier.categories", "Categories")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={newSupplierData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleCreateSupplier}>
                {t("common.save", "Save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("supplier.searchSuppliers", "Search suppliers...")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t("supplier.filterByStatus", "Filter by Status")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                <SelectItem value="approved">
                  {t("supplier.approved", "Approved")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("supplier.pending", "Pending")}
                </SelectItem>
                <SelectItem value="rejected">
                  {t("supplier.rejected", "Rejected")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("supplier.inactive", "Inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t(
                    "supplier.filterByCategory",
                    "Filter by Category",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t("common.reset", "Reset")}
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  {t("supplier.name", "Name")}
                </TableHead>
                <TableHead>{t("supplier.categories", "Categories")}</TableHead>
                <TableHead>{t("supplier.status", "Status")}</TableHead>
                <TableHead>{t("supplier.rating", "Rating")}</TableHead>
                <TableHead>
                  {t("supplier.contactPerson", "Contact Person")}
                </TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {supplier.isPreferred && (
                          <Star className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        {supplier.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map((category) => (
                          <Badge key={category} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          supplier.status,
                        )}`}
                      >
                        {supplier.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {supplier.rating > 0 ? (
                        <div className="flex items-center">
                          <span className="mr-1">{supplier.rating}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {t("supplier.notRatedYet", "Not rated yet")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{supplier.contactPerson}</div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {supplier.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleApproveSupplier(supplier.id)}
                            >
                              {t("supplier.approve", "Approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleRejectSupplier(supplier.id)}
                            >
                              {t("supplier.reject", "Reject")}
                            </Button>
                          </>
                        )}
                        {supplier.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTogglePreferred(supplier.id)}
                            >
                              {supplier.isPreferred ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-1" />
                                  {t(
                                    "supplier.removePreferred",
                                    "Remove Preferred",
                                  )}
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-1" />
                                  {t(
                                    "supplier.markPreferred",
                                    "Mark Preferred",
                                  )}
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // View supplier details
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              {t("supplier.details", "Details")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // View performance metrics
                              }}
                            >
                              <BarChart2 className="h-4 w-4 mr-1" />
                              {t("supplier.performance", "Performance")}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit supplier
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t("common.edit", "Edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("common.delete", "Delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {t("supplier.noSuppliersFound", "No suppliers found")}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierManagement;
