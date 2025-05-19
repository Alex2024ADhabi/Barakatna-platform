import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AbuDhabiReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState("Monthly Summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sections, setSections] = useState({
    executiveSummary: true,
    projectStatistics: true,
    financialOverview: true,
    resourceAllocation: false,
    riskAssessment: false,
  });

  const handleSectionChange = (section: string) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleGenerateReport = () => {
    // In a real implementation, this would generate the report
    console.log("Generating report with:", {
      reportType,
      dateRange: { startDate, endDate },
      sections,
    });
    // Show success message or handle the report generation
    alert("Report generated successfully!");
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Abu Dhabi Report Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Report Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option>Monthly Summary</option>
                  <option>Quarterly Analysis</option>
                  <option>Annual Review</option>
                  <option>Custom Period</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="border rounded-md p-2 flex-1"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="flex items-center">to</span>
                  <input
                    type="date"
                    className="border rounded-md p-2 flex-1"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Report Sections</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="section1"
                  className="mr-2"
                  checked={sections.executiveSummary}
                  onChange={() => handleSectionChange("executiveSummary")}
                />
                <label htmlFor="section1">Executive Summary</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="section2"
                  className="mr-2"
                  checked={sections.projectStatistics}
                  onChange={() => handleSectionChange("projectStatistics")}
                />
                <label htmlFor="section2">Project Statistics</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="section3"
                  className="mr-2"
                  checked={sections.financialOverview}
                  onChange={() => handleSectionChange("financialOverview")}
                />
                <label htmlFor="section3">Financial Overview</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="section4"
                  className="mr-2"
                  checked={sections.resourceAllocation}
                  onChange={() => handleSectionChange("resourceAllocation")}
                />
                <label htmlFor="section4">Resource Allocation</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="section5"
                  className="mr-2"
                  checked={sections.riskAssessment}
                  onChange={() => handleSectionChange("riskAssessment")}
                />
                <label htmlFor="section5">Risk Assessment</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
              Preview
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
