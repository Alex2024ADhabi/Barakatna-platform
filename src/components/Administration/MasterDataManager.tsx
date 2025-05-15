import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Download,
  Upload,
  Add,
  Edit,
  Delete,
  History,
  Save,
  Close,
  Check,
  Warning,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
  version: number;
  lastUpdated: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId: string;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  rule: string;
  isActive: boolean;
}

interface VersionHistory {
  id: string;
  entityId: string;
  entityType: "category" | "subcategory" | "validation";
  version: number;
  changedBy: string;
  changeDate: string;
  changes: string;
}

const MasterDataManager: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
  });
  const [newSubcategory, setNewSubcategory] = useState<Partial<Subcategory>>({
    name: "",
    description: "",
    parentCategoryId: "",
  });
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({
    name: "",
    description: "",
    categoryId: "",
    rule: "",
    isActive: true,
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call to fetch data
    const mockCategories: Category[] = [
      {
        id: "1",
        name: "Room Types",
        description: "Types of rooms in a home",
        subcategories: [
          {
            id: "101",
            name: "Bathroom",
            description: "Bathroom types",
            parentCategoryId: "1",
          },
          {
            id: "102",
            name: "Kitchen",
            description: "Kitchen types",
            parentCategoryId: "1",
          },
          {
            id: "103",
            name: "Bedroom",
            description: "Bedroom types",
            parentCategoryId: "1",
          },
        ],
        version: 1,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Modification Types",
        description: "Types of home modifications",
        subcategories: [
          {
            id: "201",
            name: "Accessibility",
            description: "Accessibility modifications",
            parentCategoryId: "2",
          },
          {
            id: "202",
            name: "Safety",
            description: "Safety modifications",
            parentCategoryId: "2",
          },
        ],
        version: 2,
        lastUpdated: new Date().toISOString(),
      },
    ];

    const mockValidationRules: ValidationRule[] = [
      {
        id: "1",
        name: "Room Type Required",
        description: "Room type must be specified",
        categoryId: "1",
        rule: "required",
        isActive: true,
      },
      {
        id: "2",
        name: "Modification Type Required",
        description: "Modification type must be specified",
        categoryId: "2",
        rule: "required",
        isActive: true,
      },
    ];

    const mockVersionHistory: VersionHistory[] = [
      {
        id: "1",
        entityId: "1",
        entityType: "category",
        version: 1,
        changedBy: "Admin",
        changeDate: new Date().toISOString(),
        changes: "Created category",
      },
      {
        id: "2",
        entityId: "2",
        entityType: "category",
        version: 1,
        changedBy: "Admin",
        changeDate: new Date(Date.now() - 86400000).toISOString(),
        changes: "Created category",
      },
      {
        id: "3",
        entityId: "2",
        entityType: "category",
        version: 2,
        changedBy: "Admin",
        changeDate: new Date().toISOString(),
        changes: "Updated description",
      },
    ];

    setCategories(mockCategories);
    setValidationRules(mockValidationRules);
    setVersionHistory(mockVersionHistory);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleAddCategory = () => {
    setNewCategory({ name: "", description: "" });
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory({ ...category });
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!newCategory.name) {
      showSnackbar("Category name is required", "error");
      return;
    }

    if (selectedCategory) {
      // Update existing category
      const updatedCategories = categories.map((cat) =>
        cat.id === selectedCategory.id
          ? {
              ...cat,
              name: newCategory.name || "",
              description: newCategory.description || "",
              version: cat.version + 1,
              lastUpdated: new Date().toISOString(),
            }
          : cat,
      );
      setCategories(updatedCategories);

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: selectedCategory.id,
        entityType: "category",
        version: selectedCategory.version + 1,
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Updated category details",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Category updated successfully", "success");
    } else {
      // Add new category
      const newCategoryObj: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCategory.name || "",
        description: newCategory.description || "",
        subcategories: [],
        version: 1,
        lastUpdated: new Date().toISOString(),
      };
      setCategories([...categories, newCategoryObj]);

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: newCategoryObj.id,
        entityType: "category",
        version: 1,
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Created new category",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Category added successfully", "success");
    }
    setOpenCategoryDialog(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
    setCategories(updatedCategories);
    showSnackbar("Category deleted successfully", "success");
  };

  const handleAddSubcategory = (categoryId: string) => {
    setNewSubcategory({
      name: "",
      description: "",
      parentCategoryId: categoryId,
    });
    setOpenSubcategoryDialog(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setNewSubcategory({ ...subcategory });
    setOpenSubcategoryDialog(true);
  };

  const handleSaveSubcategory = () => {
    if (!newSubcategory.name || !newSubcategory.parentCategoryId) {
      showSnackbar(
        "Subcategory name and parent category are required",
        "error",
      );
      return;
    }

    const parentCategoryIndex = categories.findIndex(
      (cat) => cat.id === newSubcategory.parentCategoryId,
    );
    if (parentCategoryIndex === -1) {
      showSnackbar("Parent category not found", "error");
      return;
    }

    const updatedCategories = [...categories];
    const parentCategory = updatedCategories[parentCategoryIndex];

    if (selectedSubcategory) {
      // Update existing subcategory
      const updatedSubcategories = parentCategory.subcategories.map((sub) =>
        sub.id === selectedSubcategory.id
          ? {
              ...sub,
              name: newSubcategory.name || "",
              description: newSubcategory.description || "",
            }
          : sub,
      );
      updatedCategories[parentCategoryIndex] = {
        ...parentCategory,
        subcategories: updatedSubcategories,
        version: parentCategory.version + 1,
        lastUpdated: new Date().toISOString(),
      };

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: selectedSubcategory.id,
        entityType: "subcategory",
        version: parentCategory.version + 1,
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Updated subcategory details",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Subcategory updated successfully", "success");
    } else {
      // Add new subcategory
      const newSubcategoryObj: Subcategory = {
        id: Math.random().toString(36).substr(2, 9),
        name: newSubcategory.name || "",
        description: newSubcategory.description || "",
        parentCategoryId: newSubcategory.parentCategoryId || "",
      };
      updatedCategories[parentCategoryIndex] = {
        ...parentCategory,
        subcategories: [...parentCategory.subcategories, newSubcategoryObj],
        version: parentCategory.version + 1,
        lastUpdated: new Date().toISOString(),
      };

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: newSubcategoryObj.id,
        entityType: "subcategory",
        version: parentCategory.version + 1,
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Created new subcategory",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Subcategory added successfully", "success");
    }
    setCategories(updatedCategories);
    setOpenSubcategoryDialog(false);
    setSelectedSubcategory(null);
  };

  const handleDeleteSubcategory = (
    categoryId: string,
    subcategoryId: string,
  ) => {
    const categoryIndex = categories.findIndex((cat) => cat.id === categoryId);
    if (categoryIndex === -1) return;

    const updatedCategories = [...categories];
    const category = updatedCategories[categoryIndex];
    const updatedSubcategories = category.subcategories.filter(
      (sub) => sub.id !== subcategoryId,
    );

    updatedCategories[categoryIndex] = {
      ...category,
      subcategories: updatedSubcategories,
      version: category.version + 1,
      lastUpdated: new Date().toISOString(),
    };

    setCategories(updatedCategories);
    showSnackbar("Subcategory deleted successfully", "success");
  };

  const handleAddRule = () => {
    setNewRule({
      name: "",
      description: "",
      categoryId: "",
      rule: "",
      isActive: true,
    });
    setOpenRuleDialog(true);
  };

  const handleEditRule = (rule: ValidationRule) => {
    setSelectedRule(rule);
    setNewRule({ ...rule });
    setOpenRuleDialog(true);
  };

  const handleSaveRule = () => {
    if (!newRule.name || !newRule.categoryId || !newRule.rule) {
      showSnackbar(
        "Rule name, category, and rule definition are required",
        "error",
      );
      return;
    }

    if (selectedRule) {
      // Update existing rule
      const updatedRules = validationRules.map((rule) =>
        rule.id === selectedRule.id
          ? {
              ...rule,
              name: newRule.name || "",
              description: newRule.description || "",
              categoryId: newRule.categoryId || "",
              rule: newRule.rule || "",
              isActive: newRule.isActive || false,
            }
          : rule,
      );
      setValidationRules(updatedRules);

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: selectedRule.id,
        entityType: "validation",
        version: 1, // Simplified versioning for rules
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Updated validation rule",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Rule updated successfully", "success");
    } else {
      // Add new rule
      const newRuleObj: ValidationRule = {
        id: Math.random().toString(36).substr(2, 9),
        name: newRule.name || "",
        description: newRule.description || "",
        categoryId: newRule.categoryId || "",
        rule: newRule.rule || "",
        isActive: newRule.isActive || false,
      };
      setValidationRules([...validationRules, newRuleObj]);

      // Add to version history
      const newHistoryEntry: VersionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: newRuleObj.id,
        entityType: "validation",
        version: 1,
        changedBy: "Current User",
        changeDate: new Date().toISOString(),
        changes: "Created new validation rule",
      };
      setVersionHistory([...versionHistory, newHistoryEntry]);

      showSnackbar("Rule added successfully", "success");
    }
    setOpenRuleDialog(false);
    setSelectedRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = validationRules.filter((rule) => rule.id !== ruleId);
    setValidationRules(updatedRules);
    showSnackbar("Rule deleted successfully", "success");
  };

  const handleToggleRuleStatus = (ruleId: string) => {
    const updatedRules = validationRules.map((rule) =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule,
    );
    setValidationRules(updatedRules);
    const rule = updatedRules.find((r) => r.id === ruleId);
    showSnackbar(
      `Rule ${rule?.isActive ? "activated" : "deactivated"} successfully`,
      "success",
    );
  };

  const handleViewHistory = (
    entityId: string,
    entityType: "category" | "subcategory" | "validation",
  ) => {
    setOpenHistoryDialog(true);
  };

  const handleExportData = () => {
    // Create export data object
    const exportData = {
      categories,
      validationRules,
      versionHistory,
      exportDate: new Date().toISOString(),
      exportedBy: "Current User",
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `master_data_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSnackbar("Data exported successfully", "success");
  };

  const handleImportData = () => {
    setOpenImportDialog(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0]);
    }
  };

  const handleImportConfirm = () => {
    if (!importFile) {
      showSnackbar("Please select a file to import", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importedData = JSON.parse(result);

        // Validate imported data structure
        if (!importedData.categories || !importedData.validationRules) {
          throw new Error("Invalid import file format");
        }

        // Update state with imported data
        setCategories(importedData.categories);
        setValidationRules(importedData.validationRules);
        if (importedData.versionHistory) {
          setVersionHistory(importedData.versionHistory);
        }

        showSnackbar("Data imported successfully", "success");
        setOpenImportDialog(false);
        setImportFile(null);
      } catch (error) {
        showSnackbar("Error importing data: Invalid file format", "error");
      }
    };
    reader.readAsText(importFile);
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="master data management tabs"
        >
          <Tab label={t("Categories")} value="categories" />
          <Tab label={t("Validation Rules")} value="validation" />
          <Tab label={t("Version History")} value="history" />
        </Tabs>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportData}
            sx={{ mr: 1 }}
          >
            {t("Export")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={handleImportData}
          >
            {t("Import")}
          </Button>
        </Box>
      </Box>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {t("Categories and Subcategories")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddCategory}
            >
              {t("Add Category")}
            </Button>
          </Box>

          {categories.map((category) => (
            <Paper key={category.id} sx={{ mb: 2, p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={`v${category.version}`}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      size="small"
                      label={`Updated: ${formatDate(category.lastUpdated)}`}
                    />
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => handleEditCategory(category)}
                    size="small"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteCategory(category.id)}
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleViewHistory(category.id, "category")}
                    size="small"
                  >
                    <History fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleAddSubcategory(category.id)}
                    size="small"
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {category.subcategories.length > 0 && (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Subcategory Name")}</TableCell>
                        <TableCell>{t("Description")}</TableCell>
                        <TableCell align="right">{t("Actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.subcategories.map((subcategory) => (
                        <TableRow key={subcategory.id}>
                          <TableCell>{subcategory.name}</TableCell>
                          <TableCell>{subcategory.description}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => handleEditSubcategory(subcategory)}
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                handleDeleteSubcategory(
                                  category.id,
                                  subcategory.id,
                                )
                              }
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                handleViewHistory(subcategory.id, "subcategory")
                              }
                              size="small"
                            >
                              <History fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {category.subcategories.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {t(
                    "No subcategories found. Click the + button to add a subcategory.",
                  )}
                </Typography>
              )}
            </Paper>
          ))}

          {categories.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                'No categories found. Click the "Add Category" button to create one.',
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Validation Rules Tab */}
      {activeTab === "validation" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("Validation Rules")}</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddRule}
            >
              {t("Add Rule")}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Rule Name")}</TableCell>
                  <TableCell>{t("Description")}</TableCell>
                  <TableCell>{t("Category")}</TableCell>
                  <TableCell>{t("Rule Definition")}</TableCell>
                  <TableCell>{t("Status")}</TableCell>
                  <TableCell align="right">{t("Actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>{getCategoryName(rule.categoryId)}</TableCell>
                    <TableCell>
                      <code>{rule.rule}</code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.isActive ? t("Active") : t("Inactive")}
                        color={rule.isActive ? "success" : "default"}
                        size="small"
                        onClick={() => handleToggleRuleStatus(rule.id)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditRule(rule)}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteRule(rule.id)}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleViewHistory(rule.id, "validation")}
                        size="small"
                      >
                        <History fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {validationRules.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                'No validation rules found. Click the "Add Rule" button to create one.',
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Version History Tab */}
      {activeTab === "history" && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("Version History")}
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Entity Type")}</TableCell>
                  <TableCell>{t("Version")}</TableCell>
                  <TableCell>{t("Changed By")}</TableCell>
                  <TableCell>{t("Change Date")}</TableCell>
                  <TableCell>{t("Changes")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versionHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>
                      {history.entityType === "category" && t("Category")}
                      {history.entityType === "subcategory" && t("Subcategory")}
                      {history.entityType === "validation" &&
                        t("Validation Rule")}
                    </TableCell>
                    <TableCell>v{history.version}</TableCell>
                    <TableCell>{history.changedBy}</TableCell>
                    <TableCell>{formatDate(history.changeDate)}</TableCell>
                    <TableCell>{history.changes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {versionHistory.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t("No version history found.")}
            </Typography>
          )}
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? t("Edit Category") : t("Add Category")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenCategoryDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("Category Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={newCategory.name || ""}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            margin="dense"
            label={t("Description")}
            type="text"
            fullWidth
            variant="outlined"
            value={newCategory.description || ""}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            startIcon={<Save />}
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog
        open={openSubcategoryDialog}
        onClose={() => setOpenSubcategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSubcategory ? t("Edit Subcategory") : t("Add Subcategory")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenSubcategoryDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label={t("Parent Category")}
            fullWidth
            variant="outlined"
            value={newSubcategory.parentCategoryId || ""}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                parentCategoryId: e.target.value,
              })
            }
            sx={{ mb: 2, mt: 1 }}
            required
            disabled={!!selectedSubcategory} // Disable changing parent category when editing
            SelectProps={{
              native: true,
            }}
          >
            <option value="">{t("Select a category")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </TextField>
          <TextField
            autoFocus
            margin="dense"
            label={t("Subcategory Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={newSubcategory.name || ""}
            onChange={(e) =>
              setNewSubcategory({ ...newSubcategory, name: e.target.value })
            }
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label={t("Description")}
            type="text"
            fullWidth
            variant="outlined"
            value={newSubcategory.description || ""}
            onChange={(e) =>
              setNewSubcategory({
                ...newSubcategory,
                description: e.target.value,
              })
            }
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubcategoryDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSaveSubcategory}
            variant="contained"
            startIcon={<Save />}
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Rule Dialog */}
      <Dialog
        open={openRuleDialog}
        onClose={() => setOpenRuleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRule ? t("Edit Validation Rule") : t("Add Validation Rule")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenRuleDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("Rule Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={newRule.name || ""}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            margin="dense"
            label={t("Description")}
            type="text"
            fullWidth
            variant="outlined"
            value={newRule.description || ""}
            onChange={(e) =>
              setNewRule({ ...newRule, description: e.target.value })
            }
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />
          <TextField
            select
            margin="dense"
            label={t("Category")}
            fullWidth
            variant="outlined"
            value={newRule.categoryId || ""}
            onChange={(e) =>
              setNewRule({ ...newRule, categoryId: e.target.value })
            }
            sx={{ mb: 2 }}
            required
            SelectProps={{
              native: true,
            }}
          >
            <option value="">{t("Select a category")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label={t("Rule Definition")}
            type="text"
            fullWidth
            variant="outlined"
            value={newRule.rule || ""}
            onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
            sx={{ mb: 2 }}
            required
            multiline
            rows={3}
            placeholder="e.g., required || length > 0"
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {t("Status")}:
            </Typography>
            <Chip
              label={newRule.isActive ? t("Active") : t("Inactive")}
              color={newRule.isActive ? "success" : "default"}
              onClick={() =>
                setNewRule({ ...newRule, isActive: !newRule.isActive })
              }
              icon={newRule.isActive ? <Check /> : <Warning />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRuleDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSaveRule}
            variant="contained"
            startIcon={<Save />}
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("Version History")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenHistoryDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("Version")}</TableCell>
                  <TableCell>{t("Changed By")}</TableCell>
                  <TableCell>{t("Change Date")}</TableCell>
                  <TableCell>{t("Changes")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versionHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>v{history.version}</TableCell>
                    <TableCell>{history.changedBy}</TableCell>
                    <TableCell>{formatDate(history.changeDate)}</TableCell>
                    <TableCell>{history.changes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("Import Master Data")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenImportDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t(
              "Please select a JSON file containing master data to import. This will replace your current data.",
            )}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".json"
              style={{ display: "none" }}
              id="import-file-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="import-file-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
              >
                {t("Select File")}
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t("Selected file")}: {importFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleImportConfirm}
            variant="contained"
            disabled={!importFile}
          >
            {t("Import")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MasterDataManager;
