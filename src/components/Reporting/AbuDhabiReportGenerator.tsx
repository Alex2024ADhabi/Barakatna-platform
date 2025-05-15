import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AbuDhabiReportConfig } from "../../services/reporting/ReportTypes";
import {
  BarChart,
  FileText,
  Download,
  Calendar,
  MapPin,
  Building,
  CheckSquare,
} from "lucide-react";

interface AbuDhabiReportGeneratorProps {
  onGenerate?: (config: AbuDhabiReportConfig) => void;
  className?: string;
}

export function AbuDhabiReportGenerator({
  onGenerate,
  className = "",
}: AbuDhabiReportGeneratorProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [reportFormat, setReportFormat] = useState<string>("pdf");
  const [selectedCities, setSelectedCities] = useState<string[]>([
    "Abu Dhabi City",
    "Al Ain",
  ]);

  // Abu Dhabi cities
  const abuDhabiCities = [
    "Abu Dhabi City",
    "Al Ain",
    "Madinat Zayed",
    "Ruwais",
    "Ghayathi",
    "Liwa Oasis",
    "Delma Island",
    "Sila",
    "Mirfa",
    "Al Dhafra",
  ];

  // Report features
  const [features, setFeatures] = useState({
    propertyValuation: true,
    structuralEnhancements: true,
    renovationQuality: true,
    governmentCompliance: true,
    culturalPreservation: true,
    sustainabilityMetrics: true,
    accessibilityStandards: true,
  });

  // Report metrics
  const [metrics, setMetrics] = useState([
    "Property Modifications",
    "Accessibility Improvements",
    "Sustainability Upgrades",
    "Cultural Preservation Efforts",
    "Senior Citizen Accommodations",
  ]);

  // Additional parameters
  const [additionalParams, setAdditionalParams] = useState({
    language: "Arabic/English",
    currencyFormat: "AED",
    includeGISMapping: true,
    includeHistoricalData: true,
  });

  // Custom sections
  const [customSections, setCustomSections] = useState([
    "Executive Summary",
    "Regional Distribution",
    "Cultural Preservation Metrics",
    "Sustainability Analysis",
    "Accessibility Compliance",
    "Government Standards Adherence",
  ]);

  // Custom templates
  const [customTemplates, setCustomTemplates] = useState([
    "Abu Dhabi Executive Template",
    "Municipality Compliance Report",
    "Cultural Heritage Assessment",
  ]);

  // Date range
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  // Toggle city selection
  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter((c) => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  // Toggle feature
  const toggleFeature = (feature: keyof typeof features) => {
    setFeatures({
      ...features,
      [feature]: !features[feature],
    });
  };

  // Generate report configuration
  const generateReport = () => {
    const config: AbuDhabiReportConfig = {
      clientType: "AbuDhabi",
      region: "Abu Dhabi Emirate",
      cities: selectedCities,
      metrics,
      ...features,
      additionalParameters: additionalParams,
      customSections,
      customTemplates,
    };

    if (onGenerate) {
      onGenerate(config);
    }

    console.log("Generated Abu Dhabi Report Configuration:", config);
  };

  return (
    <Card className={`${className} bg-white`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-blue-600" />
          Abu Dhabi Emirate Report Generator
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <FileText className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="cities">
              <Building className="h-4 w-4 mr-2" />
              Cities
            </TabsTrigger>
            <TabsTrigger value="features">
              <CheckSquare className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="report-format">Report Format</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger id="report-format" className="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="html">HTML Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={additionalParams.language}
                    onValueChange={(value) =>
                      setAdditionalParams({
                        ...additionalParams,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic/English">
                        Bilingual (Arabic/English)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency Format</Label>
                  <Select
                    value={additionalParams.currencyFormat}
                    onValueChange={(value) =>
                      setAdditionalParams({
                        ...additionalParams,
                        currencyFormat: value,
                      })
                    }
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gis-mapping"
                      checked={additionalParams.includeGISMapping}
                      onCheckedChange={() =>
                        setAdditionalParams({
                          ...additionalParams,
                          includeGISMapping:
                            !additionalParams.includeGISMapping,
                        })
                      }
                    />
                    <Label htmlFor="gis-mapping">Include GIS Mapping</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="historical-data"
                      checked={additionalParams.includeHistoricalData}
                      onCheckedChange={() =>
                        setAdditionalParams({
                          ...additionalParams,
                          includeHistoricalData:
                            !additionalParams.includeHistoricalData,
                        })
                      }
                    />
                    <Label htmlFor="historical-data">
                      Include Historical Data
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cities" className="mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">
                Select Cities in Abu Dhabi Emirate
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {abuDhabiCities.map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={() => toggleCity(city)}
                    />
                    <Label htmlFor={`city-${city}`}>{city}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Report Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="property-valuation"
                    checked={features.propertyValuation}
                    onCheckedChange={() => toggleFeature("propertyValuation")}
                  />
                  <Label htmlFor="property-valuation">Property Valuation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="structural-enhancements"
                    checked={features.structuralEnhancements}
                    onCheckedChange={() =>
                      toggleFeature("structuralEnhancements")
                    }
                  />
                  <Label htmlFor="structural-enhancements">
                    Structural Enhancements
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="renovation-quality"
                    checked={features.renovationQuality}
                    onCheckedChange={() => toggleFeature("renovationQuality")}
                  />
                  <Label htmlFor="renovation-quality">Renovation Quality</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="government-compliance"
                    checked={features.governmentCompliance}
                    onCheckedChange={() =>
                      toggleFeature("governmentCompliance")
                    }
                  />
                  <Label htmlFor="government-compliance">
                    Government Compliance
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cultural-preservation"
                    checked={features.culturalPreservation}
                    onCheckedChange={() =>
                      toggleFeature("culturalPreservation")
                    }
                  />
                  <Label htmlFor="cultural-preservation">
                    Cultural Preservation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sustainability-metrics"
                    checked={features.sustainabilityMetrics}
                    onCheckedChange={() =>
                      toggleFeature("sustainabilityMetrics")
                    }
                  />
                  <Label htmlFor="sustainability-metrics">
                    Sustainability Metrics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessibility-standards"
                    checked={features.accessibilityStandards}
                    onCheckedChange={() =>
                      toggleFeature("accessibilityStandards")
                    }
                  />
                  <Label htmlFor="accessibility-standards">
                    Accessibility Standards
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3">Report Metrics</h3>
              <div className="space-y-2">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded-md flex items-center justify-between"
                  >
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AbuDhabiReportGenerator;
