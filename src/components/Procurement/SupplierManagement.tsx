import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  Star,
  StarHalf,
  Plus,
  Filter,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../ui/use-toast";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  status: "active" | "inactive";
  rating?: number;
  totalOrders?: number;
  onTimeDelivery?: number;
  qualityScore?: number;
  responseTime?: number;
  address?: string;
  website?: string;
  notes?: string;
}

interface SupplierRating {
  id: string;
  supplierId: string;
  orderId: string;
  orderNumber: string;
  deliveryRating: number;
  qualityRating: number;
  communicationRating: number;
  pricingRating: number;
  comments: string;
  createdBy: string;
  createdAt: Date;
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Al-Faisal Building Materials",
    contactPerson: "Ahmed Al-Faisal",
    phone: "+966 55 123 4567",
    email: "ahmed@alfaisal.com",
    category: "Building Materials",
    status: "active",
    rating: 4.5,
    totalOrders: 24,
    onTimeDelivery: 92,
    qualityScore: 4.7,
    responseTime: 4.2,
    address: "Industrial Area, Riyadh, Saudi Arabia",
    website: "www.alfaisal-materials.com",
    notes: "Preferred supplier for bathroom modification materials",
  },
  {
    id: "2",
    name: "Saudi Home Care Solutions",
    contactPerson: "Fatima Al-Harbi",
    phone: "+966 50 987 6543",
    email: "fatima@shcs.com",
    category: "Home Modifications",
    status: "active",
    rating: 4.8,
    totalOrders: 36,
    onTimeDelivery: 98,
    qualityScore: 4.9,
    responseTime: 4.6,
    address: "King Fahd Road, Jeddah, Saudi Arabia",
    website: "www.saudihomecare.com",
    notes: "Specialized in accessibility modifications for seniors",
  },
  {
    id: "3",
    name: "Riyadh Medical Supplies",
    contactPerson: "Mohammed Al-Otaibi",
    phone: "+966 54 456 7890",
    email: "m.otaibi@rms.com",
    category: "Medical Equipment",
    status: "inactive",
    rating: 3.2,
    totalOrders: 8,
    onTimeDelivery: 75,
    qualityScore: 3.5,
    responseTime: 2.8,
    address: "Medical District, Riyadh, Saudi Arabia",
    website: "www.riyadhmedical.com",
    notes: "Quality issues with recent orders",
  },
];

