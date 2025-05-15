import React, { createContext, useContext, useState, useEffect } from "react";
import { ClientType } from "@/lib/forms/types";
import { clientConfigService } from "@/services/clientConfigService";
import { useToast } from "@/components/ui/use-toast";
import eventBus, { EventType } from "@/services/eventBus";

interface ClientContextType {
  clientType: ClientType;
  setClientType: (clientType: ClientType) => void;
  clientConfig: any | null;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType>({
  clientType: ClientType.FDF,
  setClientType: () => {},
  clientConfig: null,
  isLoading: false,
  refreshConfig: async () => {},
});

export const useClient = () => useContext(ClientContext);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clientType, setClientType] = useState<ClientType>(ClientType.FDF);
  const [clientConfig, setClientConfig] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize client type and load configuration
  useEffect(() => {
    const initializeClientType = async () => {
      try {
        // Get active client type from service
        const storedClientType = clientConfigService.getActiveClientType();
        if (storedClientType) {
          const clientTypeEnum = Object.values(ClientType).find(
            (ct) => ct === String(storedClientType),
          ) as ClientType | undefined;

          if (clientTypeEnum) {
            setClientType(clientTypeEnum);
          }
        }

        // Load configurations from API
        await clientConfigService.loadConfigurationsFromApi();

        // Load the active client configuration
        await refreshClientConfig();
      } catch (error) {
        console.error("Error initializing client context:", error);
        toast({
          title: "Error",
          description: "Failed to load client configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeClientType();
  }, [toast]);

  // Subscribe to client type change events
  useEffect(() => {
    const handleClientTypeChange = (event: any) => {
      if (
        event.type === EventType.CLIENT_TYPE_CHANGED &&
        event.payload?.clientType
      ) {
        setClientType(event.payload.clientType);
        refreshClientConfig();
      }
    };

    const unsubscribe = eventBus.subscribe(
      EventType.CLIENT_TYPE_CHANGED,
      handleClientTypeChange,
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to configuration changes
  useEffect(() => {
    const unsubscribe = clientConfigService.addChangeListener((event) => {
      if (event.configType === "modified" || event.configType === "active") {
        refreshClientConfig();
      }
    });

    return unsubscribe;
  }, []);

  // Handle client type change
  const handleClientTypeChange = (newClientType: ClientType) => {
    setClientType(newClientType);
    clientConfigService.setActiveClientType(Number(newClientType));
    refreshClientConfig();

    // Publish event for other components to react to
    eventBus.publish({
      id: crypto.randomUUID(),
      type: EventType.CLIENT_TYPE_CHANGED,
      timestamp: new Date().toISOString(),
      source: "ClientContext",
      payload: { clientType: newClientType },
    });
  };

  // Refresh client configuration
  const refreshClientConfig = async () => {
    setIsLoading(true);
    try {
      const config = clientConfigService.getActiveClientConfig();
      setClientConfig(config || null);
    } catch (error) {
      console.error("Error refreshing client configuration:", error);
      toast({
        title: "Error",
        description: "Failed to refresh client configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientContext.Provider
      value={{
        clientType,
        setClientType: handleClientTypeChange,
        clientConfig,
        isLoading,
        refreshConfig: refreshClientConfig,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
