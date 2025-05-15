import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Budget, BudgetCategory, BudgetExpense } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Textarea } from "@/components/ui/textarea";
import { Check, FileUp, Loader2, Plus } from "lucide-react";

interface ExpenseEntryProps {
  budgetId: string;
  onExpenseAdded?: (expense: BudgetExpense) => void;
}

const ExpenseEntry = ({ budgetId, onExpenseAdded }: ExpenseEntryProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await budgetApi.getBudgetCategories(budgetId);
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [budgetId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId || !description || !amount || !date) {
      alert(t("common.pleaseCompleteAllFields"));
      return;
    }

    try {
      setSubmitting(true);

      // In a real implementation, we would upload the receipt file to a storage service
      // and get back a URL to store in the database
      let receiptUrl = "";
      if (receiptFile) {
        // Mock upload - in a real app, this would be an actual upload to a storage service
        receiptUrl = `https://example.com/receipts/${receiptFile.name}`;
      }

      const newExpense = await budgetApi.createBudgetExpense({
        budgetId,
        categoryId,
        description,
        amount: parseFloat(amount),
        date,
        receiptUrl: receiptUrl || undefined,
        status: "pending",
        createdBy: "current-user", // In a real app, this would be the current user's ID
        notes: notes || undefined,
      });

      // Reset form
      setCategoryId("");
      setDescription("");
      setAmount("");
      setDate("");
      setNotes("");
      setReceiptFile(null);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (onExpenseAdded) {
        onExpenseAdded(newExpense);
      }

      setSubmitting(false);
    } catch (error) {
      console.error("Error creating expense:", error);
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("budget.expenseEntry")}</CardTitle>
        <CardDescription>{t("budget.expenseEntryDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">{t("budget.category")}</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">{t("budget.selectCategory")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("common.description")}</Label>
              <Input
                id="description"
                placeholder={t("budget.expenseDescriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t("budget.amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">{t("common.date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">{t("budget.receipt")}</Label>
              <div className="flex items-center">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex-1 border rounded-md overflow-hidden">
                  <label
                    htmlFor="receipt"
                    className="flex items-center justify-center p-2 cursor-pointer hover:bg-gray-50"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {receiptFile ? receiptFile.name : t("budget.uploadReceipt")}
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("budget.receiptFileTypes")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("common.notes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("common.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.submitting")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("budget.addExpense")}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      {success && (
        <CardFooter className="bg-green-50 border-t border-green-100">
          <div className="flex items-center text-green-600 w-full">
            <Check className="mr-2 h-4 w-4" />
            {t("budget.expenseAddedSuccessfully")}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ExpenseEntry;
