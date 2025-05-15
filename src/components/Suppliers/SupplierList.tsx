import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectField } from "@/components/ui/form-components";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  FileText,
  User,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Supplier {
  id: string;
  name: string;
  arabicName?: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  address?: string;
  city?: string;
  country?: string;
  registrationDate?: Date;
  lastOrderDate?: Date;
  totalOrders?: number;
  totalSpend?: number;
  paymentTerms?: string;
  notes?: string;
  tags?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: Date;
    size: string;
  }[];
}

const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "Al Futtaim Building Materials",
    arabicName: "الفطيم لمواد البناء",
    category: "Building Materials",
    contactPerson: "Ahmed Mohammed",
    phone: "+971-4-123-4567",
    email: "ahmed@alfuttaim.ae",
    status: "active",
    rating: 4.5,
    address: "Sheikh Zayed Road, Dubai",
    city: "Dubai",
    country: "UAE",
    registrationDate: new Date(2022, 1, 15),
    lastOrderDate: new Date(2023, 10, 5),
    totalOrders: 42,
    totalSpend: 385000,
    paymentTerms: "Net 30",
    notes: "Preferred supplier for bathroom fixtures",
    tags: ["Premium", "Fast Delivery", "Warranty"],
    documents: [
      {
        id: "doc-001",
        name: "Trade License",
        type: "PDF",
        uploadDate: new Date(2022, 1, 15),
        size: "2.4 MB",
      },
      {
        id: "doc-002",
        name: "Product Catalog",
        type: "PDF",
        uploadDate: new Date(2023, 3, 10),
        size: "8.7 MB",
      },
    ],
  },
  {
    id: "sup-002",
    name: "Emirates Healthcare Equipment",
    arabicName: "الإمارات للمعدات الصحية",
    category: "Healthcare Equipment",
    contactPerson: "Sara Al Mansoori",
    phone: "+971-2-234-5678",
    email: "sara@emirateshealthcare.ae",
    status: "active",
    rating: 4.8,
    address: "Hamdan Street, Abu Dhabi",
    city: "Abu Dhabi",
    country: "UAE",
    registrationDate: new Date(2021, 5, 20),
    lastOrderDate: new Date(2023, 11, 12),
    totalOrders: 67,
    totalSpend: 520000,
    paymentTerms: "Net 45",
    notes: "Specialized in mobility aids and medical equipment",
    tags: ["Medical Grade", "Installation Included", "Training"],
    documents: [
      {
        id: "doc-003",
        name: "Trade License",
        type: "PDF",
        uploadDate: new Date(2021, 5, 20),
        size: "1.8 MB",
      },
      {
        id: "doc-004",
        name: "ISO Certification",
        type: "PDF",
        uploadDate: new Date(2022, 7, 15),
        size: "3.2 MB",
      },
    ],
  },
  {
    id: "sup-003",
    name: "Dubai Accessibility Solutions",
    arabicName: "دبي لحلول سهولة الوصول",
    category: "Accessibility Equipment",
    contactPerson: "Khalid Al Hashimi",
    phone: "+971-4-345-6789",
    email: "khalid@dubaiaccess.ae",
    status: "pending",
    rating: 3.9,
    address: "Business Bay, Dubai",
    city: "Dubai",
    country: "UAE",
    registrationDate: new Date(2022, 8, 10),
    lastOrderDate: new Date(2023, 9, 28),
    totalOrders: 23,
    totalSpend: 175000,
    paymentTerms: "Net 30",
    notes: "New supplier with specialized accessibility products",
    tags: ["Customizable", "Local Support"],
    documents: [
      {
        id: "doc-005",
        name: "Trade License",
        type: "PDF",
        uploadDate: new Date(2022, 8, 10),
        size: "2.1 MB",
      },
    ],
  },
  {
    id: "sup-004",
    name: "Sharjah Home Modifications",
    arabicName: "الشارقة لتعديلات المنازل",
    category: "Home Modifications",
    contactPerson: "Fatima Al Qassimi",
    phone: "+971-6-456-7890",
    email: "fatima@sharjahmods.ae",
    status: "active",
    rating: 4.2,
    address: "Industrial Area 12, Sharjah",
    city: "Sharjah",
    country: "UAE",
    registrationDate: new Date(2021, 3, 5),
    lastOrderDate: new Date(2023, 11, 2),
    totalOrders: 38,
    totalSpend: 290000,
    paymentTerms: "Net 15",
    tags: ["Residential", "Quick Installation"],
    documents: [
      {
        id: "doc-006",
        name: "Trade License",
        type: "PDF",
        uploadDate: new Date(2021, 3, 5),
        size: "1.9 MB",
      },
    ],
  },
  {
    id: "sup-005",
    name: "Ajman Safety Solutions",
    arabicName: "عجمان لحلول السلامة",
    category: "Safety Equipment",
    contactPerson: "Mohammed Al Nuaimi",
    phone: "+971-6-567-8901",
    email: "mohammed@ajmansafety.ae",
    status: "inactive",
    rating: 3.5,
    address: "Ajman Free Zone",
    city: "Ajman",
    country: "UAE",
    registrationDate: new Date(2020, 7, 12),
    lastOrderDate: new Date(2022, 5, 18),
    totalOrders: 15,
    totalSpend: 85000,
    paymentTerms: "Net 30",
    tags: ["Safety Certified", "Budget Friendly"],
    documents: [
      {
        id: "doc-007",
        name: "Trade License",
        type: "PDF",
        uploadDate: new Date(2020, 7, 12),
        size: "2.2 MB",
      },
    ],
  },
];

