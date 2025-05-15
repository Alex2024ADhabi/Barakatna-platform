import React from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowPhase {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  status: "completed" | "current" | "upcoming" | "blocked";
}

interface WorkflowNavigatorProps {
  phases?: WorkflowPhase[];
  currentPhaseId?: number;
  onPhaseClick?: (phaseId: number) => void;
  direction?: "ltr" | "rtl";
  language?: "en" | "ar";
  clientType?: string;
}

const WorkflowNavigatorWithLanguage: React.FC<WorkflowNavigatorProps> = ({
  phases,
  currentPhaseId = 2,
  onPhaseClick = () => {},
  direction,
  language = "en",
  clientType = "fdf",
}) => {
  // Default phases with bilingual support
  const defaultPhases: WorkflowPhase[] = [
    {
      id: 1,
      name: "Assessment",
      nameAr: "التقييم",
      description: "Room-to-room evaluation and needs assessment",
      descriptionAr: "تقييم الغرف واحتياجات المستفيد",
      status: "completed",
    },
    {
      id: 2,
      name: "Project Planning",
      nameAr: "تخطيط المشروع",
      description: "Define scope, resources, and timeline",
      descriptionAr: "تحديد النطاق والموارد والجدول الزمني",
      status: "current",
    },
    {
      id: 3,
      name: "Approval Process",
      nameAr: "عملية الموافقة",
      description: "Committee review and authorization",
      descriptionAr: "مراجعة اللجنة والتصريح",
      status: "upcoming",
    },
    {
      id: 4,
      name: "Execution",
      nameAr: "التنفيذ",
      description: "Procurement, vendor selection, and implementation",
      descriptionAr: "المشتريات واختيار الموردين والتنفيذ",
      status: "upcoming",
    },
    {
      id: 5,
      name: "Financial Management",
      nameAr: "الإدارة المالية",
      description: "Invoice processing, payment, and project closure",
      descriptionAr: "معالجة الفواتير والدفع وإغلاق المشروع",
      status: "upcoming",
    },
  ];

  // Client-specific workflow phases
  const clientSpecificPhases = {
    fdf: defaultPhases,
    adha: [
      ...defaultPhases.slice(0, 2),
      {
        id: 3,
        name: "ADHA Approval",
        nameAr: "موافقة هيئة أبوظبي للإسكان",
        description: "Housing authority review and approval",
        descriptionAr: "مراجعة وموافقة هيئة الإسكان",
        status: "upcoming",
      },
      ...defaultPhases.slice(3),
    ],
    cash: [
      defaultPhases[0],
      {
        id: 2,
        name: "Quote Approval",
        nameAr: "الموافقة على العرض",
        description: "Client quote review and payment",
        descriptionAr: "مراجعة العرض والدفع من قبل العميل",
        status: "current",
      },
      ...defaultPhases.slice(3),
    ],
  };

  // Select phases based on client type
  const selectedPhases =
    phases ||
    clientSpecificPhases[clientType as keyof typeof clientSpecificPhases] ||
    defaultPhases;

  // Determine direction based on language if not explicitly provided
  const effectiveDirection = direction || (language === "ar" ? "rtl" : "ltr");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ChevronRight className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-300";
      case "current":
        return "bg-blue-100 border-blue-300";
      case "blocked":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getPhaseText = (
    phase: WorkflowPhase,
    textType: "name" | "description",
  ) => {
    if (language === "ar") {
      return textType === "name"
        ? phase.nameAr || phase.name
        : phase.descriptionAr || phase.description;
    }
    return textType === "name" ? phase.name : phase.description;
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-6">
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${effectiveDirection === "rtl" ? "sm:flex-row-reverse" : ""}`}
          dir={effectiveDirection}
        >
          {selectedPhases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative flex flex-col items-center cursor-pointer ${phase.status === "upcoming" ? "opacity-70" : ""}`}
                      onClick={() => onPhaseClick(phase.id)}
                    >
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(phase.status)}`}
                      >
                        {getStatusIcon(phase.status)}
                      </div>
                      <div className="text-center mt-2">
                        <p
                          className={`text-sm font-medium ${phase.status === "current" ? "text-blue-700" : "text-gray-700"}`}
                        >
                          {getPhaseText(phase, "name")}
                        </p>
                        <span className="text-xs text-gray-500 hidden sm:block">
                          {language === "ar"
                            ? `المرحلة ${phase.id}`
                            : `Phase ${phase.id}`}
                        </span>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getPhaseText(phase, "description")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {index < selectedPhases.length - 1 && (
                <div className="hidden sm:block flex-grow h-0.5 bg-gray-200 self-center">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: phase.status === "completed" ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowNavigatorWithLanguage;