const mockRatings: SupplierRating[] = [
  {
    id: "r1",
    supplierId: "1",
    orderId: "po-001",
    orderNumber: "PO-2023-001",
    deliveryRating: 5,
    qualityRating: 4,
    communicationRating: 5,
    pricingRating: 4,
    comments: "Excellent delivery time and good quality products",
    createdBy: "Ahmed Al Mansouri",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "r2",
    supplierId: "1",
    orderId: "po-005",
    orderNumber: "PO-2023-005",
    deliveryRating: 4,
    qualityRating: 5,
    communicationRating: 4,
    pricingRating: 4,
    comments: "High quality materials, slightly delayed delivery",
    createdBy: "Fatima Al Zaabi",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "r3",
    supplierId: "2",
    orderId: "po-002",
    orderNumber: "PO-2023-002",
    deliveryRating: 5,
    qualityRating: 5,
    communicationRating: 5,
    pricingRating: 4,
    comments: "Outstanding service and quality",
    createdBy: "Mohammed Al Hashimi",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "r4",
    supplierId: "3",
    orderId: "po-003",
    orderNumber: "PO-2023-003",
    deliveryRating: 2,
    qualityRating: 3,
    communicationRating: 4,
    pricingRating: 4,
    comments: "Significant delays and some quality issues",
    createdBy: "Sarah Johnson",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
];

const SupplierManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("suppliers");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState({
    deliveryRating: 5,
    qualityRating: 5,
    communicationRating: 5,
    pricingRating: 5,
    comments: "",
    orderNumber: "",
  });

  // Filter suppliers based on search term and filters
  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const matchesSearch = searchTerm
      ? supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = categoryFilter
      ? supplier.category === categoryFilter
      : true;

    const matchesStatus = statusFilter
      ? supplier.status === statusFilter
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get supplier ratings
  const getSupplierRatings = (supplierId: string) => {
    return mockRatings.filter((rating) => rating.supplierId === supplierId);
  };

  // Render star rating
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Handle view supplier details
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailDialogOpen(true);
  };

  // Handle add rating
  const handleAddRating = () => {
    if (!selectedSupplier) return;

    setIsRatingDialogOpen(true);
  };

  // Submit new rating
  const submitRating = () => {
    if (!selectedSupplier || !newRating.orderNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API to save the rating
    toast({
      title: "Rating Submitted",
      description: `Rating for ${selectedSupplier.name} has been submitted successfully`,
    });

    setIsRatingDialogOpen(false);
    setNewRating({
      deliveryRating: 5,
      qualityRating: 5,
      communicationRating: 5,
      pricingRating: 5,
      comments: "",
      orderNumber: "",
    });
  };

  // Get unique categories for filter
  const categories = Array.from(
    new Set(mockSuppliers.map((supplier) => supplier.category)),
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suppliers">
            {t("procurement.suppliers", "Suppliers")}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {t("procurement.performance", "Performance")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(
                  "procurement.searchSuppliers",
                  "Search suppliers...",
                )}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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
                  <SelectItem value="active">
                    {t("procurement.active", "Active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("procurement.inactive", "Inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {t("procurement.filter", "Filter")}
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t("procurement.export", "Export")}
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("procurement.addSupplier", "Add Supplier")}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("procurement.supplierName", "Supplier Name")}
                  </TableHead>
                  <TableHead>
                    {t("procurement.contactPerson", "Contact Person")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("procurement.phone", "Phone")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("procurement.email", "Email")}
                  </TableHead>
                  <TableHead>{t("procurement.category", "Category")}</TableHead>
                  <TableHead>{t("procurement.rating", "Rating")}</TableHead>
                  <TableHead>{t("procurement.status", "Status")}</TableHead>
                  <TableHead className="text-right">
                    {t("procurement.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {t("procurement.noSuppliersFound", "No suppliers found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {supplier.phone}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {supplier.email}
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>
                        {supplier.rating ? renderRating(supplier.rating) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${supplier.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {supplier.status === "active"
                            ? t("procurement.active", "Active")
                            : t("procurement.inactive", "Inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {t("procurement.view", "View")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.topRatedSuppliers", "Top Rated Suppliers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSuppliers
                    .filter((s) => s.rating)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 3)
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {supplier.category}
                          </p>
                        </div>
                        {renderRating(supplier.rating || 0)}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t(
                    "procurement.onTimeDelivery",
                    "On-Time Delivery Performance",
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSuppliers
                    .filter((s) => s.onTimeDelivery)
                    .sort(
                      (a, b) =>
                        (b.onTimeDelivery || 0) - (a.onTimeDelivery || 0),
                    )
                    .slice(0, 3)
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {supplier.category}
                          </p>
                        </div>
                        <div className="font-medium">
                          {supplier.onTimeDelivery}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("procurement.qualityRating", "Quality Rating")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSuppliers
                    .filter((s) => s.qualityScore)
                    .sort(
                      (a, b) => (b.qualityScore || 0) - (a.qualityScore || 0),
                    )
                    .slice(0, 3)
                    .map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {supplier.category}
                          </p>
                        </div>
                        {renderRating(supplier.qualityScore || 0)}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("procurement.supplierPerformance", "Supplier Performance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("procurement.supplierName", "Supplier Name")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.category", "Category")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.totalOrders", "Total Orders")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.onTimeDelivery", "On-Time Delivery")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.qualityScore", "Quality Score")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.responseTime", "Response Time")}
                    </TableHead>
                    <TableHead>
                      {t("procurement.overallRating", "Overall Rating")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>{supplier.totalOrders || 0}</TableCell>
                      <TableCell>{supplier.onTimeDelivery || 0}%</TableCell>
                      <TableCell>
                        {supplier.qualityScore
                          ? renderRating(supplier.qualityScore)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {supplier.responseTime
                          ? renderRating(supplier.responseTime)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {supplier.rating ? renderRating(supplier.rating) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("procurement.contactInformation", "Contact Information")}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="font-medium">
                        {t("procurement.contactPerson", "Contact Person")}:
                      </span>{" "}
                      {selectedSupplier.contactPerson}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("procurement.phone", "Phone")}:
                      </span>{" "}
                      {selectedSupplier.phone}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("procurement.email", "Email")}:
                      </span>{" "}
                      {selectedSupplier.email}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("procurement.address", "Address")}:
                      </span>{" "}
                      {selectedSupplier.address || "-"}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("procurement.website", "Website")}:
                      </span>{" "}
                      {selectedSupplier.website || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">
                    {t("procurement.performance", "Performance")}
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span>
                        {t("procurement.overallRating", "Overall Rating")}:
                      </span>
                      {selectedSupplier.rating
                        ? renderRating(selectedSupplier.rating)
                        : "-"}
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("procurement.totalOrders", "Total Orders")}:
                      </span>
                      <span>{selectedSupplier.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("procurement.onTimeDelivery", "On-Time Delivery")}:
                      </span>
                      <span>{selectedSupplier.onTimeDelivery || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("procurement.qualityScore", "Quality Score")}:
                      </span>
                      {selectedSupplier.qualityScore
                        ? renderRating(selectedSupplier.qualityScore)
                        : "-"}
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("procurement.responseTime", "Response Time")}:
                      </span>
                      {selectedSupplier.responseTime
                        ? renderRating(selectedSupplier.responseTime)
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">
                  {t("procurement.notes", "Notes")}
                </h3>
                <p className="mt-2">{selectedSupplier.notes || "-"}</p>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    {t("procurement.ratings", "Ratings & Reviews")}
                  </h3>
                  <Button size="sm" onClick={handleAddRating}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t("procurement.addRating", "Add Rating")}
                  </Button>
                </div>

                <div className="mt-2 space-y-4">
                  {getSupplierRatings(selectedSupplier.id).length > 0 ? (
                    getSupplierRatings(selectedSupplier.id).map((rating) => (
                      <Card key={rating.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">
                                {t("procurement.orderNumber", "Order #")}:{" "}
                                {rating.orderNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  rating.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm">
                              {t("procurement.by", "By")}: {rating.createdBy}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            <div>
                              <p className="text-xs">
                                {t("procurement.delivery", "Delivery")}:
                              </p>
                              {renderRating(rating.deliveryRating)}
                            </div>
                            <div>
                              <p className="text-xs">
                                {t("procurement.quality", "Quality")}:
                              </p>
                              {renderRating(rating.qualityRating)}
                            </div>
                            <div>
                              <p className="text-xs">
                                {t(
                                  "procurement.communication",
                                  "Communication",
                                )}
                                :
                              </p>
                              {renderRating(rating.communicationRating)}
                            </div>
                            <div>
                              <p className="text-xs">
                                {t("procurement.pricing", "Pricing")}:
                              </p>
                              {renderRating(rating.pricingRating)}
                            </div>
                          </div>

                          {rating.comments && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">
                                {t("procurement.comments", "Comments")}:
                              </p>
                              <p className="text-sm">{rating.comments}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("procurement.noRatings", "No ratings yet")}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  {t("common.close", "Close")}
                </Button>
                <Button>{t("procurement.edit", "Edit")}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("procurement.addRating", "Add Supplier Rating")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">
                {t("procurement.orderNumber", "Order Number")}
              </Label>
              <Input
                id="orderNumber"
                placeholder="PO-2023-XXX"
                value={newRating.orderNumber}
                onChange={(e) =>
                  setNewRating({ ...newRating, orderNumber: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("procurement.delivery", "Delivery Rating")}</Label>
                <Select
                  value={newRating.deliveryRating.toString()}
                  onValueChange={(value) =>
                    setNewRating({
                      ...newRating,
                      deliveryRating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("procurement.quality", "Quality Rating")}</Label>
                <Select
                  value={newRating.qualityRating.toString()}
                  onValueChange={(value) =>
                    setNewRating({
                      ...newRating,
                      qualityRating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  {t("procurement.communication", "Communication Rating")}
                </Label>
                <Select
                  value={newRating.communicationRating.toString()}
                  onValueChange={(value) =>
                    setNewRating({
                      ...newRating,
                      communicationRating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("procurement.pricing", "Pricing Rating")}</Label>
                <Select
                  value={newRating.pricingRating.toString()}
                  onValueChange={(value) =>
                    setNewRating({
                      ...newRating,
                      pricingRating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">
                {t("procurement.comments", "Comments")}
              </Label>
              <Textarea
                id="comments"
                placeholder={t(
                  "procurement.enterComments",
                  "Enter your comments about this supplier",
                )}
                value={newRating.comments}
                onChange={(e) =>
                  setNewRating({ ...newRating, comments: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitRating}>
              {t("common.submit", "Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
