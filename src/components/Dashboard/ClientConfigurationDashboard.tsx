import React, { useState } from "react";
import { clientConfigService } from "@/services/clientConfigService";
import { ClientTypeIndicator } from "../Beneficiary/ClientTypeIndicator";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ClientConfigDisplay from "../Client/ClientConfigDisplay";
import ClientAwarePriceList from "../PriceList/ClientAwarePriceList";
import ClientAwareSupplierList from "../Suppliers/ClientAwareSupplierList";

export const ClientConfigurationDashboard: React.FC = () => {
  const [selectedClientType, setSelectedClientType] = useState<number | null>(
    null,
  );

  const setClientType = (clientTypeId: number) => {
    clientConfigService.setActiveClientType(clientTypeId);
    setSelectedClientType(clientTypeId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Configuration Dashboard</CardTitle>
          <CardDescription>
            Manage and view client-specific configurations and their effects on
            the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-md">
              <h3 className="text-lg font-medium mb-3">Select Client Type</h3>
              <div className="flex flex-wrap gap-3">
                {/* Dynamic client type buttons */}
                {React.useMemo(() => {
                  // Get all client types from the service
                  const clientConfigs =
                    clientConfigService.getAllClientConfigs();
                  const clientTypes: Array<{ id: number; name: string }> = [];

                  // Convert Map to array for rendering
                  clientConfigs.forEach((config, id) => {
                    let name = "";
                    switch (id) {
                      case 1:
                        name = "Family Development Foundation";
                        break;
                      case 2:
                        name = "Abu Dhabi Housing Authority";
                        break;
                      case 3:
                        name = "Cash-Based Client";
                        break;
                      default:
                        name = `Client Type ${id}`;
                    }
                    clientTypes.push({ id, name });
                  });

                  return clientTypes.map((clientType) => (
                    <Button
                      key={clientType.id}
                      variant={
                        selectedClientType === clientType.id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setClientType(clientType.id)}
                      className="flex items-center gap-2"
                    >
                      <ClientTypeIndicator
                        clientTypeId={clientType.id}
                        showLabel={false}
                      />
                      {clientType.name}
                    </Button>
                  ));
                }, [selectedClientType, setClientType])}
              </div>
            </div>

            <Tabs defaultValue="config">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="pricing">Price List</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                <ClientConfigDisplay />
              </TabsContent>

              <TabsContent value="pricing" className="mt-4">
                <ClientAwarePriceList />
              </TabsContent>

              <TabsContent value="suppliers" className="mt-4">
                <ClientAwareSupplierList />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Client configuration affects pricing, suppliers, and workflow
            throughout the system
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientConfigurationDashboard;
