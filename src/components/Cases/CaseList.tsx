import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  User,
  Home,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface Case {
  id: string;
  caseNumber: string;
  beneficiaryName: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  type: "fdf" | "adha" | "cash";
  createdAt: string;
  address: string;
}

const mockCases: Case[] = [
  {
    id: "1",
    caseNumber: "CS-2023-001",
    beneficiaryName: "Ahmed Al-Saud",
    status: "in-progress",
    type: "fdf",
    createdAt: "2023-10-15",
    address: "Riyadh, Al Olaya District",
  },
  {
    id: "2",
    caseNumber: "CS-2023-002",
    beneficiaryName: "Fatima Al-Qahtani",
    status: "pending",
    type: "adha",
    createdAt: "2023-10-18",
    address: "Jeddah, Al Rawdah District",
  },
  {
    id: "3",
    caseNumber: "CS-2023-003",
    beneficiaryName: "Mohammed Al-Harbi",
    status: "completed",
    type: "cash",
    createdAt: "2023-10-10",
    address: "Dammam, Al Faisaliyah District",
  },
  {
    id: "4",
    caseNumber: "CS-2023-004",
    beneficiaryName: "Noura Al-Otaibi",
    status: "on-hold",
    type: "fdf",
    createdAt: "2023-10-20",
    address: "Riyadh, Al Malaz District",
  },
  {
    id: "5",
    caseNumber: "CS-2023-005",
    beneficiaryName: "Khalid Al-Dossary",
    status: "in-progress",
    type: "adha",
    createdAt: "2023-10-22",
    address: "Makkah, Al Aziziyah District",
  },
];

const getStatusColor = (status: Case["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "on-hold":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: Case["type"]) => {
  switch (type) {
    case "fdf":
      return "bg-purple-100 text-purple-800";
    case "adha":
      return "bg-indigo-100 text-indigo-800";
    case "cash":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface CaseListProps {
  onViewCase?: (caseId: string) => void;
  onEditCase?: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
}

export default function CaseList({
  onViewCase,
  onEditCase,
  onDeleteCase,
}: CaseListProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCases, setFilteredCases] = useState<Case[]>(mockCases);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let result = mockCases;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((c) => c.status === activeTab);
    }

    setFilteredCases(result);
  }, [searchTerm, activeTab]);

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">
              {t("Cases Management")}
            </CardTitle>
            <Button onClick={() => onViewCase && onViewCase("new")}>
              <Plus className="mr-2 h-4 w-4" />
              {t("New Case")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t("Search cases...")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {t("Filter")}
              </Button>
            </div>

            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">{t("All")}</TabsTrigger>
                <TabsTrigger value="pending">{t("Pending")}</TabsTrigger>
                <TabsTrigger value="in-progress">
                  {t("In Progress")}
                </TabsTrigger>
                <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
                <TabsTrigger value="on-hold">{t("On Hold")}</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <CaseTable
                  cases={filteredCases}
                  onViewCase={onViewCase}
                  onEditCase={onEditCase}
                  onDeleteCase={onDeleteCase}
                />
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                <CaseTable
                  cases={filteredCases.filter((c) => c.status === "pending")}
                  onViewCase={onViewCase}
                  onEditCase={onEditCase}
                  onDeleteCase={onDeleteCase}
                />
              </TabsContent>
              <TabsContent value="in-progress" className="mt-0">
                <CaseTable
                  cases={filteredCases.filter(
                    (c) => c.status === "in-progress",
                  )}
                  onViewCase={onViewCase}
                  onEditCase={onEditCase}
                  onDeleteCase={onDeleteCase}
                />
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                <CaseTable
                  cases={filteredCases.filter((c) => c.status === "completed")}
                  onViewCase={onViewCase}
                  onEditCase={onEditCase}
                  onDeleteCase={onDeleteCase}
                />
              </TabsContent>
              <TabsContent value="on-hold" className="mt-0">
                <CaseTable
                  cases={filteredCases.filter((c) => c.status === "on-hold")}
                  onViewCase={onViewCase}
                  onEditCase={onEditCase}
                  onDeleteCase={onDeleteCase}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CaseTableProps {
  cases: Case[];
  onViewCase?: (caseId: string) => void;
  onEditCase?: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
}

function CaseTable({
  cases,
  onViewCase,
  onEditCase,
  onDeleteCase,
}: CaseTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Case Number")}</TableHead>
            <TableHead>{t("Beneficiary")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead>{t("Type")}</TableHead>
            <TableHead>{t("Created Date")}</TableHead>
            <TableHead>{t("Address")}</TableHead>
            <TableHead>{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                {t("No cases found")}
              </TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-gray-500" />
                    {caseItem.caseNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    {caseItem.beneficiaryName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(caseItem.status)}>
                    {t(
                      caseItem.status.charAt(0).toUpperCase() +
                        caseItem.status.slice(1),
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(caseItem.type)}>
                    {caseItem.type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    {caseItem.createdAt}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Home className="mr-2 h-4 w-4 text-gray-500" />
                    {caseItem.address}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewCase && onViewCase(caseItem.id)}
                    >
                      {t("View")}
                    </Button>
                    {onEditCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCase && onEditCase(caseItem.id)}
                      >
                        {t("Edit")}
                      </Button>
                    )}
                    {onDeleteCase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (
                            window.confirm(
                              t("Are you sure you want to delete this case?"),
                            )
                          ) {
                            onDeleteCase && onDeleteCase(caseItem.id);
                          }
                        }}
                      >
                        {t("Delete")}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
