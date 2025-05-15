import React, { useState, useEffect } from "react";
import { clientConfigService } from "@/services/clientConfigService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { ClientTypeIndicator } from "../Beneficiary/ClientTypeIndicator";

interface PriceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
}

const mockPriceItems: Record<string, PriceItem[]> = {
  "FDF-2023": [
    {
      id: "fdf-001",
      name: "Bathroom Grab Bar Installation",
      category: "Safety",
      basePrice: 350,
      unit: "each",
    },
    {
      id: "fdf-002",
      name: "Non-Slip Flooring",
      category: "Safety",
      basePrice: 120,
      unit: "sqm",
    },
    {
      id: "fdf-003",
      name: "Wheelchair Ramp",
      category: "Accessibility",
      basePrice: 1200,
      unit: "each",
    },
    {
      id: "fdf-004",
      name: "Stair Lift",
      category: "Accessibility",
      basePrice: 5000,
      unit: "each",
    },
    {
      id: "fdf-005",
      name: "Bathroom Renovation",
      category: "Renovation",
      basePrice: 8000,
      unit: "complete",
    },
  ],
  "ADHA-2023": [
    {
      id: "adha-001",
      name: "Bathroom Grab Bar Installation",
      category: "Safety",
      basePrice: 300,
      unit: "each",
    },
    {
      id: "adha-002",
      name: "Non-Slip Flooring",
      category: "Safety",
      basePrice: 100,
      unit: "sqm",
    },
    {
      id: "adha-003",
      name: "Wheelchair Ramp",
      category: "Accessibility",
      basePrice: 1000,
      unit: "each",
    },
    {
      id: "adha-004",
      name: "Stair Lift",
      category: "Accessibility",
      basePrice: 4500,
      unit: "each",
    },
    {
      id: "adha-005",
      name: "Bathroom Renovation",
      category: "Renovation",
      basePrice: 7500,
      unit: "complete",
    },
  ],
  "STANDARD-2023": [
    {
      id: "std-001",
      name: "Bathroom Grab Bar Installation",
      category: "Safety",
      basePrice: 400,
      unit: "each",
    },
    {
      id: "std-002",
      name: "Non-Slip Flooring",
      category: "Safety",
      basePrice: 150,
      unit: "sqm",
    },
    {
      id: "std-003",
      name: "Wheelchair Ramp",
      category: "Accessibility",
      basePrice: 1500,
      unit: "each",
    },
    {
      id: "std-004",
      name: "Stair Lift",
      category: "Accessibility",
      basePrice: 6000,
      unit: "each",
    },
    {
      id: "std-005",
      name: "Bathroom Renovation",
      category: "Renovation",
      basePrice: 10000,
      unit: "complete",
    },
  ],
};

export const ClientAwarePriceList: React.FC = () => {
  const [activeClientTypeId, setActiveClientTypeId] = useState<number | null>(
    null,
  );
  const [priceListId, setPriceListId] = useState<string>("STANDARD-2023");
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [allowNegotiation, setAllowNegotiation] = useState<boolean>(false);

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
      const config = clientConfigService.getClientConfig(clientTypeId);
      if (config) {
        const newPriceListId = config.pricing.priceListId;
        setPriceListId(newPriceListId);
        setPriceItems(mockPriceItems[newPriceListId] || []);
        setDiscountPercentage(config.pricing.discountPercentage);
        setTaxPercentage(config.pricing.taxPercentage);
        setAllowNegotiation(config.pricing.allowNegotiation);
      }
    }
  };

  const calculateFinalPrice = (basePrice: number): number => {
    // Apply discount
    const afterDiscount = basePrice * (1 - discountPercentage / 100);
    // Apply tax
    const afterTax = afterDiscount * (1 + taxPercentage / 100);
    return Math.round(afterTax * 100) / 100; // Round to 2 decimal places
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Client-Aware Price List</CardTitle>
            <CardDescription>
              Prices are automatically adjusted based on the active client type
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
          <div className="flex flex-wrap gap-4 p-3 bg-muted/20 rounded-md">
            <div>
              <span className="text-sm font-medium block">Price List:</span>
              <span className="text-sm">{priceListId}</span>
            </div>
            <div>
              <span className="text-sm font-medium block">Discount:</span>
              <span className="text-sm">{discountPercentage}%</span>
            </div>
            <div>
              <span className="text-sm font-medium block">Tax:</span>
              <span className="text-sm">{taxPercentage}%</span>
            </div>
            <div>
              <span className="text-sm font-medium block">Negotiation:</span>
              <span className="text-sm">
                {allowNegotiation ? "Allowed" : "Not Allowed"}
              </span>
            </div>
          </div>

          {priceItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Base Price (AED)</TableHead>
                  <TableHead className="text-right">
                    Final Price (AED)
                  </TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceItems.map((item) => {
                  const finalPrice = calculateFinalPrice(item.basePrice);
                  const isFree = finalPrice === 0;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.basePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isFree ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Fully Subsidized
                          </Badge>
                        ) : (
                          finalPrice.toFixed(2)
                        )}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
              No price items available for the selected client type.
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
          {discountPercentage === 100
            ? "Full subsidy applied"
            : discountPercentage > 0
              ? `${discountPercentage}% discount applied`
              : "No discount applied"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientAwarePriceList;
