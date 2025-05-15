import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientType } from "@/lib/forms/types";
import {
  Plus,
  Search,
  Check,
  X,
  Edit,
  Star,
  StarOff,
  FileText,
  BarChart2,
  Clock,
} from "lucide-react";
import { SupplierServiceAgreementForm } from "./SupplierServiceAgreementForm";

interface ClientSupplierManagerProps {
  clientId?: string;
  clientType?: ClientType;
}

interface Supplier {
  id: string;
  name: string;
  categories: string[];
  status: "pending" | "approved" | "rejected" | "inactive";
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  isPreferred: boolean;
  performanceMetrics?: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
    costEfficiency: number;
  };
  agreements?: {
    id: string;
    title: string;
    startDate: Date;
    endDate?: Date;
    status: "active" | "expired" | "pending";
  }[];
}

export const ClientSupplierManager: React.FC<ClientSupplierManagerProps> = ({
  clientId = "client-001",
  clientType = ClientType.FDF,
}) => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
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
        categories: ["Bathroom Fixtures", "Kitchen Fixtures", "Flooring"],
        status: "approved",
        rating: 4.5,
        contactPerson: "Ahmed Al Mansouri",
        email: "ahmed@alfuttaim.ae",
        phone: "+971 2 123 4567",
        isPreferred: true,
        performanceMetrics: {
          onTimeDelivery: 92,
          qualityScore: 4.7,
          responseTime: 24,
          costEfficiency: 88,
        },
        agreements: [
          {
            id: "agr-001",
            title: "Annual Supply Agreement 2023",
            startDate: new Date(2023, 0, 1),
            endDate: new Date(2023, 11, 31),
            status: "active",
          },
        ],
      },
      {
        id: "sup-002",
        name: "Emirates Safety Equipment",
        categories: ["Safety Equipment", "Mobility Aids"],
        status: "approved",
        rating: 4.2,
        contactPerson: "Sara Al Zaabi",
        email: "sara@emiratessafety.ae",
        phone: "+971 2 234 5678",
        isPreferred: false,
        performanceMetrics: {
          onTimeDelivery: 85,
          qualityScore: 4.2,
          responseTime: 36,
          costEfficiency: 92,
        },
      },
      {
        id: "sup-003",
        name: "Dubai Home Accessibility Solutions",
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
        categories: ["Building Materials", "Flooring", "Electrical"],
        status: "approved",
        rating: 3.8,
        contactPerson: "Fatima Al Mazrouei",
        email: "fatima@adcs.ae",
        phone: "+971 2 456 7890",
        isPreferred: true,
        performanceMetrics: {
          onTimeDelivery: 78,
          qualityScore: 3.9,
          responseTime: 48,
          costEfficiency: 95,
        },
        agreements: [
          {
            id: "agr-002",
            title: "Quarterly Supply Agreement Q1-2023",
            startDate: new Date(2023, 0, 1),
            endDate: new Date(2023, 2, 31),
            status: "expired",
          },
          {
            id: "agr-003",
            title: "Quarterly Supply Agreement Q2-2023",
            startDate: new Date(2023, 3, 1),
            endDate: new Date(2023, 5, 30),
            status: "active",
          },
        ],
      },
      {
        id: "sup-005",
        name: "Sharjah Medical Equipment",
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

    // Apply tab filter
    if (activeTab === "preferred") {
      filtered = filtered.filter((supplier) => supplier.isPreferred);
    } else if (activeTab === "pending") {
      filtered = filtered.filter((supplier) => supplier.status === "pending");
    } else if (activeTab === "agreements") {
      filtered = filtered.filter(
        (supplier) => supplier.agreements && supplier.agreements.length > 0,
      );
    }

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
  }, [suppliers, searchTerm, statusFilter, categoryFilter, activeTab]);

  const handleApproveSupplier = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, status: "approved" }
          : supplier,
      ),
    );
  };

  const handleRejectSupplier = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, status: "rejected" }
          : supplier,
      ),
    );
  };

  const handleTogglePreferred = (supplierId: string) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === supplierId
          ? { ...supplier, isPreferred: !supplier.isPreferred }
          : supplier,
      ),
    );
  };

  const handleCreateSupplier = () => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now().toString().substring(8)}`,
      name: newSupplierData.name,
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
  };

  const handleCreateAgreement = (data: any) => {
    if (!selectedSupplier) return;

    const newAgreement = {
      id: `agr-${Date.now().toString().substring(8)}`,
      title: data.agreementTitle,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "active" as "active" | "expired" | "pending",
    };

    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === selectedSupplier.id
          ? {
              ...supplier,
              agreements: supplier.agreements
                ? [...supplier.agreements, newAgreement]
                : [newAgreement],
            }
          : supplier,
      ),
    );

    setIsAgreementDialogOpen(false);
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
      case "active":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-orange-100 text-orange-800";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("supplier.manager")}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("supplier.addSupplier")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t("supplier.addNewSupplier")}</DialogTitle>
              <DialogDescription>
                {t("supplier.addNewSupplierDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("supplier.name")}
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
                  {t("supplier.arabicName")}
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
                  {t("supplier.contactPerson")}
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
                  {t("common.email")}
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
                  {t("common.phone")}
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
                  {t("supplier.categories")}
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
              <Button variant="outline">{t("common.cancel")}</Button>
              <Button onClick={handleCreateSupplier}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("supplier.supplierManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
              <TabsTrigger value="preferred">
                {t("supplier.preferred")}
              </TabsTrigger>
              <TabsTrigger value="pending">{t("supplier.pending")}</TabsTrigger>
              <TabsTrigger value="agreements">
                {t("supplier.agreements")}
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("supplier.searchSuppliers")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("supplier.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="approved">
                    {t("supplier.approved")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("supplier.pending")}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t("supplier.rejected")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("supplier.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("supplier.filterByCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("supplier.name")}
                      </TableHead>
                      <TableHead>{t("supplier.categories")}</TableHead>
                      <TableHead>{t("supplier.status")}</TableHead>
                      <TableHead>{t("supplier.rating")}</TableHead>
                      <TableHead>{t("supplier.contactPerson")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
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
                                {t("supplier.notRatedYet")}
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
                                    onClick={() =>
                                      handleApproveSupplier(supplier.id)
                                    }
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    {t("supplier.approve")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() =>
                                      handleRejectSupplier(supplier.id)
                                    }
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    {t("supplier.reject")}
                                  </Button>
                                </>
                              )}
                              {supplier.status === "approved" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleTogglePreferred(supplier.id)
                                    }
                                  >
                                    {supplier.isPreferred ? (
                                      <>
                                        <StarOff className="h-4 w-4 mr-1" />
                                        {t("supplier.removePreferred")}
                                      </>
                                    ) : (
                                      <>
                                        <Star className="h-4 w-4 mr-1" />
                                        {t("supplier.markPreferred")}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedSupplier(supplier);
                                      setIsAgreementDialogOpen(true);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    {t("supplier.agreement")}
                                  </Button>
                                  {supplier.performanceMetrics && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedSupplier(supplier);
                                        setIsPerformanceDialogOpen(true);
                                      }}
                                    >
                                      <BarChart2 className="h-4 w-4 mr-1" />
                                      {t("supplier.performance")}
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                {t("common.edit")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {t("supplier.noSuppliersFound")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="preferred" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("supplier.name")}
                      </TableHead>
                      <TableHead>{t("supplier.categories")}</TableHead>
                      <TableHead>{t("supplier.status")}</TableHead>
                      <TableHead>{t("supplier.rating")}</TableHead>
                      <TableHead>{t("supplier.contactPerson")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-2" />
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
                            <div className="flex items-center">
                              <span className="mr-1">{supplier.rating}</span>
                              <Star className="h-4 w-4 text-yellow-500" />
                            </div>
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleTogglePreferred(supplier.id)
                                }
                              >
                                <StarOff className="h-4 w-4 mr-1" />
                                {t("supplier.removePreferred")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setIsAgreementDialogOpen(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                {t("supplier.agreement")}
                              </Button>
                              {supplier.performanceMetrics && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setIsPerformanceDialogOpen(true);
                                  }}
                                >
                                  <BarChart2 className="h-4 w-4 mr-1" />
                                  {t("supplier.performance")}
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                {t("common.edit")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {t("supplier.noPreferredSuppliersFound")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("supplier.name")}
                      </TableHead>
                      <TableHead>{t("supplier.categories")}</TableHead>
                      <TableHead>{t("supplier.contactPerson")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            {supplier.name}
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
                            <div>
                              <div>{supplier.contactPerson}</div>
                              <div className="text-sm text-muted-foreground">
                                {supplier.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() =>
                                  handleApproveSupplier(supplier.id)
                                }
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {t("supplier.approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() =>
                                  handleRejectSupplier(supplier.id)
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                {t("supplier.reject")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {t("supplier.noPendingSuppliersFound")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="agreements" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        {t("supplier.name")}
                      </TableHead>
                      <TableHead>{t("supplier.agreementTitle")}</TableHead>
                      <TableHead>{t("supplier.period")}</TableHead>
                      <TableHead>{t("supplier.status")}</TableHead>
                      <TableHead className="text-right">
                        {t("common.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.flatMap((supplier) =>
                        supplier.agreements
                          ? supplier.agreements.map((agreement) => (
                              <TableRow key={`${supplier.id}-${agreement.id}`}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    {supplier.isPreferred && (
                                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                                    )}
                                    {supplier.name}
                                  </div>
                                </TableCell>
                                <TableCell>{agreement.title}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                    {format(agreement.startDate, "MMM d, yyyy")}{" "}
                                    -
                                    {agreement.endDate
                                      ? format(agreement.endDate, "MMM d, yyyy")
                                      : "Ongoing"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                      agreement.status,
                                    )}`}
                                  >
                                    {agreement.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button size="sm" variant="outline">
                                      <FileText className="h-4 w-4 mr-1" />
                                      {t("supplier.viewAgreement")}
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-4 w-4 mr-1" />
                                      {t("common.edit")}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          : [],
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">
                            {t("supplier.noAgreementsFound")}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Service Agreement Dialog */}
      <Dialog
        open={isAgreementDialogOpen}
        onOpenChange={setIsAgreementDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("supplier.createServiceAgreement")} - {selectedSupplier?.name}
            </DialogTitle>
            <DialogDescription>
              {t("supplier.createServiceAgreementDescription")}
            </DialogDescription>
          </DialogHeader>
          <SupplierServiceAgreementForm
            supplierId={selectedSupplier?.id}
            clientId={clientId}
            onSubmit={handleCreateAgreement}
            onCancel={() => setIsAgreementDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Performance Metrics Dialog */}
      <Dialog
        open={isPerformanceDialogOpen}
        onOpenChange={setIsPerformanceDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("supplier.performanceMetrics")} - {selectedSupplier?.name}
            </DialogTitle>
            <DialogDescription>
              {t("supplier.performanceMetricsDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier?.performanceMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSupplier.performanceMetrics.onTimeDelivery}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("supplier.onTimeDelivery")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSupplier.performanceMetrics.qualityScore}/5
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("supplier.qualityScore")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedSupplier.performanceMetrics.responseTime}{" "}
                        {t("supplier.hours")}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("supplier.responseTime")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedSupplier.performanceMetrics.costEfficiency}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("supplier.costEfficiency")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsPerformanceDialogOpen(false)}
                >
                  {t("common.close")}
                </Button>
                <Button>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  {t("supplier.viewDetailedReport")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSupplierManager;
