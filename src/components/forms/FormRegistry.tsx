import React, { useState } from "react";
import { formRegistry } from "@/lib/forms/registry";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FormModule } from "@/lib/forms/types";
import { Button } from "@/components/ui/button";
import { Search, FileText, Eye } from "lucide-react";
//  import { useRouter } from "next/router";

interface FormRegistryProps {
  onSelectForm?: (formId: string) => void;
}

const FormRegistry: React.FC<FormRegistryProps> = ({ onSelectForm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  // const router = useRouter();

  const forms = formRegistry.getAllForms();

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || form.module === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleViewForm = (formId: string) => {
    if (onSelectForm) {
      onSelectForm(formId);
    } else {
      // router.push(`/forms/${formId}`);
    }
  };

  const handleCreateForm = (formId: string) => {
    navigate(`/forms/${formId}/create`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Registry</CardTitle>
        <CardDescription>
          Browse and access all available forms in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={FormModule.CLIENT}>Client</TabsTrigger>
            <TabsTrigger value={FormModule.ASSESSMENT}>Assessment</TabsTrigger>
            <TabsTrigger value={FormModule.PROJECT}>Project</TabsTrigger>
            <TabsTrigger value={FormModule.PROCUREMENT}>
              Procurement
            </TabsTrigger>
            <TabsTrigger value={FormModule.FINANCIAL}>Financial</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredForms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No forms found matching your criteria
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredForms.map((form) => (
                  <div
                    key={form.id}
                    className="border rounded-md p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{form.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {form.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {form.module}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            v{form.version}
                          </span>
                          {!form.isActive && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewForm(form.id)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateForm(form.id)}
                          className="flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Fill
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FormRegistry;
