import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoices, deleteInvoice } from "@/lib/api/financial/financialApi";
import {
  Invoice,
  InvoiceStatus,
  InvoiceFilterParams,
} from "@/lib/api/financial/types";
import {
  Search,
  Plus,
  FileText,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";

interface InvoiceListProps {
  clientId?: string;
  clientType?: string;
  projectId?: string;
  onViewInvoice?: (invoice: Invoice) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onCreateInvoice?: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  clientId,
  clientType,
  projectId,
  onViewInvoice,
  onEditInvoice,
  onCreateInvoice,
}) => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<InvoiceFilterParams>({
    clientId,
    clientType,
    projectId,
  });

  useEffect(() => {
    fetchInvoices();
  }, [page, pageSize, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInvoices({
        page,
        pageSize,
        sortBy: "issueDate",
        sortDirection: "desc",
        ...filters,
      });

      if (response.success && response.data) {
        setInvoices(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || "Failed to fetch invoices");
      }
    } catch (err) {
      setError("An error occurred while fetching invoices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setFilters({
      ...filters,
      invoiceNumber: searchTerm || undefined,
    });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    setFilters({
      ...filters,
      status: status ? (status as InvoiceStatus) : undefined,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("Are you sure you want to delete this invoice?"))) {
      setLoading(true);
      try {
        const response = await deleteInvoice(id);
        if (response.success) {
          fetchInvoices();
        } else {
          setError(response.error || "Failed to delete invoice");
        }
      } catch (err) {
        setError("An error occurred while deleting the invoice");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Draft:
        return "bg-gray-200 text-gray-800";
      case InvoiceStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case InvoiceStatus.Approved:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.Paid:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.PartiallyPaid:
        return "bg-teal-100 text-teal-800";
      case InvoiceStatus.Overdue:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.Cancelled:
        return "bg-gray-100 text-gray-800";
      case InvoiceStatus.Rejected:
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "SAR",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("Invoices")}</CardTitle>
            <CardDescription>
              {t("Manage and track all invoices")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchInvoices}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onCreateInvoice && (
              <Button onClick={onCreateInvoice}>
                <Plus className="mr-2 h-4 w-4" />
                {t("New Invoice")}
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("Search by invoice number")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Filter by status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("All Statuses")}</SelectItem>
                <SelectItem value={InvoiceStatus.Draft}>
                  {t("Draft")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Pending}>
                  {t("Pending")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Approved}>
                  {t("Approved")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Paid}>{t("Paid")}</SelectItem>
                <SelectItem value={InvoiceStatus.PartiallyPaid}>
                  {t("Partially Paid")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Overdue}>
                  {t("Overdue")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Cancelled}>
                  {t("Cancelled")}
                </SelectItem>
                <SelectItem value={InvoiceStatus.Rejected}>
                  {t("Rejected")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("Items per page")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 {t("per page")}</SelectItem>
                <SelectItem value="10">10 {t("per page")}</SelectItem>
                <SelectItem value="20">20 {t("per page")}</SelectItem>
                <SelectItem value="50">50 {t("per page")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("No invoices found")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Invoice #")}</TableHead>
                  <TableHead>{t("Client")}</TableHead>
                  <TableHead>{t("Issue Date")}</TableHead>
                  <TableHead>{t("Due Date")}</TableHead>
                  <TableHead className="text-right">{t("Amount")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell
                      className="font-medium cursor-pointer"
                      onClick={() => onViewInvoice && onViewInvoice(invoice)}
                    >
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(invoice.status)}>
                        {t(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewInvoice && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewInvoice(invoice)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {onEditInvoice &&
                          invoice.status !== InvoiceStatus.Paid &&
                          invoice.status !== InvoiceStatus.Cancelled && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditInvoice(invoice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        {invoice.status === InvoiceStatus.Draft && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {t("Showing")} {(page - 1) * pageSize + 1} {t("to")}{" "}
                {Math.min(page * pageSize, totalCount)} {t("of")} {totalCount}{" "}
                {t("results")}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
