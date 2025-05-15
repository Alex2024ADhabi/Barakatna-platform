import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface FiscalYearDefinition {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  isDefault: boolean;
  carryOverEnabled: boolean;
  carryOverPercentage: number;
  carryOverDeadline: number; // months after fiscal year end
}

interface RecurringBudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually";
  isActive: boolean;
}

const FiscalYearSettings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("definitions");
  const [fiscalYears, setFiscalYears] = useState<FiscalYearDefinition[]>([
    {
      id: "1",
      name: "Standard Fiscal Year",
      startMonth: 1,
      startDay: 1,
      endMonth: 12,
      endDay: 31,
      isDefault: true,
      carryOverEnabled: true,
      carryOverPercentage: 10,
      carryOverDeadline: 3,
    },
    {
      id: "2",
      name: "Government Fiscal Year",
      startMonth: 10,
      startDay: 1,
      endMonth: 9,
      endDay: 30,
      isDefault: false,
      carryOverEnabled: false,
      carryOverPercentage: 0,
      carryOverDeadline: 0,
    },
  ]);

  const [recurringItems, setRecurringItems] = useState<RecurringBudgetItem[]>([
    {
      id: "1",
      name: "Office Supplies",
      category: "Operations",
      amount: 500,
      frequency: "monthly",
      isActive: true,
    },
    {
      id: "2",
      name: "Software Subscriptions",
      category: "Technology",
      amount: 2000,
      frequency: "quarterly",
      isActive: true,
    },
    {
      id: "3",
      name: "Annual Insurance",
      category: "Administrative",
      amount: 12000,
      frequency: "annually",
      isActive: true,
    },
  ]);

  const [inflationRate, setInflationRate] = useState<number>(3);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const toggleCarryOver = (id: string) => {
    setFiscalYears(
      fiscalYears.map((year) => {
        if (year.id === id) {
          return { ...year, carryOverEnabled: !year.carryOverEnabled };
        }
        return year;
      }),
    );
  };

  const toggleRecurringItem = (id: string) => {
    setRecurringItems(
      recurringItems.map((item) => {
        if (item.id === id) {
          return { ...item, isActive: !item.isActive };
        }
        return item;
      }),
    );
  };

  const setDefaultFiscalYear = (id: string) => {
    setFiscalYears(
      fiscalYears.map((year) => ({
        ...year,
        isDefault: year.id === id,
      })),
    );
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {t("budget.fiscalYearSettings")}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="definitions">
            {t("budget.fiscalYearDefinitions")}
          </TabsTrigger>
          <TabsTrigger value="carryover">
            {t("budget.carryOverSettings")}
          </TabsTrigger>
          <TabsTrigger value="inflation">
            {t("budget.inflationAdjustment")}
          </TabsTrigger>
          <TabsTrigger value="recurring">
            {t("budget.recurringItems")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.fiscalYearDefinitions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>{t("budget.addFiscalYear")}</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.name")}</TableHead>
                    <TableHead>{t("budget.startDate")}</TableHead>
                    <TableHead>{t("budget.endDate")}</TableHead>
                    <TableHead>{t("budget.default")}</TableHead>
                    <TableHead>{t("common.labels.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiscalYears.map((fiscalYear) => (
                    <TableRow key={fiscalYear.id}>
                      <TableCell>{fiscalYear.name}</TableCell>
                      <TableCell>
                        {getMonthName(fiscalYear.startMonth)}{" "}
                        {fiscalYear.startDay}
                      </TableCell>
                      <TableCell>
                        {getMonthName(fiscalYear.endMonth)} {fiscalYear.endDay}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={fiscalYear.isDefault}
                          onCheckedChange={() =>
                            setDefaultFiscalYear(fiscalYear.id)
                          }
                          disabled={fiscalYear.isDefault}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="mr-2">
                          {t("common.buttons.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          {t("common.buttons.delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carryover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.carryOverSettings")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.fiscalYear")}</TableHead>
                    <TableHead>{t("budget.carryOverEnabled")}</TableHead>
                    <TableHead>{t("budget.carryOverPercentage")}</TableHead>
                    <TableHead>{t("budget.carryOverDeadline")}</TableHead>
                    <TableHead>{t("common.labels.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiscalYears.map((fiscalYear) => (
                    <TableRow key={fiscalYear.id}>
                      <TableCell>{fiscalYear.name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={fiscalYear.carryOverEnabled}
                          onCheckedChange={() => toggleCarryOver(fiscalYear.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={fiscalYear.carryOverPercentage}
                            className="w-20"
                            disabled={!fiscalYear.carryOverEnabled}
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={fiscalYear.carryOverDeadline}
                            className="w-20"
                            disabled={!fiscalYear.carryOverEnabled}
                          />
                          <span className="ml-1">{t("budget.months")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {t("common.buttons.save")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inflation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.inflationAdjustment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <Label htmlFor="inflation-rate">
                      {t("budget.defaultInflationRate")}
                    </Label>
                    <div className="flex items-center mt-1">
                      <Input
                        id="inflation-rate"
                        type="number"
                        value={inflationRate}
                        onChange={(e) =>
                          setInflationRate(parseFloat(e.target.value))
                        }
                        className="w-20"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label>{t("budget.applyToFiscalYear")}</Label>
                    <Select defaultValue="1">
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t("budget.selectFiscalYear")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {fiscalYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-4">
                    <Label>{t("budget.applyToCategories")}</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t("budget.selectCategories")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("budget.allCategories")}
                        </SelectItem>
                        <SelectItem value="operations">
                          {t("budget.operations")}
                        </SelectItem>
                        <SelectItem value="staffing">
                          {t("budget.staffing")}
                        </SelectItem>
                        <SelectItem value="marketing">
                          {t("budget.marketing")}
                        </SelectItem>
                        <SelectItem value="technology">
                          {t("budget.technology")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="mt-4">
                    {t("budget.applyInflationAdjustment")}
                  </Button>
                </div>

                <div>
                  <div className="mb-4">
                    <Label>{t("budget.dateRange")}</Label>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <Label className="text-sm">
                          {t("budget.startDate")}
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              {startDate ? (
                                format(startDate, "PPP")
                              ) : (
                                <span>{t("budget.pickDate")}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-sm">{t("budget.endDate")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              {endDate ? (
                                format(endDate, "PPP")
                              ) : (
                                <span>{t("budget.pickDate")}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-md mt-4">
                    <h3 className="font-medium mb-2">
                      {t("budget.inflationImpactPreview")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("budget.inflationImpactDescription")}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>{t("budget.originalTotal")}:</span>
                      <span className="font-medium">1,000,000 AED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("budget.adjustedTotal")}:</span>
                      <span className="font-medium">1,030,000 AED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("budget.difference")}:</span>
                      <span className="font-medium text-green-600">
                        +30,000 AED (+3%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.recurringItems")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>{t("budget.addRecurringItem")}</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.name")}</TableHead>
                    <TableHead>{t("budget.category")}</TableHead>
                    <TableHead>{t("budget.amount")}</TableHead>
                    <TableHead>{t("budget.frequency")}</TableHead>
                    <TableHead>{t("budget.active")}</TableHead>
                    <TableHead>{t("common.labels.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.amount.toLocaleString()}</TableCell>
                      <TableCell>{t(`budget.${item.frequency}`)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => toggleRecurringItem(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="mr-2">
                          {t("common.buttons.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          {t("common.buttons.delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FiscalYearSettings;