const SupplierList: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique categories for filter dropdown
  const categories = Array.from(new Set(mockSuppliers.map((s) => s.category)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "" || supplier.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "" || supplier.status === selectedStatus;

    let matchesTab = true;
    if (activeTab === "active") matchesTab = supplier.status === "active";
    if (activeTab === "pending") matchesTab = supplier.status === "pending";
    if (activeTab === "inactive") matchesTab = supplier.status === "inactive";

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDetails(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSupplier = () => {
    if (supplierToDelete) {
      setSuppliers(suppliers.filter((s) => s.id !== supplierToDelete.id));
      setShowDeleteDialog(false);
      setSupplierToDelete(null);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  // Stats for the dashboard
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const pendingSuppliers = suppliers.filter(
    (s) => s.status === "pending",
  ).length;
  const inactiveSuppliers = suppliers.filter(
    (s) => s.status === "inactive",
  ).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("suppliers.title", "Suppliers")}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {t("suppliers.import", "Import")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("suppliers.export", "Export")}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("suppliers.addNew", "Add New Supplier")}
          </Button>
        </div>
      </div>

      {/* Supplier Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("suppliers.totalSuppliers", "Total Suppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("suppliers.activeSuppliers", "Active Suppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("suppliers.pendingSuppliers", "Pending Suppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("suppliers.inactiveSuppliers", "Inactive Suppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveSuppliers}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">{t("suppliers.all", "All")}</TabsTrigger>
          <TabsTrigger value="active">
            {t("suppliers.active", "Active")}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t("suppliers.pending", "Pending")}
          </TabsTrigger>
          <TabsTrigger value="inactive">
            {t("suppliers.inactive", "Inactive")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t("common.search", "Search suppliers...")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <SelectField
            label=""
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              {
                value: "",
                label: t("suppliers.allCategories", "All Categories"),
              },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
            placeholder={t("suppliers.category", "Category")}
          />
          <SelectField
            label=""
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "", label: t("suppliers.allStatuses", "All Statuses") },
              {
                value: "active",
                label: t("suppliers.status.active", "Active"),
              },
              {
                value: "pending",
                label: t("suppliers.status.pending", "Pending"),
              },
              {
                value: "inactive",
                label: t("suppliers.status.inactive", "Inactive"),
              },
            ]}
            placeholder={t("suppliers.status", "Status")}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedStatus("");
            }}
          >
            {t("common.reset", "Reset")}
          </Button>
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
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("suppliers.name", "Name")}</TableHead>
              <TableHead>{t("suppliers.category", "Category")}</TableHead>
              <TableHead>
                {t("suppliers.contactPerson", "Contact Person")}
              </TableHead>
              <TableHead>{t("suppliers.phone", "Phone")}</TableHead>
              <TableHead>{t("suppliers.email", "Email")}</TableHead>
              <TableHead>{t("suppliers.status", "Status")}</TableHead>
              <TableHead>{t("suppliers.rating", "Rating")}</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    {isRTL && supplier.arabicName
                      ? supplier.arabicName
                      : supplier.name}
                  </TableCell>
                  <TableCell>{supplier.category}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(supplier.status)}>
                      {t(
                        `suppliers.status.${supplier.status}`,
                        supplier.status,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-1">{supplier.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < Math.floor(supplier.rating) ? "text-yellow-500" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          {t("common.view", "View")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t("common.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteSupplier(supplier)}
                        >
                          {t("common.delete", "Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {t("common.noResults", "No results found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Supplier Details Dialog */}
      <Dialog open={showSupplierDetails} onOpenChange={setShowSupplierDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
            <DialogDescription>
              {t(
                "suppliers.supplierDetails",
                "Supplier details and information",
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSupplier && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("suppliers.contactInformation", "Contact Information")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {selectedSupplier.contactPerson}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.primaryContact", "Primary Contact")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedSupplier.phone}</p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.phone", "Phone")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedSupplier.email}</p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.email", "Email")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedSupplier.address}</p>
                      <p className="text-sm text-gray-500">{`${selectedSupplier.city}, ${selectedSupplier.country}`}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">
                  {t("suppliers.businessInformation", "Business Information")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">{selectedSupplier.category}</p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.category", "Category")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {formatDate(selectedSupplier.registrationDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.registrationDate", "Registration Date")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Star className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {selectedSupplier.rating}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < Math.floor(selectedSupplier.rating) ? "text-yellow-500" : "text-gray-300"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.rating", "Rating")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("suppliers.orderInformation", "Order Information")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {formatDate(selectedSupplier.lastOrderDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.lastOrderDate", "Last Order Date")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {selectedSupplier.totalOrders}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.totalOrders", "Total Orders")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {selectedSupplier.totalSpend?.toLocaleString()} AED
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.totalSpend", "Total Spend")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {selectedSupplier.paymentTerms}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("suppliers.paymentTerms", "Payment Terms")}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">
                  {t("suppliers.documents", "Documents")}
                </h3>
                {selectedSupplier.documents &&
                selectedSupplier.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSupplier.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.size} • {formatDate(doc.uploadDate)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t("common.download", "Download")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {t("suppliers.noDocuments", "No documents available")}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSupplierDetails(false)}
            >
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("suppliers.deleteSupplier", "Delete Supplier")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "suppliers.deleteConfirmation",
                "Are you sure you want to delete this supplier? This action cannot be undone.",
              )}
              {supplierToDelete && (
                <p className="mt-2 font-medium">{supplierToDelete.name}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSupplier}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierList;
