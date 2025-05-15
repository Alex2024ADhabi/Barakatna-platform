import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClientType } from "@/lib/forms/types";
import { clientConfigService } from "@/services/clientConfigService";
import ClientTypeIndicator from "./ClientTypeIndicator";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ClientTypeSelectorProps {
  onClientTypeChange?: (clientTypeId: number) => void;
  defaultClientTypeId?: number;
  showActiveIndicator?: boolean;
  variant?: "dropdown" | "buttons" | "radio";
}

const ClientTypeSelector: React.FC<ClientTypeSelectorProps> = ({
  onClientTypeChange,
  defaultClientTypeId,
  showActiveIndicator = true,
  variant = "dropdown",
}) => {
  const { t } = useTranslation();
  const [selectedClientTypeId, setSelectedClientTypeId] = useState<
    number | null
  >(defaultClientTypeId || null);
  const [activeClientTypeId, setActiveClientTypeId] = useState<number | null>(
    clientConfigService.getActiveClientType
      ? clientConfigService.getActiveClientType()
      : null,
  );

  // Get all available client types
  const clientConfigs = Array.from(
    clientConfigService.getAllClientConfigs().entries(),
  );

  useEffect(() => {
    // Set default client type if provided
    if (defaultClientTypeId) {
      setSelectedClientTypeId(defaultClientTypeId);
    }

    // Subscribe to client config changes
    const removeListener = clientConfigService.addChangeListener((event) => {
      if (event.configType === "active") {
        setActiveClientTypeId(event.clientTypeId);
      }
    });

    return () => removeListener();
  }, [defaultClientTypeId]);

  const handleClientTypeChange = (clientTypeId: number) => {
    setSelectedClientTypeId(clientTypeId);
    if (onClientTypeChange) {
      onClientTypeChange(clientTypeId);
    }
  };

  const handleSetActive = () => {
    if (selectedClientTypeId !== null) {
      clientConfigService.setActiveClientType(selectedClientTypeId);
    }
  };

  const getClientTypeName = (clientTypeId: number): string => {
    switch (clientTypeId) {
      case 1:
        return t("clientType.fdf", "Family Development Foundation");
      case 2:
        return t("clientType.adha", "Abu Dhabi Housing Authority");
      case 3:
        return t("clientType.cash", "Cash Client");
      default:
        return t("clientType.other", "Other Client");
    }
  };

  const getClientTypeEnum = (clientTypeId: number): ClientType => {
    switch (clientTypeId) {
      case 1:
        return ClientType.FDF;
      case 2:
        return ClientType.ADHA;
      case 3:
        return ClientType.CASH;
      default:
        return ClientType.OTHER;
    }
  };

  if (variant === "dropdown") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Select
            value={selectedClientTypeId?.toString() || ""}
            onValueChange={(value) => handleClientTypeChange(parseInt(value))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue
                placeholder={t("clientType.select", "Select Client Type")}
              />
            </SelectTrigger>
            <SelectContent>
              {clientConfigs.map(([clientTypeId, config]) => (
                <SelectItem key={clientTypeId} value={clientTypeId.toString()}>
                  <div className="flex items-center gap-2">
                    <ClientTypeIndicator
                      clientType={getClientTypeEnum(clientTypeId)}
                      showLabel={false}
                      size="sm"
                    />
                    <span>{getClientTypeName(clientTypeId)}</span>
                    {showActiveIndicator &&
                      activeClientTypeId === clientTypeId && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {t("clientType.active", "Active")}
                        </span>
                      )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showActiveIndicator &&
            selectedClientTypeId !== null &&
            selectedClientTypeId !== activeClientTypeId && (
              <Button variant="outline" size="sm" onClick={handleSetActive}>
                {t("clientType.setActive", "Set Active")}
              </Button>
            )}
        </div>

        {showActiveIndicator && activeClientTypeId !== null && (
          <div className="text-sm text-muted-foreground">
            {t("clientType.activeClient", "Active Client")}:{" "}
            {getClientTypeName(activeClientTypeId)}
          </div>
        )}
      </div>
    );
  }

  if (variant === "buttons") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {clientConfigs.map(([clientTypeId, config]) => (
            <Button
              key={clientTypeId}
              variant={
                selectedClientTypeId === clientTypeId ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleClientTypeChange(clientTypeId)}
              className="flex items-center gap-2"
            >
              <ClientTypeIndicator
                clientType={getClientTypeEnum(clientTypeId)}
                showLabel={false}
                size="sm"
              />
              <span>{getClientTypeName(clientTypeId)}</span>
              {showActiveIndicator && activeClientTypeId === clientTypeId && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  {t("clientType.active", "Active")}
                </span>
              )}
            </Button>
          ))}
        </div>

        {showActiveIndicator &&
          selectedClientTypeId !== null &&
          selectedClientTypeId !== activeClientTypeId && (
            <Button variant="outline" size="sm" onClick={handleSetActive}>
              {t(
                "clientType.setActiveSelected",
                "Set Selected Client Type as Active",
              )}
            </Button>
          )}
      </div>
    );
  }

  // Radio variant
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {clientConfigs.map(([clientTypeId, config]) => (
          <label
            key={clientTypeId}
            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${selectedClientTypeId === clientTypeId ? "border-primary bg-primary/5" : "border-gray-200"}`}
          >
            <input
              type="radio"
              name="clientType"
              checked={selectedClientTypeId === clientTypeId}
              onChange={() => handleClientTypeChange(clientTypeId)}
              className="sr-only"
            />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border ${selectedClientTypeId === clientTypeId ? "border-primary" : "border-gray-400"}`}
                >
                  {selectedClientTypeId === clientTypeId && (
                    <div className="w-2 h-2 rounded-full bg-primary m-0.5"></div>
                  )}
                </div>
                <ClientTypeIndicator
                  clientType={getClientTypeEnum(clientTypeId)}
                  size="sm"
                />
              </div>
              {showActiveIndicator && activeClientTypeId === clientTypeId && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {t("clientType.active", "Active")}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {showActiveIndicator &&
        selectedClientTypeId !== null &&
        selectedClientTypeId !== activeClientTypeId && (
          <Button variant="outline" size="sm" onClick={handleSetActive}>
            {t(
              "clientType.setActiveSelected",
              "Set Selected Client Type as Active",
            )}
          </Button>
        )}
    </div>
  );
};

export default ClientTypeSelector;
