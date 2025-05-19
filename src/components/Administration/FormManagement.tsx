import React, { useState, useEffect } from "react";
import { formRegistry } from "../../lib/forms/registry";
import { FormModule, FormRegistryEntry } from "../../lib/forms/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";

export default function FormManagement() {
  const [forms, setForms] = useState<FormRegistryEntry[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormRegistryEntry[]>([]);
  const [activeModule, setActiveModule] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    // Load all forms from the registry
    const allForms = formRegistry.getAllForms();
    setForms(allForms);
    setFilteredForms(allForms);

    // Extract unique modules
    const uniqueModules = Array.from(
      new Set(["all", ...allForms.map((form) => form.module)]),
    );
    setModules(uniqueModules);
  }, []);

  useEffect(() => {
    // Filter forms based on active module and search query
    let filtered = forms;

    if (activeModule !== "all") {
      filtered = filtered.filter((form) => form.module === activeModule);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (form) =>
          form.title.toLowerCase().includes(query) ||
          form.description.toLowerCase().includes(query) ||
          form.id.toLowerCase().includes(query),
      );
    }

    setFilteredForms(filtered);
  }, [activeModule, searchQuery, forms]);

  const handleModuleChange = (value: string) => {
    setActiveModule(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getModuleDisplayName = (moduleKey: string) => {
    if (moduleKey === "all") return "All Modules";
    return (
      moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1).replace("_", " ")
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Form Management</h2>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Select value={activeModule} onValueChange={handleModuleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {getModuleDisplayName(module)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end w-full md:w-1/3">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Form
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
          <CardDescription>
            Manage forms across all modules in the Barakatna platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No forms found
                  </TableCell>
                </TableRow>
              ) : (
                filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{form.title}</div>
                        <div className="text-sm text-gray-500">
                          {form.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getModuleDisplayName(form.module)}</TableCell>
                    <TableCell>{form.version}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${form.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
