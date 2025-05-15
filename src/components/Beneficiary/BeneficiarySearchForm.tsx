import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  beneficiaryService,
  BeneficiaryFilter,
} from "@/services/beneficiaryService";
import { clientApi } from "@/lib/api/client/clientApi";
import { ClientType } from "@/lib/api/client/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Search, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface BeneficiarySearchFormProps {
  onSearch: (filter: BeneficiaryFilter) => void;
  onExport?: (filter: BeneficiaryFilter) => void;
  initialFilter?: BeneficiaryFilter;
  showExport?: boolean;
}

export const BeneficiarySearchForm: React.FC<BeneficiarySearchFormProps> = ({
  onSearch,
  onExport,
  initialFilter,
  showExport = true,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState<boolean>(false);

  const [filter, setFilter] = useState<BeneficiaryFilter>(
    initialFilter || {
      searchText: "",
      clientTypeId: undefined,
      gender: undefined,
      emirate: undefined,
      registrationDateFrom: undefined,
      registrationDateTo: undefined,
      pageIndex: 0,
      pageSize: 10,
    },
  );

  React.useEffect(() => {
    const fetchClientTypes = async () => {
      try {
        const response = await clientApi.getClientTypes();
        if (response.success && response.data) {
          setClientTypes(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching client types:", error);
      }
    };

    fetchClientTypes();
  }, []);

  const handleChange = (field: keyof BeneficiaryFilter, value: any) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ ...filter, pageIndex: 0 }); // Reset to first page on new search
  };

  const handleReset = () => {
    const resetFilter: BeneficiaryFilter = {
      searchText: "",
      clientTypeId: undefined,
      gender: undefined,
      emirate: undefined,
      registrationDateFrom: undefined,
      registrationDateTo: undefined,
      pageIndex: 0,
      pageSize: filter.pageSize,
    };
    setFilter(resetFilter);
    onSearch(resetFilter);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filter);
    }
  };

  return (
    <Card className={directionClass}>
      <CardHeader>
        <CardTitle>{t("beneficiary.searchTitle")}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t("beneficiary.searchPlaceholder")}
                value={filter.searchText || ""}
                onChange={(e) => handleChange("searchText", e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
              className="md:self-center"
            >
              {isAdvancedSearch
                ? t("beneficiary.simpleSearch")
                : t("beneficiary.advancedSearch")}
            </Button>
          </div>

          {/* Advanced Search */}
          {isAdvancedSearch && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="clientTypeId">
                  {t("beneficiary.clientType")}
                </Label>
                <Select
                  value={filter.clientTypeId?.toString() || ""}
                  onValueChange={(value) =>
                    handleChange(
                      "clientTypeId",
                      value ? parseInt(value) : undefined,
                    )
                  }
                >
                  <SelectTrigger id="clientTypeId">
                    <SelectValue
                      placeholder={t("beneficiary.selectClientType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("beneficiary.allClientTypes")}
                    </SelectItem>
                    {clientTypes.map((clientType) => (
                      <SelectItem
                        key={clientType.clientTypeId}
                        value={clientType.clientTypeId.toString()}
                      >
                        {clientType.typeNameEN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t("beneficiary.gender")}</Label>
                <Select
                  value={filter.gender || ""}
                  onValueChange={(value) =>
                    handleChange("gender", value || undefined)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder={t("beneficiary.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("beneficiary.allGenders")}
                    </SelectItem>
                    <SelectItem value="male">
                      {t("beneficiary.male")}
                    </SelectItem>
                    <SelectItem value="female">
                      {t("beneficiary.female")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emirate">{t("beneficiary.emirate")}</Label>
                <Select
                  value={filter.emirate || ""}
                  onValueChange={(value) =>
                    handleChange("emirate", value || undefined)
                  }
                >
                  <SelectTrigger id="emirate">
                    <SelectValue placeholder={t("beneficiary.selectEmirate")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("beneficiary.allEmirates")}
                    </SelectItem>
                    <SelectItem value="abudhabi">
                      {t("beneficiary.emirates.abudhabi")}
                    </SelectItem>
                    <SelectItem value="dubai">
                      {t("beneficiary.emirates.dubai")}
                    </SelectItem>
                    <SelectItem value="sharjah">
                      {t("beneficiary.emirates.sharjah")}
                    </SelectItem>
                    <SelectItem value="ajman">
                      {t("beneficiary.emirates.ajman")}
                    </SelectItem>
                    <SelectItem value="ummalquwain">
                      {t("beneficiary.emirates.ummalquwain")}
                    </SelectItem>
                    <SelectItem value="fujairah">
                      {t("beneficiary.emirates.fujairah")}
                    </SelectItem>
                    <SelectItem value="rasalkhaimah">
                      {t("beneficiary.emirates.rasalkhaimah")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDateFrom">
                  {t("beneficiary.registrationDateFrom")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="registrationDateFrom"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filter.registrationDateFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filter.registrationDateFrom ? (
                        format(filter.registrationDateFrom, "PPP")
                      ) : (
                        <span>{t("beneficiary.selectDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filter.registrationDateFrom}
                      onSelect={(date) =>
                        handleChange("registrationDateFrom", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDateTo">
                  {t("beneficiary.registrationDateTo")}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="registrationDateTo"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filter.registrationDateTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filter.registrationDateTo ? (
                        format(filter.registrationDateTo, "PPP")
                      ) : (
                        <span>{t("beneficiary.selectDate")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filter.registrationDateTo}
                      onSelect={(date) =>
                        handleChange("registrationDateTo", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="mr-2"
            >
              <X className="mr-2 h-4 w-4" />
              {t("common.reset")}
            </Button>
            {showExport && onExport && (
              <Button type="button" variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                {t("common.export")}
              </Button>
            )}
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            {t("common.search")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BeneficiarySearchForm;
