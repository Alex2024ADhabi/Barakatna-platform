import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, CheckCircle, RefreshCw, Save, TestTube, Webhook } from "lucide-react";
import { useContext } from 'react';
import { ClientContext } from '../../context/ClientContext';
import { ClientType } from '../../lib/api/client/types';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

interface IntegrationSystem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSyncTime?: Date;
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  clientSpecificSettings: Record<number, ClientIntegrationSettings>;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  expiryDate?: Date;
  scopes: string[];
  isActive: boolean;
  createdDate: Date;
  lastUsed?: Date;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
}

interface ClientIntegrationSettings {
  enabled: boolean;
  customEndpoint?: string;
  customHeaders?: Record<string, string>;
  mappingProfileId?: string;
  syncFrequency?: 'hourly' | 'daily' | 'weekly' | 'manual';
  syncDirection: 'import' | 'export' | 'bidirectional';
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
  integrationId: string;
  clientId?: number;
}

interface IntegrationConfigurationPanelProps {
  onSave?: (data: any) => Promise<void>;
  onTest?: (integrationId: string) => Promise<boolean>;
  onRefreshStatus?: (integrationId: string) => Promise<void>;
}

const MOCK_INTEGRATIONS: IntegrationSystem[] = [
  {
    id: 'crm-system',
    name: 'CRM System',
    description: 'Integration with the main customer relationship management system',
    status: 'active',
    lastSyncTime: new Date(Date.now() - 3600000),
    apiKeys: [
      {
        id: 'api-1',
        name: 'Production API Key',
        key: '••••••••••••••••',
        expiryDate: new Date(Date.now() + 30 * 24 * 3600000),
        scopes: ['read', 'write'],
        isActive: true,
        createdDate: new Date(Date.now() - 90 * 24 * 3600000),
        lastUsed: new Date(Date.now() - 24 * 3600000)
      }
    ],
    webhooks: [
      {
        id: 'wh-1',
        name: 'New Client Notification',
        url: 'https://api.example.com/webhooks/clients',
        secret: '••••••••••••••••',
        events: ['client.created', 'client.updated'],
        isActive: true,
        lastTriggered: new Date(Date.now() - 48 * 3600000),
        failureCount: 0
      }
    ],
    clientSpecificSettings: {
      1: {
        enabled: true,
        syncFrequency: 'daily',
        syncDirection: 'bidirectional',
        mappingProfileId: 'map-1'
      },
      2: {
        enabled: true,
        customEndpoint: 'https://api.adha-custom.gov/crm',
        syncFrequency: 'hourly',
        syncDirection: 'import'
      }
    }
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    description: 'Integration with payment processing system',
    status: 'active',
    lastSyncTime: new Date(Date.now() - 1800000),
    apiKeys: [
      {
        id: 'api-2',
        name: 'Payment API Key',
        key: '••••••••••••••••',
        scopes: ['transactions'],
        isActive: true,
        createdDate: new Date(Date.now() - 120 * 24 * 3600000)
      }
    ],
    webhooks: [
      {
        id: 'wh-2',
        name: 'Payment Notification',
        url: 'https://api.example.com/webhooks/payments',
        secret: '••••••••••••••••',
        events: ['payment.success', 'payment.failed'],
        isActive: true,
        lastTriggered: new Date(Date.now() - 12 * 3600000),
        failureCount: 0
      }
    ],
    clientSpecificSettings: {
      3: {
        enabled: true,
        syncFrequency: 'daily',
        syncDirection: 'export'
      }
    }
  },
  {
    id: 'gov-portal',
    name: 'Government Portal',
    description: 'Integration with government services portal',
    status: 'error',
    lastSyncTime: new Date(Date.now() - 86400000),
    apiKeys: [
      {
        id: 'api-3',
        name: 'Gov API Key',
        key: '••••••••••••••••',
        expiryDate: new Date(Date.now() - 10 * 24 * 3600000), // Expired
        scopes: ['read'],
        isActive: false,
        createdDate: new Date(Date.now() - 180 * 24 * 3600000)
      }
    ],
    webhooks: [],
    clientSpecificSettings: {
      2: {
        enabled: true,
        customEndpoint: 'https://api.gov.example/services',
        syncFrequency: 'weekly',
        syncDirection: 'import'
      }
    }
  }
];

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000),
    level: 'info',
    message: 'Sync completed successfully',
    details: 'Processed 156 records',
    integrationId: 'crm-system',
    clientId: 1
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 7200000),
    level: 'warning',
    message: 'Partial sync completed',
    details: 'Some records failed validation',
    integrationId: 'crm-system',
    clientId: 2
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 86400000),
    level: 'error',
    message: 'API authentication failed',
    details: 'API key expired',
    integrationId: 'gov-portal',
    clientId: 2
  }
];

