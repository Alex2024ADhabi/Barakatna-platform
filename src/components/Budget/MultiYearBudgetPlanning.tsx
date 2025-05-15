import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { budgetApi } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface YearlyBudget {
  fiscalYear: string;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
}

interface GrowthModel {
  category: string;
  currentYear: number;
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  growthRate: number;
}

const MultiYearBudgetPlanning: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("planning");
  const [yearlyBudgets, setYearlyBudgets] = useState<YearlyBudget[]>([]);
  const [growthModels, setGrowthModels] = useState<GrowthModel[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
  ]);
  const [growthRate, setGrowthRate] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call the actual API
        // const response = await budgetApi.getMultiYearBudgets();
        // setYearlyBudgets(response.data);

        // Mock data for demonstration
        const mockYearlyBudgets: YearlyBudget[] = [
          {
            fiscalYear: "2025",
            totalBudget: 1000000,
            allocatedBudget: 850000,
            spentBudget: 700000,
            remainingBudget: 300000,
          },
          {
            fiscalYear: "2026",
            totalBudget: 1050000,
            allocatedBudget: 800000,
            spentBudget: 600000,
            remainingBudget: 450000,
          },
          {
            fiscalYear: "2027",
            totalBudget: 1102500,
            allocatedBudget: 900000,
            spentBudget: 500000,
            remainingBudget: 602500,
          },
          {
            fiscalYear: "2028",
            totalBudget: 1157625,
            allocatedBudget: 950000,
            spentBudget: 400000,
            remainingBudget: 757625,
          },
          {
            fiscalYear: "2029",
            totalBudget: 1215506,
            allocatedBudget: 1000000,
            spentBudget: 300000,
            remainingBudget: 915506,
          },
        ];
        setYearlyBudgets(mockYearlyBudgets);

        const mockGrowthModels: GrowthModel[] = [
          {
            category: t("budget.operations"),
            currentYear: 500000,
            year1: 525000,
            year2: 551250,
            year3: 578813,
            year4: 607753,
            growthRate: 5,
          },
          {
            category: t("budget.staffing"),
            currentYear: 300000,
            year1: 315000,
            year2: 330750,
            year3: 347288,
            year4: 364652,
            growthRate: 5,
          },
          {
            category: t("budget.marketing"),
            currentYear: 100000,
            year1: 110000,
            year2: 121000,
            year3: 133100,
            year4: 146410,
            growthRate: 10,
          },
          {
            category: t("budget.technology"),
            currentYear: 80000,
            year1: 88000,
            year2: 96800,
            year3: 106480,
            year4: 117128,
            growthRate: 10,
          },
          {
            category: t("budget.facilities"),
            currentYear: 20000,
            year1: 20600,
            year2: 21218,
            year3: 21855,
            year4: 22510,
            growthRate: 3,
          },
        ];
        setGrowthModels(mockGrowthModels);
      } catch (error) {
        console.error("Error fetching multi-year budget data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleGrowthRateChange = (value: string) => {
    const rate = parseFloat(value);
    setGrowthRate(rate);

    // Update growth models with new rate
    const updatedModels = growthModels.map((model) => {
      const newModel = { ...model, growthRate: rate };
      newModel.year1 = Math.round(model.currentYear * (1 + rate / 100));
      newModel.year2 = Math.round(newModel.year1 * (1 + rate / 100));
      newModel.year3 = Math.round(newModel.year2 * (1 + rate / 100));
      newModel.year4 = Math.round(newModel.year3 * (1 + rate / 100));
      return newModel;
    });

    setGrowthModels(updatedModels);
  };

  const chartData = yearlyBudgets.map((budget) => ({
    name: budget.fiscalYear,
    total: budget.totalBudget,
    allocated: budget.allocatedBudget,
    spent: budget.spentBudget,
    remaining: budget.remainingBudget,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {t("budget.multiYearPlanning")}
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="planning">{t("budget.planning")}</TabsTrigger>
          <TabsTrigger value="comparison">
            {t("budget.yearOverYearComparison")}
          </TabsTrigger>
          <TabsTrigger value="growth">{t("budget.growthModeling")}</TabsTrigger>
          <TabsTrigger value="trends">{t("budget.longTermTrends")}</TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.multiYearBudgetPlan")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button variant="outline" className="mr-2">
                  {t("common.buttons.export")}
                </Button>
                <Button>{t("common.buttons.save")}</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.fiscalYear")}</TableHead>
                    <TableHead className="text-right">
                      {t("budget.totalBudget")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("budget.allocatedBudget")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("budget.spentBudget")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("budget.remainingBudget")}
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyBudgets.map((budget) => (
                    <TableRow key={budget.fiscalYear}>
                      <TableCell>{budget.fiscalYear}</TableCell>
                      <TableCell className="text-right">
                        {budget.totalBudget.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {budget.allocatedBudget.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {budget.spentBudget.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {budget.remainingBudget.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {t("common.buttons.edit")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.yearOverYearComparison")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-48">
                    <Select defaultValue="total">
                      <SelectTrigger>
                        <SelectValue placeholder={t("budget.selectMetric")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">
                          {t("budget.totalBudget")}
                        </SelectItem>
                        <SelectItem value="allocated">
                          {t("budget.allocatedBudget")}
                        </SelectItem>
                        <SelectItem value="spent">
                          {t("budget.spentBudget")}
                        </SelectItem>
                        <SelectItem value="remaining">
                          {t("budget.remainingBudget")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline">{t("common.buttons.apply")}</Button>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        name={t("budget.totalBudget")}
                      />
                      <Line
                        type="monotone"
                        dataKey="allocated"
                        stroke="#82ca9d"
                        name={t("budget.allocatedBudget")}
                      />
                      <Line
                        type="monotone"
                        dataKey="spent"
                        stroke="#ff7300"
                        name={t("budget.spentBudget")}
                      />
                      <Line
                        type="monotone"
                        dataKey="remaining"
                        stroke="#0088fe"
                        name={t("budget.remainingBudget")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.growthModeling")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <span className="mr-2">{t("budget.defaultGrowthRate")}:</span>
                  <Input
                    type="number"
                    value={growthRate}
                    onChange={(e) => handleGrowthRateChange(e.target.value)}
                    className="w-20"
                  />
                  <span className="ml-1">%</span>
                </div>
                <Button variant="outline">{t("common.buttons.apply")}</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.category")}</TableHead>
                    <TableHead className="text-right">
                      {t("budget.currentYear")}
                    </TableHead>
                    <TableHead className="text-right">
                      FY {selectedYears[0]}
                    </TableHead>
                    <TableHead className="text-right">
                      FY {selectedYears[1]}
                    </TableHead>
                    <TableHead className="text-right">
                      FY {selectedYears[2]}
                    </TableHead>
                    <TableHead className="text-right">
                      FY {selectedYears[3]}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("budget.growthRate")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {growthModels.map((model) => (
                    <TableRow key={model.category}>
                      <TableCell>{model.category}</TableCell>
                      <TableCell className="text-right">
                        {model.currentYear.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {model.year1.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {model.year2.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {model.year3.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {model.year4.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={model.growthRate}
                          className="w-16 inline-block"
                          onChange={(e) => {
                            // Individual category growth rate change would go here
                          }}
                        />
                        <span className="ml-1">%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.longTermTrends")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Select defaultValue="5">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t("budget.timespan")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 {t("budget.years")}</SelectItem>
                      <SelectItem value="5">5 {t("budget.years")}</SelectItem>
                      <SelectItem value="10">10 {t("budget.years")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">{t("common.buttons.apply")}</Button>
                </div>
                <Button variant="outline">{t("common.buttons.export")}</Button>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      name={t("budget.totalBudget")}
                    />
                    <Line
                      type="monotone"
                      dataKey="allocated"
                      stroke="#82ca9d"
                      name={t("budget.allocatedBudget")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">
                  {t("budget.trendAnalysis")}
                </h3>
                <p className="text-gray-600">
                  {t("budget.trendAnalysisDescription")}
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600">
                  <li>{t("budget.trendInsight1")}</li>
                  <li>{t("budget.trendInsight2")}</li>
                  <li>{t("budget.trendInsight3")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiYearBudgetPlanning;
