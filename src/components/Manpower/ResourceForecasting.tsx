import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { ResourceForecast } from "@/lib/api/manpower/types";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

const ResourceForecasting = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [forecasts, setForecasts] = useState<ResourceForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const data = await manpowerApi.getResourceForecasts();
        setForecasts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forecasts:", error);
        setLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("manpower.resourceForecasting")}</CardTitle>
            <CardDescription>
              {t("manpower.resourceForecastingDescription")}
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("manpower.createForecast")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("manpower.department")}</TableHead>
                <TableHead>{t("manpower.period")}</TableHead>
                <TableHead>{t("manpower.requiredResources")}</TableHead>
                <TableHead>{t("manpower.availableResources")}</TableHead>
                <TableHead>{t("manpower.gap")}</TableHead>
                <TableHead>{t("manpower.plannedHiring")}</TableHead>
                <TableHead>{t("common.notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : forecasts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                forecasts.map((forecast) => (
                  <TableRow key={forecast.id}>
                    <TableCell className="font-medium">
                      {typeof forecast.departmentId === "object" &&
                      forecast.departmentId !== null
                        ? (forecast.departmentId as any).name ||
                          (forecast.departmentId as any).id ||
                          "Unknown"
                        : forecast.departmentId || "-"}
                    </TableCell>
                    <TableCell>{forecast.period}</TableCell>
                    <TableCell>{forecast.requiredResources}</TableCell>
                    <TableCell>{forecast.availableResources}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {forecast.gap > 0 ? (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-green-500">
                              +{forecast.gap}
                            </span>
                          </>
                        ) : forecast.gap < 0 ? (
                          <>
                            <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500">{forecast.gap}</span>
                          </>
                        ) : (
                          <>
                            <Minus className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">0</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {forecast.plannedHiring > 0 ? (
                        <Badge variant="outline">
                          {forecast.plannedHiring}
                        </Badge>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {forecast.notes}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("manpower.resourceUtilizationTrend")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                <TrendingUp className="h-16 w-16 text-gray-400" />
                <span className="ml-2 text-gray-500">
                  {t("manpower.utilizationChartPlaceholder")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("manpower.resourceGapAnalysis")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                <TrendingDown className="h-16 w-16 text-gray-400" />
                <span className="ml-2 text-gray-500">
                  {t("manpower.gapAnalysisChartPlaceholder")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceForecasting;
