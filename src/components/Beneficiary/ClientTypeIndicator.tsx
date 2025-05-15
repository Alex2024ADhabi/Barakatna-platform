import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Building2,
  Users,
  CreditCard,
  Briefcase,
  Building,
  Home,
} from "lucide-react";
import { clientApi } from "@/lib/api/client/clientApi";
import { ClientType } from "@/lib/api/client/types";

interface ClientTypeIndicatorProps {
  clientTypeId: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ClientTypeIndicator: React.FC<ClientTypeIndicatorProps> = ({
  clientTypeId,
  size = "md",
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch client types on component mount
  useEffect(() => {
    const fetchClientTypes = async () => {
      setLoading(true);
      try {
        const response = await clientApi.getClientTypes();
        if (response.success && response.data) {
          setClientTypes(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching client types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientTypes();
  }, []);

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  const getClientTypeIcon = (typeCode: string) => {
    switch (typeCode?.toUpperCase()) {
      case "FDF":
        return <Users className={getIconSize()} />;
      case "ADHA":
        return <Building2 className={getIconSize()} />;
      case "CASH":
        return <CreditCard className={getIconSize()} />;
      case "CORP":
        return <Briefcase className={getIconSize()} />;
      case "GOV":
        return <Building className={getIconSize()} />;
      case "NGO":
        return <Home className={getIconSize()} />;
      default:
        return <Building2 className={getIconSize()} />;
    }
  };

  const getClientTypeColor = (typeCode: string) => {
    switch (typeCode?.toUpperCase()) {
      case "FDF":
        return "bg-blue-500 hover:bg-blue-600";
      case "ADHA":
        return "bg-green-500 hover:bg-green-600";
      case "CASH":
        return "bg-amber-500 hover:bg-amber-600";
      case "CORP":
        return "bg-purple-500 hover:bg-purple-600";
      case "GOV":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "NGO":
        return "bg-teal-500 hover:bg-teal-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Find the client type from the fetched list
  const clientType = clientTypes.find((ct) => ct.clientTypeId === clientTypeId);

  // Fallback for when client type is not found or still loading
  const clientTypeInfo = clientType
    ? {
        name: t(clientType.typeCode) || clientType.typeCode,
        fullName: t(clientType.typeNameEN) || clientType.typeNameEN,
        icon: getClientTypeIcon(clientType.typeCode),
        color: getClientTypeColor(clientType.typeCode),
        description: clientType.description || t("Client type information"),
      }
    : {
        name: loading ? t("Loading...") : t("Unknown"),
        fullName: loading
          ? t("Loading client type...")
          : t("Unknown Client Type"),
        icon: null,
        color: "bg-gray-500 hover:bg-gray-600",
        description: loading
          ? t("Loading details...")
          : t("Client type is not specified."),
      };

  // Fallback to hardcoded values if client types are not loaded yet
  if (!clientType && !loading) {
    const fallbackInfo = getFallbackClientTypeInfo(
      clientTypeId,
      t,
      getIconSize(),
    );
    if (fallbackInfo) {
      return renderBadge(fallbackInfo, showLabel);
    }
  }

  return renderBadge(clientTypeInfo, showLabel);
};

// Helper function to get fallback client type info
const getFallbackClientTypeInfo = (id: number, t: any, iconSize: string) => {
  switch (id) {
    case 1:
      return {
        name: t("FDF"),
        fullName: t("Family Development Foundation"),
        icon: <Users className={iconSize} />,
        color: "bg-blue-500 hover:bg-blue-600",
        description: t(
          "Client is supported by the Family Development Foundation program.",
        ),
      };
    case 2:
      return {
        name: t("ADHA"),
        fullName: t("Abu Dhabi Housing Authority"),
        icon: <Building2 className={iconSize} />,
        color: "bg-green-500 hover:bg-green-600",
        description: t(
          "Client is supported by the Abu Dhabi Housing Authority program.",
        ),
      };
    case 3:
      return {
        name: t("Cash"),
        fullName: t("Cash-Based Client"),
        icon: <CreditCard className={iconSize} />,
        color: "bg-amber-500 hover:bg-amber-600",
        description: t("Client is paying for services directly."),
      };
    default:
      return null;
  }
};

// Helper function to render the badge
const renderBadge = (clientTypeInfo: any, showLabel: boolean) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${clientTypeInfo.color} flex items-center gap-1`}>
            {clientTypeInfo.icon}
            {showLabel && <span>{clientTypeInfo.name}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{clientTypeInfo.fullName}</p>
          <p className="text-xs">{clientTypeInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClientTypeIndicator;
