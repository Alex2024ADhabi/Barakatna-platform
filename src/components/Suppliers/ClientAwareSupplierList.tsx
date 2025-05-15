import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { clientConfigService } from "@/services/clientConfigService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTypeIndicator } from "@/components/Beneficiary/ClientTypeIndicator";
import { Check, X, Search, Star, FileText } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  approvedForClientTypes: number[];
  specialPricing: boolean;
  contactPerson: string;
  phone: string;
}

export const ClientAwareSupplierList: React.FC = () => {
  const { t } = useTranslation();
  const [activeClientTypeId, setActiveClientTypeId] = useState<number | null>(
    null,
  );
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with current active client type
    updateFromClientConfig();

    // Subscribe to client config changes
    const removeListener = clientConfigService.addChangeListener(() => {
      updateFromClientConfig();
    });

    return () => removeListener();
  }, []);

  const updateFromClientConfig = () => {
    const clientTypeId = clientConfigService.getActiveClientType();
    setActiveClientTypeId(clientTypeId);

    if (clientTypeId) {
      // Filter suppliers approved for this client type
      const suppliers = mockSuppliers.filter((supplier) =>
        supplier.approvedForClientTypes.includes(clientTypeId),
      );
      setFilteredSuppliers(suppliers);
    } else {
      setFilteredSuppliers([]);
    }
    setIsLoading(false);
  };

  // Apply search filter
  useEffect(() => {
    if (!activeClientTypeId) return;

    const suppliers = mockSuppliers.filter((supplier) =>
      supplier.approvedForClientTypes.includes(activeClientTypeId),
    );

    if (searchTerm) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchTerm, activeClientTypeId]);

  const getClientTypeName = (clientTypeId: number | null): string => {
    if (clientTypeId === null) return "None";

    // Get client type from configuration service
    const config = clientConfigService.getClientConfig(clientTypeId);
    if (config) {
      // In a real implementation, we would store the client type name in the config
      // For now, we'll use the hardcoded values for known types and a generic name for others
      switch (clientTypeId) {
        case 1:
          return "Family Development Foundation (FDF)";
        case 2:
          return "Abu Dhabi Housing Authority (ADHA)";
        case 3:
          return "Cash-Based Client";
        default:
          return `Client Type ${clientTypeId}`;
      }
    }

    return `Client Type ${clientTypeId}`;
  };

  const renderRating = (rating: number) => {
    const stars =
      "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    return (
      <span className="text-amber-500">
        {stars} <span className="text-foreground">({rating})</span>
      </span>
    );
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {t("supplier.clientAwareList", "Client-Aware Supplier List")}
            </CardTitle>
            <CardDescription>
              {t(
                "supplier.clientAwareListDescription",
                "Suppliers are filtered based on the active client type",
              )}
            </CardDescription>
          </div>
          {activeClientTypeId && (
            <ClientTypeIndicator
              clientTypeId={activeClientTypeId}
              showLabel={true}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("supplier.searchSuppliers", "Search suppliers...")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeClientTypeId ? (
            filteredSuppliers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Special Pricing</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>{renderRating(supplier.rating)}</TableCell>
                      <TableCell>
                        {supplier.specialPricing ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Available
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1"
                          >
                            <X className="h-3 w-3" /> Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{supplier.contactPerson}</div>
                        <div className="text-xs text-muted-foreground">
                          {supplier.phone}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                No approved suppliers found for this client type.
              </div>
            )
          ) : (
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
              Please select a client type to view approved suppliers.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div>
          Active Client:{" "}
          {activeClientTypeId
            ? getClientTypeName(activeClientTypeId)
            : "None selected"}
        </div>
        <div>
          {filteredSuppliers.length} supplier
          {filteredSuppliers.length !== 1 ? "s" : ""} available
        </div>
      </CardFooter>
    </Card>
  );
};

const mockSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "AlSafety Home Modifications",
    category: "Safety Equipment",
    rating: 4.8,
    approvedForClientTypes: [1, 2, 3],
    specialPricing: true,
    contactPerson: "Ahmed Al Mansouri",
    phone: "050-123-4567",
  },
  {
    id: "sup-002",
    name: "Accessibility Solutions LLC",
    category: "Accessibility Equipment",
    rating: 4.5,
    approvedForClientTypes: [1, 2],
    specialPricing: true,
    contactPerson: "Sarah Johnson",
    phone: "050-234-5678",
  },
  {
    id: "sup-003",
    name: "Emirates Renovation Experts",
    category: "Home Renovation",
    rating: 4.2,
    approvedForClientTypes: [2, 3],
    specialPricing: false,
    contactPerson: "Mohammed Al Hashimi",
    phone: "050-345-6789",
  },
  {
    id: "sup-004",
    name: "Abu Dhabi Medical Supplies",
    category: "Medical Equipment",
    rating: 4.7,
    approvedForClientTypes: [1],
    specialPricing: true,
    contactPerson: "Fatima Al Zaabi",
    phone: "050-456-7890",
  },
  {
    id: "sup-005",
    name: "Premium Home Services",
    category: "General Contracting",
    rating: 3.9,
    approvedForClientTypes: [3],
    specialPricing: false,
    contactPerson: "John Smith",
    phone: "050-567-8901",
  },
];

export default ClientAwareSupplierList;
