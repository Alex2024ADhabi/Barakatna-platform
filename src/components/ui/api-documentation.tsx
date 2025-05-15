import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Separator } from "./separator";
import { Badge } from "./badge";
import { Copy, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  title: string;
  description: string;
  requestParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: any;
  responseBody: any;
  authentication?: boolean;
  deprecated?: boolean;
  version?: string;
  tags?: string[];
}

const methodColors = {
  GET: "bg-blue-100 text-blue-800 border-blue-200",
  POST: "bg-green-100 text-green-800 border-green-200",
  PUT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PATCH: "bg-orange-100 text-orange-800 border-orange-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
};

export function ApiEndpoint({
  method,
  path,
  title,
  description,
  requestParams = [],
  requestBody,
  responseBody,
  authentication = true,
  deprecated = false,
  version = "v1",
  tags = [],
}: ApiEndpointProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("example");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`px-2 py-1 rounded text-sm font-mono border ${methodColors[method]}`}
            >
              {method}
            </div>
            <CardTitle className="text-lg font-mono">{path}</CardTitle>
            {deprecated && (
              <Badge variant="destructive" className="ml-2">
                Deprecated
              </Badge>
            )}
            <Badge variant="outline" className="ml-2">
              {version}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>{title}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <p className="mb-4">{description}</p>

          {authentication && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-1">Authentication</h4>
              <p className="text-sm text-muted-foreground">
                This endpoint requires authentication. Include a valid JWT token
                in the Authorization header.
              </p>
              <div className="bg-muted p-2 rounded-md mt-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span>Authorization: Bearer YOUR_TOKEN</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard("Authorization: Bearer YOUR_TOKEN")
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {requestParams.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Request Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Parameter</th>
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Required</th>
                      <th className="text-left py-2 font-medium">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestParams.map((param) => (
                      <tr key={param.name} className="border-b">
                        <td className="py-2 font-mono">{param.name}</td>
                        <td className="py-2">{param.type}</td>
                        <td className="py-2">
                          {param.required ? "Yes" : "No"}
                        </td>
                        <td className="py-2">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Tabs
            defaultValue="example"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="example">Example</TabsTrigger>
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>

            <TabsContent value="example" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">cURL</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <div className="flex justify-between">
                      <pre className="whitespace-pre-wrap">
                        {`curl -X ${method} \
  "https://api.barakatna.org${path}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-API-Version: ${version}"`}
                        {requestBody &&
                          ` \
  -d '${JSON.stringify(requestBody, null, 2)}'`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 self-start"
                        onClick={() =>
                          copyToClipboard(
                            `curl -X ${method} \
  "https://api.barakatna.org${path}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-API-Version: ${version}"${
    requestBody
      ? ` \
  -d '${JSON.stringify(requestBody)}'`
      : ""
  }`,
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">JavaScript</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <div className="flex justify-between">
                      <pre className="whitespace-pre-wrap">
                        {`const response = await fetch("https://api.barakatna.org${path}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
    "X-API-Version": "${version}"
  }${
    requestBody
      ? `,
  body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})`
      : ""
  }
});

const data = await response.json();`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 self-start"
                        onClick={() =>
                          copyToClipboard(
                            `const response = await fetch("https://api.barakatna.org${path}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json",
    "X-API-Version": "${version}"
  }${
    requestBody
      ? `,
  body: JSON.stringify(${JSON.stringify(requestBody)})`
      : ""
  }
});

const data = await response.json();`,
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="request" className="mt-4">
              {requestBody ? (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <div className="flex justify-between">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(requestBody, null, 2)}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 self-start"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(requestBody, null, 2))
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This endpoint does not require a request body.
                </p>
              )}
            </TabsContent>

            <TabsContent value="response" className="mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Response Body</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                  <div className="flex justify-between">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(responseBody, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 self-start"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(responseBody, null, 2))
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {deprecated && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-semibold text-red-800 mb-1">
                Deprecation Notice
              </h4>
              <p className="text-sm text-red-700">
                This endpoint is deprecated and will be removed in a future
                version. Please migrate to the recommended alternative.
              </p>
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-red-700"
                asChild
              >
                <a href="/docs/migration-guide" className="flex items-center">
                  View Migration Guide
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface ApiDocumentationProps {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  endpoints: ApiEndpointProps[];
}

export function ApiDocumentation({
  title,
  description,
  version,
  baseUrl,
  endpoints,
}: ApiDocumentationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Extract all unique tags from endpoints
  const allTags = Array.from(
    new Set(endpoints.flatMap((endpoint) => endpoint.tags || [])),
  ).sort();

  // Filter endpoints based on search term and tag
  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      searchTerm === "" ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === null || (endpoint.tags || []).includes(filterTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">Version: {version}</Badge>
          <Badge variant="outline">Base URL: {baseUrl}</Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Endpoints</Label>
            <Input
              id="search"
              placeholder="Search by path, title, or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="w-full sm:w-64">
            <Label htmlFor="tag-filter">Filter by Tag</Label>
            <select
              id="tag-filter"
              className="w-full h-10 px-3 py-2 mt-1 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              value={filterTag || ""}
              onChange={(e) =>
                setFilterTag(e.target.value === "" ? null : e.target.value)
              }
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              Most API endpoints require authentication. Include your API token
              in the Authorization header of your requests:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>Authorization: Bearer YOUR_TOKEN</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard("Authorization: Bearer YOUR_TOKEN")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">API Versioning</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">
              Specify the API version using the X-API-Version header:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>X-API-Version: v1</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("X-API-Version: v1")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Endpoints</h2>
          <p className="text-sm text-muted-foreground">
            Showing {filteredEndpoints.length} of {endpoints.length} endpoints
          </p>
        </div>

        {filteredEndpoints.length > 0 ? (
          filteredEndpoints.map((endpoint, index) => (
            <ApiEndpoint
              key={`${endpoint.method}-${endpoint.path}-${index}`}
              {...endpoint}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No endpoints match your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
