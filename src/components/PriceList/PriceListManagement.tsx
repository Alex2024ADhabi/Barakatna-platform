import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField, DatePicker } from "@/components/ui/form-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  FileText,
  Calendar,
  Tag,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
} from "lucide-react";

// Mock data for demonstration
const mockCategories = [
  { id: "cat-1", name: "Bathroom Fixtures", count: 24 },
  { id: "cat-2", name: "Kitchen Fixtures", count: 18 },
  { id: "cat-3", name: "Flooring", count: 15 },
  { id: "cat-4", name: "Lighting", count: 12 },
  { id: "cat-5", name: "Doors & Windows", count: 20 },
  { id: "cat-6", name: "Grab Bars & Supports", count: 10 },
  { id: "cat-7", name: "Ramps & Lifts", count: 8 },
];

const mockPriceListItems = [
  {
    id: "item-1",
    code: "BF-001",
    name: "Raised Toilet Seat",
    category: "Bathroom Fixtures",
    unitOfMeasure: "Each",
    unitPrice: 450,
    supplier: "AccessAbility Supplies",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "All",
    status: "active",
  },
  {
    id: "item-2",
    code: "BF-002",
    name: 'Grab Bar - Stainless Steel 18"',
    category: "Bathroom Fixtures",
    unitOfMeasure: "Each",
    unitPrice: 180,
    supplier: "SafetyFirst Equipment",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "All",
    status: "active",
  },
  {
    id: "item-3",
    code: "BF-003",
    name: "Non-Slip Bathroom Floor Tiles",
    category: "Bathroom Fixtures",
    unitOfMeasure: "Sq.m",
    unitPrice: 120,
    supplier: "SafetyFirst Equipment",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "All",
    status: "active",
  },
  {
    id: "item-4",
    code: "KF-001",
    name: "Accessible Kitchen Sink",
    category: "Kitchen Fixtures",
    unitOfMeasure: "Each",
    unitPrice: 1200,
    supplier: "Modern Home Solutions",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "ADHA",
    status: "active",
  },
  {
    id: "item-5",
    code: "KF-002",
    name: "Adjustable Height Counter",
    category: "Kitchen Fixtures",
    unitOfMeasure: "Linear m",
    unitPrice: 2500,
    supplier: "Modern Home Solutions",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "ADHA",
    status: "active",
  },
  {
    id: "item-6",
    code: "FL-001",
    name: "Anti-Slip Vinyl Flooring",
    category: "Flooring",
    unitOfMeasure: "Sq.m",
    unitPrice: 85,
    supplier: "FloorSafe Solutions",
    effectiveDate: new Date(2023, 0, 1),
    expiryDate: new Date(2023, 11, 31),
    clientType: "All",
    status: "active",
  },
];

interface PriceListManagementProps {
  // Props can be added as needed
}

const PriceListManagement: React.FC<PriceListManagementProps> = () => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [filteredItems, setFilteredItems] = useState(mockPriceListItems);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "cat-1",
  );

  // Filter price list items based on search and filters
  useEffect(() => {
    let result = mockPriceListItems;

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      const category = mockCategories.find(
        (cat) => cat.id === selectedCategory,
      );
      if (category) {
        result = result.filter((item) => item.category === category.name);
      }
    }

    if (selectedSupplier) {
      result = result.filter((item) => item.supplier === selectedSupplier);
    }

    if (selectedClientType) {
      result = result.filter(
        (item) =>
          item.clientType === selectedClientType || item.clientType === "All",
      );
    }

    setFilteredItems(result);
  }, [searchTerm, selectedCategory, selectedSupplier, selectedClientType]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setSelectedCategory(categoryId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("priceList.masterPriceList")}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {t("priceList.importPriceList")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("priceList.exportPriceList")}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("priceList.addItem")}
          </Button>
        </div>
      </div>

      {/* Price List Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("priceList.totalItems")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPriceListItems.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("priceList.categories")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("priceList.suppliers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("priceList.lastUpdated")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 1, 2023</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("priceList.searchItems")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SelectField
            label=""
            value={selectedSupplier}
            onChange={setSelectedSupplier}
            options={[
              { value: "", label: t("priceList.allSuppliers") },
              {
                value: "AccessAbility Supplies",
                label: "AccessAbility Supplies",
              },
              {
                value: "SafetyFirst Equipment",
                label: "SafetyFirst Equipment",
              },
              {
                value: "Modern Home Solutions",
                label: "Modern Home Solutions",
              },
              { value: "FloorSafe Solutions", label: "FloorSafe Solutions" },
            ]}
            placeholder={t("priceList.supplier")}
          />
          <SelectField
            label=""
            value={selectedClientType}
            onChange={setSelectedClientType}
            options={[
              { value: "", label: t("common.allClientTypes") },
              { value: "FDF", label: "FDF" },
              { value: "ADHA", label: "ADHA" },
              { value: "Cash", label: "Cash" },
              { value: "All", label: t("common.all") },
            ]}
            placeholder={t("beneficiary.clientType")}
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
              setSelectedSupplier("");
              setSelectedClientType("");
            }}
          >
            {t("common.buttons.reset")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 border rounded-md overflow-hidden">
          <div className="p-3 bg-muted font-medium">
            {t("priceList.categories")}
          </div>
          <div className="p-2">
            {mockCategories.map((category) => (
              <div key={category.id} className="mb-1">
                <div
                  className={`flex items-center p-2 rounded-md cursor-pointer ${selectedCategory === category.id ? "bg-primary/10" : "hover:bg-muted"}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategory === category.id ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <span className="flex-1">{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price List Items */}
        <div className="flex-1 border rounded-md overflow-hidden">
          <div className="p-3 bg-muted font-medium">
            {t("priceList.items")} ({filteredItems.length})
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">
                  {t("common.labels.code")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("common.labels.name")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("common.labels.category")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("common.labels.unit")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("common.labels.price")} (AED)
                </th>
                <th className="text-left p-3 font-medium">
                  {t("priceList.supplier")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("beneficiary.clientType")}
                </th>
                <th className="text-left p-3 font-medium">
                  {t("common.labels.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{item.code}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.unitOfMeasure}</td>
                    <td className="p-3">{item.unitPrice.toLocaleString()}</td>
                    <td className="p-3">{item.supplier}</td>
                    <td className="p-3">{item.clientType}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-muted-foreground"
                  >
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceListManagement;
