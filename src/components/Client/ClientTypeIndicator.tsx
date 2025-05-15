import React from "react";
import { useTranslation } from "react-i18next";
import { ClientType } from "@/lib/forms/types";
import { clientConfigService } from "@/services/clientConfigService";
import { Badge } from "../ui/badge";

interface ClientTypeIndicatorProps {
  clientType: ClientType | number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const ClientTypeIndicator: React.FC<ClientTypeIndicatorProps> = ({
  clientType,
  showLabel = true,
  size = "md",
}) => {
  const { t } = useTranslation();

  // Handle both numeric and enum ClientType
  const clientTypeId =
    typeof clientType === "number" ? clientType : getClientTypeId(clientType);
  const clientConfig = clientConfigService.getClientConfig(clientTypeId);

  const sizeClasses = {
    sm: "h-4 w-4 text-xs",
    md: "h-6 w-6 text-sm",
    lg: "h-8 w-8 text-base",
  };

  // Convert numeric client type to enum if needed
  const getClientTypeEnum = (type: ClientType | number): ClientType => {
    if (typeof type === "number") {
      switch (type) {
        case 1:
          return ClientType.FDF;
        case 2:
          return ClientType.ADHA;
        case 3:
          return ClientType.CASH;
        default:
          return ClientType.OTHER;
      }
    }
    return type;
  };

  // Convert enum client type to ID
  function getClientTypeId(type: ClientType): number {
    switch (type) {
      case ClientType.FDF:
        return 1;
      case ClientType.ADHA:
        return 2;
      case ClientType.CASH:
        return 3;
      case ClientType.OTHER:
        return 4;
      default:
        return 4;
    }
  }

  const getClientTypeLabel = (type: ClientType | number): string => {
    const typeEnum = getClientTypeEnum(type);
    switch (typeEnum) {
      case ClientType.FDF:
        return t("clientType.fdf", "Family Development Foundation");
      case ClientType.ADHA:
        return t("clientType.adha", "Abu Dhabi Housing Authority");
      case ClientType.CASH:
        return t("clientType.cash", "Cash Client");
      case ClientType.OTHER:
        return t("clientType.other", "Other Client");
      default:
        return t("clientType.unknown", "Unknown Client");
    }
  };

  const getClientTypeColor = (type: ClientType | number): string => {
    // If we have a client config with theme, use its primary color
    if (
      clientConfig &&
      clientConfig.general &&
      clientConfig.general.theme &&
      clientConfig.general.theme.primaryColor
    ) {
      return clientConfig.general.theme.primaryColor;
    }

    const typeEnum = getClientTypeEnum(type);
    switch (typeEnum) {
      case ClientType.FDF:
        return "#0056b3";
      case ClientType.ADHA:
        return "#00796b";
      case ClientType.CASH:
        return "#6a1b9a";
      case ClientType.OTHER:
        return "#546e7a";
      default:
        return "#9e9e9e";
    }
  };

  const typeEnum = getClientTypeEnum(clientType);
  const firstLetter =
    typeof clientType === "number"
      ? String(getClientTypeEnum(clientType)).charAt(0)
      : typeEnum.charAt(0);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full flex items-center justify-center ${sizeClasses[size]}`}
        style={{ backgroundColor: getClientTypeColor(clientType) }}
      >
        <span className="text-white font-bold">{firstLetter}</span>
      </div>
      {showLabel && (
        <Badge
          variant="outline"
          style={{
            borderColor: getClientTypeColor(clientType),
            color: getClientTypeColor(clientType),
          }}
        >
          {getClientTypeLabel(clientType)}
        </Badge>
      )}
    </div>
  );
};

export default ClientTypeIndicator;