export const IntegrationConfigurationPanel: React.FC<IntegrationConfigurationPanelProps> = ({ 
  onSave, 
  onTest, 
  onRefreshStatus 
}) => {
  const [integrations, setIntegrations] = useState<IntegrationSystem[]>(MOCK_INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  
  const { clientType } = useContext(ClientContext);
  
  useEffect(() => {
    if (integrations.length > 0 && !selectedIntegration) {
      setSelectedIntegration(integrations[0].id);
    }
  }, [integrations, selectedIntegration]);

  const currentIntegration = integrations.find(i => i.id === selectedIntegration);

  const handleSave = async () => {
    if (!currentIntegration) return;
    
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(currentIntegration);
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to save integration configuration:', error);
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!currentIntegration) return;
    
    setIsLoading(true);
    setTestResult(null);
    try {
      let success = true;
      if (onTest) {
        success = await onTest(currentIntegration.id);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        success = currentIntegration.status !== 'error';
      }
      
      setTestResult({
        success,
        message: success ? 'Connection test successful' : 'Connection test failed. Check credentials and endpoint.'
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to test integration:', error);
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!currentIntegration) return;
    
    setIsLoading(true);
    try {
      if (onRefreshStatus) {
        await onRefreshStatus(currentIntegration.id);
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the status in our local state
      setIntegrations(prevIntegrations => 
        prevIntegrations.map(integration => 
          integration.id === currentIntegration.id 
            ? { ...integration, lastSyncTime: new Date() } 
            : integration
        )
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to refresh integration status:', error);
      setIsLoading(false);
    }
  };

  const handleAddApiKey = () => {
    if (!currentIntegration) return;
    
    const newApiKey: ApiKey = {
      id: `api-${Date.now()}`,
      name: 'New API Key',
      key: '••••••••••••••••',
      scopes: [],
      isActive: true,
      createdDate: new Date()
    };
    
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { ...integration, apiKeys: [...integration.apiKeys, newApiKey] } 
          : integration
      )
    );
  };

  const handleAddWebhook = () => {
    if (!currentIntegration) return;
    
    const newWebhook: Webhook = {
      id: `wh-${Date.now()}`,
      name: 'New Webhook',
      url: '',
      secret: '',
      events: [],
      isActive: true,
      failureCount: 0
    };
    
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { ...integration, webhooks: [...integration.webhooks, newWebhook] } 
          : integration
      )
    );
  };

  const handleUpdateApiKey = (apiKeyId: string, updates: Partial<ApiKey>) => {
    if (!currentIntegration) return;
    
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { 
              ...integration, 
              apiKeys: integration.apiKeys.map(apiKey => 
                apiKey.id === apiKeyId ? { ...apiKey, ...updates } : apiKey
              ) 
            } 
          : integration
      )
    );
  };

  const handleUpdateWebhook = (webhookId: string, updates: Partial<Webhook>) => {
    if (!currentIntegration) return;
    
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { 
              ...integration, 
              webhooks: integration.webhooks.map(webhook => 
                webhook.id === webhookId ? { ...webhook, ...updates } : webhook
              ) 
            } 
          : integration
      )
    );
  };

  const handleUpdateClientSettings = (clientId: number, updates: Partial<ClientIntegrationSettings>) => {
    if (!currentIntegration) return;
    
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === currentIntegration.id 
          ? { 
              ...integration, 
              clientSpecificSettings: {
                ...integration.clientSpecificSettings,
                [clientId]: {
                  ...integration.clientSpecificSettings[clientId],
                  ...updates
                }
              }
            } 
          : integration
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (!currentIntegration) {
    return <div className="p-4">No integrations available</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integration Configuration</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={isLoading}
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"} className="mb-4">
          {testResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Available integration systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {integrations.map(integration => (
                  <div 
                    key={integration.id} 
                    className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${selectedIntegration === integration.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedIntegration(integration.id)}
                  >
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-gray-500">{integration.description}</div>
                    </div>
                    <div>
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentIntegration.name}</CardTitle>
                  <CardDescription>{currentIntegration.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span> {getStatusBadge(currentIntegration.status)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Last Sync:</span> {formatDate(currentIntegration.lastSyncTime)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
                  <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                  <TabsTrigger value="clientSettings">Client Settings</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="integration-name">Integration Name</Label>
                        <Input 
                          id="integration-name" 
                          value={currentIntegration.name} 
                          onChange={(e) => {
                            setIntegrations(prevIntegrations => 
                              prevIntegrations.map(integration => 
                                integration.id === currentIntegration.id 
                                  ? { ...integration, name: e.target.value } 
                                  : integration
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="integration-status">Status</Label>
                        <Select 
                          value={currentIntegration.status}
                          onValueChange={(value: 'active' | 'inactive' | 'error' | 'pending') => {
                            setIntegrations(prevIntegrations => 
                              prevIntegrations.map(integration => 
                                integration.id === currentIntegration.id 
                                  ? { ...integration, status: value } 
                                  : integration
                              )
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="integration-description">Description</Label>
                      <Textarea 
                        id="integration-description" 
                        value={currentIntegration.description}
                        onChange={(e) => {
                          setIntegrations(prevIntegrations => 
                            prevIntegrations.map(integration => 
                              integration.id === currentIntegration.id 
                                ? { ...integration, description: e.target.value } 
                                : integration
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="apiKeys">
                  <div className="space-y-4">
                    {currentIntegration.apiKeys.map(apiKey => (
                      <Card key={apiKey.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Created:</span> {formatDate(apiKey.createdDate)}
                              </div>
                              <Switch 
                                checked={apiKey.isActive} 
                                onCheckedChange={(checked) => handleUpdateApiKey(apiKey.id, { isActive: checked })}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`api-key-name-${apiKey.id}`}>Name</Label>
                                <Input 
                                  id={`api-key-name-${apiKey.id}`} 
                                  value={apiKey.name}
                                  onChange={(e) => handleUpdateApiKey(apiKey.id, { name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`api-key-value-${apiKey.id}`}>API Key</Label>
                                <div className="flex space-x-2">
                                  <Input 
                                    id={`api-key-value-${apiKey.id}`} 
                                    value={apiKey.key}
                                    type="password"
                                    readOnly
                                  />
                                  <Button variant="outline" size="sm">
                                    Regenerate
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`api-key-expiry-${apiKey.id}`}>Expiry Date</Label>
                                <Input 
                                  id={`api-key-expiry-${apiKey.id}`} 
                                  type="date"
                                  value={apiKey.expiryDate ? apiKey.expiryDate.toISOString().split('T')[0] : ''}
                                  onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    handleUpdateApiKey(apiKey.id, { expiryDate: date });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`api-key-last-used-${apiKey.id}`}>Last Used</Label>
                                <Input 
                                  id={`api-key-last-used-${apiKey.id}`} 
                                  value={apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                                  disabled
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Scopes</Label>
                              <div className="flex flex-wrap gap-2">
                                {['read', 'write', 'delete', 'admin', 'transactions'].map(scope => (
                                  <div key={scope} className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      id={`scope-${apiKey.id}-${scope}`}
                                      checked={apiKey.scopes.includes(scope)}
                                      onChange={(e) => {
                                        const newScopes = e.target.checked
                                          ? [...apiKey.scopes, scope]
                                          : apiKey.scopes.filter(s => s !== scope);
                                        handleUpdateApiKey(apiKey.id, { scopes: newScopes });
                                      }}
                                    />
                                    <Label htmlFor={`scope-${apiKey.id}-${scope}`}>{scope}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={handleAddApiKey}>
                      Add API Key
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="webhooks">
                  <div className="space-y-4">
                    {currentIntegration.webhooks.map(webhook => (
                      <Card key={webhook.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{webhook.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              {webhook.lastTriggered && (
                                <div className="text-sm">
                                  <span className="text-gray-500">Last Triggered:</span> {formatDate(webhook.lastTriggered)}
                                </div>
                              )}
                              <Switch 
                                checked={webhook.isActive} 
                                onCheckedChange={(checked) => handleUpdateWebhook(webhook.id, { isActive: checked })}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`webhook-name-${webhook.id}`}>Name</Label>
                                <Input 
                                  id={`webhook-name-${webhook.id}`} 
                                  value={webhook.name}
                                  onChange={(e) => handleUpdateWebhook(webhook.id, { name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`webhook-url-${webhook.id}`}>URL</Label>
                                <Input 
                                  id={`webhook-url-${webhook.id}`} 
                                  value={webhook.url}
                                  onChange={(e) => handleUpdateWebhook(webhook.id, { url: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`webhook-secret-${webhook.id}`}>Secret</Label>
                                <div className="flex space-x-2">
                                  <Input 
                                    id={`webhook-secret-${webhook.id}`} 
                                    value={webhook.secret}
                                    type="password"
                                    onChange={(e) => handleUpdateWebhook(webhook.id, { secret: e.target.value })}
                                  />
                                  <Button variant="outline" size="sm">
                                    Generate
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`webhook-failures-${webhook.id}`}>Failure Count</Label>
                                <Input 
                                  id={`webhook-failures-${webhook.id}`} 
                                  value={webhook.failureCount.toString()}
                                  disabled
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Events</Label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  'client.created', 'client.updated', 'client.deleted',
                                  'payment.success', 'payment.failed', 'payment.refunded',
                                  'assessment.created', 'assessment.updated', 'assessment.completed'
                                ].map(event => (
                                  <div key={event} className="flex items-center space-x-2">
                                    <input 
                                      type="checkbox" 
                                      id={`event-${webhook.id}-${event}`}
                                      checked={webhook.events.includes(event)}
                                      onChange={(e) => {
                                        const newEvents = e.target.checked
                                          ? [...webhook.events, event]
                                          : webhook.events.filter(ev => ev !== event);
                                        handleUpdateWebhook(webhook.id, { events: newEvents });
                                      }}
                                    />
                                    <Label htmlFor={`event-${webhook.id}-${event}`}>{event}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={handleAddWebhook}>
                      <Webhook className="mr-2 h-4 w-4" />
                      Add Webhook
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="clientSettings">
                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      {Object.entries(currentIntegration.clientSpecificSettings).map(([clientId, settings]) => {
                        const clientTypeId = parseInt(clientId);
                        const clientTypeName = clientType?.typeNameEN || `Client Type ${clientId}`;
                        
                        return (
                          <AccordionItem key={clientId} value={clientId}>
                            <AccordionTrigger className="px-4">
                              <div className="flex justify-between items-center w-full pr-4">
                                <span>{clientTypeName}</span>
                                <Badge className={settings.enabled ? "bg-green-500" : "bg-gray-500"}>
                                  {settings.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4">
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={settings.enabled} 
                                    onCheckedChange={(checked) => handleUpdateClientSettings(clientTypeId, { enabled: checked })}
                                  />
                                  <Label>Enable integration for this client type</Label>
                                </div>
                                
                                {settings.enabled && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`custom-endpoint-${clientId}`}>Custom Endpoint URL</Label>
                                        <Input 
                                          id={`custom-endpoint-${clientId}`} 
                                          value={settings.customEndpoint || ''}
                                          onChange={(e) => handleUpdateClientSettings(clientTypeId, { customEndpoint: e.target.value })}
                                          placeholder="https://api.example.com"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`mapping-profile-${clientId}`}>Mapping Profile</Label>
                                        <Select 
                                          value={settings.mappingProfileId || ''}
                                          onValueChange={(value) => handleUpdateClientSettings(clientTypeId, { mappingProfileId: value })}
                                        >
                                          <SelectTrigger id={`mapping-profile-${clientId}`}>
                                            <SelectValue placeholder="Select mapping profile" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="map-1">Default Mapping</SelectItem>
                                            <SelectItem value="map-2">Extended Mapping</SelectItem>
                                            <SelectItem value="map-3">Minimal Mapping</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`sync-frequency-${clientId}`}>Sync Frequency</Label>
                                        <Select 
                                          value={settings.syncFrequency || 'daily'}
                                          onValueChange={(value: 'hourly' | 'daily' | 'weekly' | 'manual') => 
                                            handleUpdateClientSettings(clientTypeId, { syncFrequency: value })
                                          }
                                        >
                                          <SelectTrigger id={`sync-frequency-${clientId}`}>
                                            <SelectValue placeholder="Select frequency" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="manual">Manual</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`sync-direction-${clientId}`}>Sync Direction</Label>
                                        <Select 
                                          value={settings.syncDirection}
                                          onValueChange={(value: 'import' | 'export' | 'bidirectional') => 
                                            handleUpdateClientSettings(clientTypeId, { syncDirection: value })
                                          }
                                        >
                                          <SelectTrigger id={`sync-direction-${clientId}`}>
                                            <SelectValue placeholder="Select direction" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="import">Import Only</SelectItem>
                                            <SelectItem value="export">Export Only</SelectItem>
                                            <SelectItem value="bidirectional">Bidirectional</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label>Custom Headers</Label>
                                      <Textarea 
                                        value={settings.customHeaders ? JSON.stringify(settings.customHeaders, null, 2) : ''}
                                        onChange={(e) => {
                                          try {
                                            const headers = e.target.value ? JSON.parse(e.target.value) : {};
                                            handleUpdateClientSettings(clientTypeId, { customHeaders: headers });
                                          } catch (error) {
                                            // Invalid JSON, don't update
                                          }
                                        }}
                                        placeholder="{\n  \"X-Custom-Header\": \"Value\"\n}"
                                        className="font-mono"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                    
                    <Button variant="outline">
                      Add Client-Specific Configuration
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="logs">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Integration Logs</h3>
                      <div className="flex space-x-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Log level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {logs
                            .filter(log => log.integrationId === currentIntegration.id)
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .map(log => (
                              <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge 
                                    className={
                                      log.level === 'error' ? 'bg-red-500' : 
                                      log.level === 'warning' ? 'bg-yellow-500' : 
                                      'bg-blue-500'
                                    }
                                  >
                                    {log.level}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div>{log.message}</div>
                                  {log.details && <div className="text-xs text-gray-500">{log.details}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.clientId ? `Client ${log.clientId}` : 'All Clients'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConfigurationPanel;
