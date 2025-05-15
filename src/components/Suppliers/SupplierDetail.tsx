import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Clock,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supplierApi } from "@/lib/api/supplier/supplierApi";
import {
  integrationService,
  IntegrationType,
} from "@/services/integrationService";
import { offlineService } from "@/services/offlineService";
import {
  TextArea,
  TextInput,
  SelectField,
} from "@/components/ui/form-components";
import { toast } from "../ui/use-toast";
import {
  Supplier,
  SupplierDocument,
  SupplierOrder,
  SupplierReview,
} from "@/lib/api/supplier/types";

interface SupplierDetailProps {
  supplierId?: string;
}

const SupplierDetail = ({ supplierId = "SUP-001" }: SupplierDetailProps) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  // State for supplier data
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for orders
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // State for documents
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [uploadingDocument, setUploadingDocument] = useState<boolean>(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("PDF");

  // State for reviews
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [newReview, setNewReview] = useState<{
    rating: number;
    comment: string;
  }>({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // State for new order
  const [newOrder, setNewOrder] = useState<{
    items: string;
    quantity: number;
    amount: number;
    notes: string;
  }>({
    items: "",
    quantity: 1,
    amount: 0,
    notes: "",
  });
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [showNewOrderDialog, setShowNewOrderDialog] = useState<boolean>(false);
  const [showReviewDialog, setShowReviewDialog] = useState<boolean>(false);
  const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] =
    useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] =
    useState<SupplierDocument | null>(null);

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplierData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if we have offline data first
        const offlineData = await offlineService.getData<Supplier>(
          "supplier",
          supplierId,
        );

        if (offlineData) {
          setSupplier(offlineData);
          setLoading(false);
        }

        // Fetch from API
        const response = await supplierApi.getSupplierById(supplierId);

        if (response.success && response.data) {
          setSupplier(response.data);
          // Store for offline use
          await offlineService.storeData("supplier", supplierId, response.data);
        } else {
          if (!offlineData) {
            setError(
              response.error ||
                t("suppliers.errorLoading", "Error loading supplier data"),
            );
          }
        }
      } catch (err) {
        if (!offlineService.isOnline()) {
          toast({
            title: t("common.offlineMode", "Offline Mode"),
            description: t(
              "common.usingCachedData",
              "Using cached data. Some features may be limited.",
            ),
            variant: "warning",
          });
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [supplierId, t, toast]); // Added toast to dependency array

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await supplierApi.getSupplierOrders(supplierId);

      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        toast({
          title: t("suppliers.errorLoadingOrders", "Error Loading Orders"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.errorLoadingOrders", "Error Loading Orders"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    setLoadingDocuments(true);

    try {
      const response = await supplierApi.getSupplierDocuments(supplierId);

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        toast({
          title: t(
            "suppliers.errorLoadingDocuments",
            "Error Loading Documents",
          ),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.errorLoadingDocuments", "Error Loading Documents"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    setLoadingReviews(true);

    try {
      const response = await supplierApi.getSupplierReviews(supplierId);

      if (response.success && response.data) {
        setReviews(response.data);
      } else {
        toast({
          title: t("suppliers.errorLoadingReviews", "Error Loading Reviews"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.errorLoadingReviews", "Error Loading Reviews"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load data when tab changes
  const handleTabChange = (value: string) => {
    if (value === "orders" && orders.length === 0) {
      fetchOrders();
    } else if (value === "documents" && documents.length === 0) {
      fetchDocuments();
    } else if (value === "reviews" && reviews.length === 0) {
      fetchReviews();
    }
  };

  // Handle document upload
  const handleDocumentUpload = async () => {
    if (!documentFile || !documentName) {
      toast({
        title: t("suppliers.missingInformation", "Missing Information"),
        description: t(
          "suppliers.provideDocumentInfo",
          "Please provide a file and document name.",
        ),
        variant: "destructive",
      });
      return;
    }

    setUploadingDocument(true);

    try {
      const response = await supplierApi.uploadDocument({
        supplierId,
        name: documentName,
        type: documentType,
        file: documentFile,
      });

      if (response.success && response.data) {
        setDocuments([...documents, response.data]);
        setShowUploadDialog(false);
        setDocumentFile(null);
        setDocumentName("");
        setDocumentType("PDF");

        toast({
          title: t("suppliers.documentUploaded", "Document Uploaded"),
          description: t(
            "suppliers.documentUploadedSuccess",
            "Document was uploaded successfully.",
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("suppliers.uploadFailed", "Upload Failed"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.uploadFailed", "Upload Failed"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  // Handle document download
  const handleDocumentDownload = async (document: SupplierDocument) => {
    try {
      const response = await supplierApi.downloadDocument(document.id);

      if (response.success && response.data) {
        // Create a download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", document.name);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: t("suppliers.downloadStarted", "Download Started"),
          description: t(
            "suppliers.documentDownloading",
            "Your document is downloading.",
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("suppliers.downloadFailed", "Download Failed"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.downloadFailed", "Download Failed"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  // Handle document delete
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      const response = await supplierApi.deleteDocument(documentToDelete.id);

      if (response.success) {
        setDocuments(documents.filter((doc) => doc.id !== documentToDelete.id));
        setShowDeleteDocumentDialog(false);
        setDocumentToDelete(null);

        toast({
          title: t("suppliers.documentDeleted", "Document Deleted"),
          description: t(
            "suppliers.documentDeletedSuccess",
            "Document was deleted successfully.",
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("suppliers.deleteFailed", "Delete Failed"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.deleteFailed", "Delete Failed"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  // Handle new order submission
  const handleSubmitOrder = async () => {
    if (!newOrder.items || newOrder.quantity <= 0 || newOrder.amount <= 0) {
      toast({
        title: t("suppliers.missingInformation", "Missing Information"),
        description: t(
          "suppliers.provideOrderInfo",
          "Please provide all required order information.",
        ),
        variant: "destructive",
      });
      return;
    }

    setSubmittingOrder(true);

    try {
      const response = await supplierApi.createOrder({
        supplierId,
        items: newOrder.items,
        quantity: newOrder.quantity,
        amount: newOrder.amount,
        notes: newOrder.notes,
      });

      if (response.success && response.data) {
        setOrders([...orders, response.data]);
        setShowNewOrderDialog(false);
        setNewOrder({ items: "", quantity: 1, amount: 0, notes: "" });

        // Notify the order management system via integration service
        await integrationService.execute({
          providerId: "order-management-system",
          action: "create-order",
          payload: response.data,
        });

        toast({
          title: t("suppliers.orderCreated", "Order Created"),
          description: t(
            "suppliers.orderCreatedSuccess",
            "Order was created successfully.",
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("suppliers.orderFailed", "Order Creation Failed"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.orderFailed", "Order Creation Failed"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (newReview.rating < 1 || !newReview.comment) {
      toast({
        title: t("suppliers.missingInformation", "Missing Information"),
        description: t(
          "suppliers.provideReviewInfo",
          "Please provide a rating and comment.",
        ),
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await supplierApi.createReview({
        supplierId,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      if (response.success && response.data) {
        setReviews([...reviews, response.data]);
        setShowReviewDialog(false);
        setNewReview({ rating: 5, comment: "" });

        // Update supplier rating if we have the supplier data
        if (supplier) {
          // Calculate new average rating
          const totalRatings = reviews.length + 1;
          const sumRatings =
            reviews.reduce((sum, review) => sum + review.rating, 0) +
            newReview.rating;
          const newAverageRating = sumRatings / totalRatings;

          setSupplier({
            ...supplier,
            rating: parseFloat(newAverageRating.toFixed(1)),
          });
        }

        toast({
          title: t("suppliers.reviewSubmitted", "Review Submitted"),
          description: t(
            "suppliers.reviewSubmittedSuccess",
            "Your review was submitted successfully.",
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("suppliers.reviewFailed", "Review Submission Failed"),
          description:
            response.error ||
            t("suppliers.tryAgainLater", "Please try again later."),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("suppliers.reviewFailed", "Review Submission Failed"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ★
          </span>,
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ★
          </span>,
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>,
        );
      }
    }
    return stars;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          <p className="ml-4 text-lg text-gray-500">
            {t("common.loading", "Loading...")}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !supplier) {
    return (
      <Card className="w-full bg-white">
        <CardContent className="flex flex-col items-center justify-center p-10">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <p className="text-lg text-gray-700 mb-2">
            {t("suppliers.errorLoading", "Error loading supplier data")}
          </p>
          <p className="text-gray-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            {t("common.retry", "Retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={supplier.logo} alt={supplier.name} />
              <AvatarFallback>
                {supplier.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {isRTL && supplier.arabicName
                  ? supplier.arabicName
                  : supplier.name}
              </CardTitle>
              <div className="flex items-center mt-1">
                <div className="mr-2">{renderRatingStars(supplier.rating)}</div>
                <span className="text-sm text-gray-500">
                  {supplier.rating}/5
                </span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(supplier.status)}>
            {t(
              `suppliers.status.${supplier.status}`,
              supplier.status.charAt(0).toUpperCase() +
                supplier.status.slice(1),
            )}
          </Badge>
        </div>
        <CardDescription className="mt-4">
          {supplier.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="info">
              {t("suppliers.information", "Information")}
            </TabsTrigger>
            <TabsTrigger value="orders">
              {t("suppliers.orders", "Orders")}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t("suppliers.documents", "Documents")}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              {t("suppliers.reviews", "Reviews")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("suppliers.contactInformation", "Contact Information")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{supplier.address}</span>
                  </div>
                  {supplier.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{supplier.website}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("suppliers.specialties", "Specialties")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supplier.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("suppliers.orderHistory", "Order History")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("suppliers.orderId", "Order ID")}
                        </TableHead>
                        <TableHead>{t("suppliers.date", "Date")}</TableHead>
                        <TableHead>{t("suppliers.items", "Items")}</TableHead>
                        <TableHead>
                          {t("suppliers.quantity", "Quantity")}
                        </TableHead>
                        <TableHead>
                          {t("suppliers.amount", "Amount (AED)")}
                        </TableHead>
                        <TableHead>{t("suppliers.status", "Status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{formatDate(order.date)}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {t(
                                `suppliers.status.${order.status}`,
                                order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1),
                              )}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t(
                      "suppliers.noOrders",
                      "No orders found for this supplier.",
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  {t("suppliers.totalOrders", "Total Orders")}: {orders.length}
                </div>
                <Dialog
                  open={showNewOrderDialog}
                  onOpenChange={setShowNewOrderDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {t("suppliers.newOrder", "New Order")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("suppliers.createNewOrder", "Create New Order")}
                      </DialogTitle>
                      <DialogDescription>
                        {t("suppliers.placeNewOrder", "Place a new order with")}{" "}
                        {supplier.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <TextInput
                        label={t("suppliers.items", "Items")}
                        value={newOrder.items}
                        onChange={(value) =>
                          setNewOrder({ ...newOrder, items: value })
                        }
                        placeholder={t(
                          "suppliers.itemsPlaceholder",
                          "Enter item description",
                        )}
                        required
                      />
                      <TextInput
                        label={t("suppliers.quantity", "Quantity")}
                        value={String(newOrder.quantity)}
                        onChange={(value) =>
                          setNewOrder({
                            ...newOrder,
                            quantity: parseInt(value) || 0,
                          })
                        }
                        type="number"
                        min="1"
                        required
                      />
                      <TextInput
                        label={t("suppliers.amount", "Amount (AED)")}
                        value={String(newOrder.amount)}
                        onChange={(value) =>
                          setNewOrder({
                            ...newOrder,
                            amount: parseFloat(value) || 0,
                          })
                        }
                        type="number"
                        min="0"
                        required
                      />
                      <TextArea
                        label={t("suppliers.notes", "Notes")}
                        value={newOrder.notes}
                        onChange={(value) =>
                          setNewOrder({ ...newOrder, notes: value })
                        }
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewOrderDialog(false)}
                        disabled={submittingOrder}
                      >
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={submittingOrder}
                      >
                        {submittingOrder && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("suppliers.createOrder", "Create Order")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("suppliers.documents", "Documents")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDocuments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-3 text-blue-500" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-gray-500">
                                  {doc.type} • {doc.size} •{" "}
                                  {t("suppliers.uploadedOn", "Uploaded")}{" "}
                                  {formatDate(doc.uploadDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDocumentDownload(doc)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {t("common.download", "Download")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setDocumentToDelete(doc);
                                  setShowDeleteDocumentDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {t("common.delete", "Delete")}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {t(
                            "suppliers.noDocuments",
                            "No documents found for this supplier.",
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter>
                <Dialog
                  open={showUploadDialog}
                  onOpenChange={setShowUploadDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      {t("suppliers.uploadNewDocument", "Upload New Document")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("suppliers.uploadDocument", "Upload Document")}
                      </DialogTitle>
                      <DialogDescription>
                        {t(
                          "suppliers.uploadDocumentDescription",
                          "Upload a document for this supplier.",
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <TextInput
                        label={t("suppliers.documentName", "Document Name")}
                        value={documentName}
                        onChange={setDocumentName}
                        placeholder={t(
                          "suppliers.documentNamePlaceholder",
                          "Enter document name",
                        )}
                        required
                      />
                      <SelectField
                        label={t("suppliers.documentType", "Document Type")}
                        value={documentType}
                        onChange={setDocumentType}
                        options={[
                          "PDF",
                          "DOC",
                          "DOCX",
                          "XLS",
                          "XLSX",
                          "JPG",
                          "PNG",
                        ]}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("suppliers.selectFile", "Select File")}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="file"
                          className="w-full border border-gray-300 rounded-md p-2"
                          onChange={(e) =>
                            setDocumentFile(e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowUploadDialog(false)}
                        disabled={uploadingDocument}
                      >
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button
                        onClick={handleDocumentUpload}
                        disabled={uploadingDocument || !documentFile}
                      >
                        {uploadingDocument && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("suppliers.upload", "Upload")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("suppliers.reviews", "Reviews & Ratings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReviews ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {review.userName
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {review.userName}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {renderRatingStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t(
                          "suppliers.noReviews",
                          "No reviews yet for this supplier.",
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Dialog
                  open={showReviewDialog}
                  onOpenChange={setShowReviewDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Star className="mr-2 h-4 w-4" />
                      {t("suppliers.writeReview", "Write a Review")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("suppliers.writeReview", "Write a Review")}
                      </DialogTitle>
                      <DialogDescription>
                        {t(
                          "suppliers.shareYourExperience",
                          "Share your experience with",
                        )}{" "}
                        {supplier.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("suppliers.rating", "Rating")}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="text-2xl focus:outline-none"
                              onClick={() =>
                                setNewReview({ ...newReview, rating: star })
                              }
                            >
                              <span
                                className={
                                  star <= newReview.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <TextArea
                        label={t("suppliers.comment", "Comment")}
                        value={newReview.comment}
                        onChange={(value) =>
                          setNewReview({ ...newReview, comment: value })
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewDialog(false)}
                        disabled={submittingReview}
                      >
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                      >
                        {submittingReview && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("suppliers.submitReview", "Submit Review")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Document Confirmation Dialog */}
      <Dialog
        open={showDeleteDocumentDialog}
        onOpenChange={setShowDeleteDocumentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.confirmDelete", "Confirm Delete")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "suppliers.confirmDeleteDocument",
                "Are you sure you want to delete this document? This action cannot be undone.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {documentToDelete && (
              <div className="flex items-center p-3 border rounded-md bg-gray-50">
                <FileText className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">{documentToDelete.name}</p>
                  <p className="text-sm text-gray-500">
                    {documentToDelete.type} • {documentToDelete.size}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDocumentDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              {t("common.delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SupplierDetail;
