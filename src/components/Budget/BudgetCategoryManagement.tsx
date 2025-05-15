import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Upload,
  Copy,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FileText,
  ArrowUpDown,
  Filter,
  Save,
  X,
} from "lucide-react";

interface BudgetCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  accountingCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: BudgetCategory[];
}

interface BudgetCategoryTemplate {
  id: string;
  name: string;
  description: string;
  categories: BudgetCategory[];
  createdAt: string;
}

interface BudgetCategoryManagementProps {
  budgetId?: string;
}

const BudgetCategoryManagement = ({
  budgetId,
}: BudgetCategoryManagementProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [templates, setTemplates] = useState<BudgetCategoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("categories");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editCategory, setEditCategory] = useState<BudgetCategory | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<BudgetCategory>>({
    name: "",
    code: "",
    description: "",
    parentId: null,
    accountingCode: "",
    isActive: true,
  });
  const [editTemplate, setEditTemplate] =
    useState<BudgetCategoryTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<
    Partial<BudgetCategoryTemplate>
  >({
    name: "",
    description: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API endpoint
        // For now, we'll use mock data
        const mockCategories: BudgetCategory[] = [
          {
            id: "1",
            name: "Materials",
            code: "MAT",
            description: "All material costs for construction and renovation",
            parentId: null,
            accountingCode: "5000",
            isActive: true,
            createdAt: "2023-01-15T10:30:00Z",
            updatedAt: "2023-01-15T10:30:00Z",
            children: [
              {
                id: "1-1",
                name: "Construction Materials",
                code: "MAT-CON",
                description: "Materials used in construction",
                parentId: "1",
                accountingCode: "5100",
                isActive: true,
                createdAt: "2023-01-15T10:35:00Z",
                updatedAt: "2023-01-15T10:35:00Z",
                children: [
                  {
                    id: "1-1-1",
                    name: "Lumber",
                    code: "MAT-CON-LUM",
                    description: "Lumber and wood products",
                    parentId: "1-1",
                    accountingCode: "5110",
                    isActive: true,
                    createdAt: "2023-01-15T10:40:00Z",
                    updatedAt: "2023-01-15T10:40:00Z",
                  },
                  {
                    id: "1-1-2",
                    name: "Concrete",
                    code: "MAT-CON-CON",
                    description: "Concrete and cement products",
                    parentId: "1-1",
                    accountingCode: "5120",
                    isActive: true,
                    createdAt: "2023-01-15T10:45:00Z",
                    updatedAt: "2023-01-15T10:45:00Z",
                  },
                ],
              },
              {
                id: "1-2",
                name: "Finishing Materials",
                code: "MAT-FIN",
                description: "Materials used in finishing",
                parentId: "1",
                accountingCode: "5200",
                isActive: true,
                createdAt: "2023-01-15T11:00:00Z",
                updatedAt: "2023-01-15T11:00:00Z",
                children: [
                  {
                    id: "1-2-1",
                    name: "Paint",
                    code: "MAT-FIN-PAI",
                    description: "Paint and painting supplies",
                    parentId: "1-2",
                    accountingCode: "5210",
                    isActive: true,
                    createdAt: "2023-01-15T11:05:00Z",
                    updatedAt: "2023-01-15T11:05:00Z",
                  },
                  {
                    id: "1-2-2",
                    name: "Flooring",
                    code: "MAT-FIN-FLO",
                    description: "Flooring materials",
                    parentId: "1-2",
                    accountingCode: "5220",
                    isActive: false,
                    createdAt: "2023-01-15T11:10:00Z",
                    updatedAt: "2023-01-15T11:10:00Z",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            name: "Labor",
            code: "LAB",
            description: "All labor costs",
            parentId: null,
            accountingCode: "6000",
            isActive: true,
            createdAt: "2023-01-16T09:00:00Z",
            updatedAt: "2023-01-16T09:00:00Z",
            children: [
              {
                id: "2-1",
                name: "Skilled Labor",
                code: "LAB-SKL",
                description: "Skilled labor costs",
                parentId: "2",
                accountingCode: "6100",
                isActive: true,
                createdAt: "2023-01-16T09:05:00Z",
                updatedAt: "2023-01-16T09:05:00Z",
              },
              {
                id: "2-2",
                name: "Unskilled Labor",
                code: "LAB-USK",
                description: "Unskilled labor costs",
                parentId: "2",
                accountingCode: "6200",
                isActive: true,
                createdAt: "2023-01-16T09:10:00Z",
                updatedAt: "2023-01-16T09:10:00Z",
              },
            ],
          },
          {
            id: "3",
            name: "Equipment",
            code: "EQP",
            description: "Equipment costs",
            parentId: null,
            accountingCode: "7000",
            isActive: true,
            createdAt: "2023-01-17T10:00:00Z",
            updatedAt: "2023-01-17T10:00:00Z",
          },
          {
            id: "4",
            name: "Administrative",
            code: "ADM",
            description: "Administrative costs",
            parentId: null,
            accountingCode: "8000",
            isActive: false,
            createdAt: "2023-01-18T11:00:00Z",
            updatedAt: "2023-01-18T11:00:00Z",
          },
        ];

        const mockTemplates: BudgetCategoryTemplate[] = [
          {
            id: "1",
            name: "Standard Construction",
            description: "Standard categories for construction projects",
            categories: mockCategories,
            createdAt: "2023-01-20T09:00:00Z",
          },
          {
            id: "2",
            name: "Home Renovation",
            description: "Categories for home renovation projects",
            categories: mockCategories.filter((c) => c.id !== "4"),
            createdAt: "2023-01-21T10:00:00Z",
          },
          {
            id: "3",
            name: "Small Repairs",
            description: "Categories for small repair projects",
            categories: mockCategories.filter(
              (c) => c.id === "1" || c.id === "2",
            ),
            createdAt: "2023-01-22T11:00:00Z",
          },
        ];

        setCategories(mockCategories);
        setTemplates(mockTemplates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching budget categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleRefresh = () => {
    // In a real implementation, this would refresh the data from the API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditCategory(category);
  };

  const handleSaveCategory = () => {
    if (editCategory) {
      // In a real implementation, this would call an API endpoint to update the category
      setCategories((prev) =>
        updateCategoryInTree(prev, editCategory.id, editCategory),
      );
      setEditCategory(null);
    }
  };

  const handleCreateCategory = () => {
    // In a real implementation, this would call an API endpoint to create a new category
    const newCategoryWithId: BudgetCategory = {
      id: `new-${Date.now()}`,
      name: newCategory.name || "",
      code: newCategory.code || "",
      description: newCategory.description || "",
      parentId: newCategory.parentId || null,
      accountingCode: newCategory.accountingCode || "",
      isActive:
        newCategory.isActive !== undefined ? newCategory.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newCategoryWithId.parentId) {
      setCategories((prev) =>
        addChildCategoryToTree(
          prev,
          newCategoryWithId.parentId!,
          newCategoryWithId,
        ),
      );
    } else {
      setCategories((prev) => [...prev, newCategoryWithId]);
    }

    setNewCategory({
      name: "",
      code: "",
      description: "",
      parentId: null,
      accountingCode: "",
      isActive: true,
    });
    setShowNewCategoryDialog(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real implementation, this would call an API endpoint to delete the category
    setCategories((prev) => deleteCategoryFromTree(prev, categoryId));
  };

  const handleCreateTemplate = () => {
    // In a real implementation, this would call an API endpoint to create a new template
    const selectedCats = flattenCategories(categories).filter((cat) =>
      selectedCategories.includes(cat.id),
    );

    const newTemplateWithId: BudgetCategoryTemplate = {
      id: `new-${Date.now()}`,
      name: newTemplate.name || "",
      description: newTemplate.description || "",
      categories: selectedCats,
      createdAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, newTemplateWithId]);
    setNewTemplate({
      name: "",
      description: "",
    });
    setSelectedCategories([]);
    setShowNewTemplateDialog(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // In a real implementation, this would call an API endpoint to delete the template
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleApplyTemplate = (template: BudgetCategoryTemplate) => {
    // In a real implementation, this would call an API endpoint to apply the template
    setCategories(template.categories);
  };

  const updateCategoryInTree = (
    categories: BudgetCategory[],
    categoryId: string,
    updatedCategory: BudgetCategory,
  ): BudgetCategory[] => {
    return categories.map((category) => {
      if (category.id === categoryId) {
        return { ...category, ...updatedCategory };
      }
      if (category.children) {
        return {
          ...category,
          children: updateCategoryInTree(
            category.children,
            categoryId,
            updatedCategory,
          ),
        };
      }
      return category;
    });
  };

  const addChildCategoryToTree = (
    categories: BudgetCategory[],
    parentId: string,
    newCategory: BudgetCategory,
  ): BudgetCategory[] => {
    return categories.map((category) => {
      if (category.id === parentId) {
        return {
          ...category,
          children: [...(category.children || []), newCategory],
        };
      }
      if (category.children) {
        return {
          ...category,
          children: addChildCategoryToTree(
            category.children,
            parentId,
            newCategory,
          ),
        };
      }
      return category;
    });
  };

  const deleteCategoryFromTree = (
    categories: BudgetCategory[],
    categoryId: string,
  ): BudgetCategory[] => {
    return categories
      .filter((category) => category.id !== categoryId)
      .map((category) => {
        if (category.children) {
          return {
            ...category,
            children: deleteCategoryFromTree(category.children, categoryId),
          };
        }
        return category;
      });
  };

  const flattenCategories = (
    categories: BudgetCategory[],
  ): BudgetCategory[] => {
    let result: BudgetCategory[] = [];
    categories.forEach((category) => {
      result.push(category);
      if (category.children) {
        result = [...result, ...flattenCategories(category.children)];
      }
    });
    return result;
  };

  const getParentOptions = () => {
    return flattenCategories(categories).map((category) => ({
      value: category.id,
      label: category.name,
    }));
  };

  const renderCategoryTree = (categories: BudgetCategory[], depth = 0) => {
    const filteredCategories = categories.filter((category) => {
      const matchesSearch =
        searchTerm === "" ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.accountingCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterActive === "all" ||
        (filterActive === "active" && category.isActive) ||
        (filterActive === "inactive" && !category.isActive);

      return matchesSearch && matchesFilter;
    });

    const sortedCategories = [...filteredCategories].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return sortedCategories.map((category) => (
      <div key={category.id} className="mb-2">
        <div
          className={`flex items-center p-2 rounded-md ${depth > 0 ? "ml-6" : ""} ${
            depth > 1 ? "ml-12" : ""
          } hover:bg-accent`}
        >
          <div className="flex-1 flex items-center">
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleExpandCategory(category.id)}
                className="mr-2 p-1 hover:bg-accent-foreground/10 rounded-full"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium">{category.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({category.code})
                </span>
                {!category.isActive && (
                  <Badge variant="outline" className="ml-2">
                    {t("common.inactive")}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {category.description}
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mr-4">
            {category.accountingCode}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditCategory(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("budget.confirmDeleteCategory")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("budget.deleteWarning", { name: category.name })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNewCategory({
                  ...newCategory,
                  parentId: category.id,
                });
                setShowNewCategoryDialog(true);
              }}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {category.children &&
          expandedCategories.includes(category.id) &&
          renderCategoryTree(category.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.categoryManagement")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.categoryManagementDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("common.export")}
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {t("common.import")}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="categories"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="categories">{t("budget.categories")}</TabsTrigger>
          <TabsTrigger value="templates">{t("budget.templates")}</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("budget.searchCategories")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={filterActive}
                onValueChange={(value) =>
                  setFilterActive(value as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("budget.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="active">{t("common.active")}</SelectItem>
                  <SelectItem value="inactive">
                    {t("common.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "asc"
                  ? t("common.sortAscending")
                  : t("common.sortDescending")}
              </Button>
              <Button onClick={() => setShowNewCategoryDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("budget.addCategory")}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderTree className="mr-2 h-5 w-5" />
                {t("budget.categoryHierarchy")}
              </CardTitle>
              <CardDescription>
                {t("budget.categoryHierarchyDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-muted-foreground">
                    {t("budget.noCategories")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderCategoryTree(categories)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("budget.searchTemplates")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowNewTemplateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("budget.addTemplate")}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="flex h-20 items-center justify-center md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="flex h-20 items-center justify-center md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">
                  {t("budget.noTemplates")}
                </p>
              </div>
            ) : (
              templates
                .filter(
                  (template) =>
                    searchTerm === "" ||
                    template.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    template.description
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground">
                            {t("budget.categories")}:
                          </span>
                          <span className="font-medium">
                            {template.categories.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {t("budget.createdAt")}:
                          </span>
                          <span>
                            {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                      >
                        {t("budget.applyTemplate")}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("budget.confirmDeleteTemplate")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("budget.deleteTemplateWarning", {
                                  name: template.name,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("common.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteTemplate(template.id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {t("common.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Clone template
                            const clonedTemplate = {
                              ...template,
                              id: `new-${Date.now()}`,
                              name: `${template.name} (${t("common.copy")})`,
                              createdAt: new Date().toISOString(),
                            };
                            setTemplates((prev) => [...prev, clonedTemplate]);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog
        open={editCategory !== null}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("budget.editCategory")}</DialogTitle>
            <DialogDescription>
              {t("budget.editCategoryDescription")}
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t("common.name")}
                </Label>
                <Input
                  id="name"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  {t("budget.code")}
                </Label>
                <Input
                  id="code"
                  value={editCategory.code}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, code: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  {t("common.description")}
                </Label>
                <Input
                  id="description"
                  value={editCategory.description}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountingCode" className="text-right">
                  {t("budget.accountingCode")}
                </Label>
                <Input
                  id="accountingCode"
                  value={editCategory.accountingCode}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      accountingCode: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  {t("common.active")}
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="isActive"
                    checked={editCategory.isActive}
                    onCheckedChange={(checked) =>
                      setEditCategory({
                        ...editCategory,
                        isActive: checked === true,
                      })
                    }
                  />
                  <Label htmlFor="isActive">
                    {editCategory.isActive
                      ? t("common.active")
                      : t("common.inactive")}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveCategory}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog
        open={showNewCategoryDialog}
        onOpenChange={setShowNewCategoryDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("budget.addCategory")}</DialogTitle>
            <DialogDescription>
              {t("budget.addCategoryDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                {t("common.name")}
              </Label>
              <Input
                id="new-name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-code" className="text-right">
                {t("budget.code")}
              </Label>
              <Input
                id="new-code"
                value={newCategory.code}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, code: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">
                {t("common.description")}
              </Label>
              <Input
                id="new-description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-parent" className="text-right">
                {t("budget.parentCategory")}
              </Label>
              <Select
                value={newCategory.parentId || ""}
                onValueChange={(value) =>
                  setNewCategory({
                    ...newCategory,
                    parentId: value === "" ? null : value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("budget.selectParentCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("budget.noParent")}</SelectItem>
                  {getParentOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-accountingCode" className="text-right">
                {t("budget.accountingCode")}
              </Label>
              <Input
                id="new-accountingCode"
                value={newCategory.accountingCode}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    accountingCode: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-isActive" className="text-right">
                {t("common.active")}
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="new-isActive"
                  checked={newCategory.isActive}
                  onCheckedChange={(checked) =>
                    setNewCategory({
                      ...newCategory,
                      isActive: checked === true,
                    })
                  }
                />
                <Label htmlFor="new-isActive">
                  {newCategory.isActive
                    ? t("common.active")
                    : t("common.inactive")}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCategoryDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateCategory}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog
        open={showNewTemplateDialog}
        onOpenChange={setShowNewTemplateDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("budget.addTemplate")}</DialogTitle>
            <DialogDescription>
              {t("budget.addTemplateDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                {t("common.name")}
              </Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                {t("common.description")}
              </Label>
              <Input
                id="template-description"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                {t("budget.selectCategories")}
              </Label>
              <div className="col-span-3 border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {flattenCategories(categories).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([
                            ...selectedCategories,
                            category.id,
                          ]);
                        } else {
                          setSelectedCategories(
                            selectedCategories.filter(
                              (id) => id !== category.id,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="flex-1">
                      {category.name} ({category.code})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTemplateDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateTemplate}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetCategoryManagement;
