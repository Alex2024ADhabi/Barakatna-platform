import React, { useState } from "react";
import {
  QUALITY_TEST_ISSUES,
  QUALITY_TEST_SUBTASKS,
  PROJECT_STATISTICS,
  MODULE_COVERAGE,
} from "./qualityTestResults";

interface QualityTestDashboardProps {
  onSelectIssue?: (issueId: string) => void;
  onSelectSubtask?: (taskId: string) => void;
}

export default function QualityTestDashboard({
  onSelectIssue,
  onSelectSubtask,
}: QualityTestDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "issues" | "subtasks"
  >("overview");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");

  // Filter issues based on selected filters
  const filteredIssues = QUALITY_TEST_ISSUES.filter((issue) => {
    return (
      (filterSeverity === "all" || issue.severity === filterSeverity) &&
      (filterCategory === "all" || issue.category === filterCategory) &&
      (filterModule === "all" || issue.module === filterModule)
    );
  });

  // Filter subtasks based on selected filters
  const filteredSubtasks = QUALITY_TEST_SUBTASKS.filter((task) => {
    return (
      (filterSeverity === "all" || task.priority === filterSeverity) &&
      (filterModule === "all" || task.module === filterModule)
    );
  });

  // Get unique modules for filter dropdown
  const modules = Array.from(
    new Set([
      ...QUALITY_TEST_ISSUES.map((i) => i.module),
      ...QUALITY_TEST_SUBTASKS.map((t) => t.module),
    ]),
  );

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(QUALITY_TEST_ISSUES.map((i) => i.category)),
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Barakatna Platform Quality Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "issues" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("issues")}
        >
          Issues ({QUALITY_TEST_ISSUES.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "subtasks" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("subtasks")}
        >
          Subtasks ({QUALITY_TEST_SUBTASKS.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Implementation</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{
                      width: `${PROJECT_STATISTICS.implementationCompleteness}%`,
                    }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">
                  {PROJECT_STATISTICS.implementationCompleteness}%
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                Storyboard Coverage
              </h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full"
                    style={{
                      width: `${PROJECT_STATISTICS.storyboardCoverage}%`,
                    }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">
                  {PROJECT_STATISTICS.storyboardCoverage}%
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Test Coverage</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${PROJECT_STATISTICS.testCoverage < 50 ? "bg-red-600" : "bg-yellow-500"}`}
                    style={{ width: `${PROJECT_STATISTICS.testCoverage}%` }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">
                  {PROJECT_STATISTICS.testCoverage}%
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-purple-600 h-4 rounded-full"
                    style={{
                      width: `${PROJECT_STATISTICS.documentationCoverage}%`,
                    }}
                  ></div>
                </div>
                <span className="ml-2 font-medium">
                  {PROJECT_STATISTICS.documentationCoverage}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issues by Severity</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Critical</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-red-600 h-4 rounded-full"
                        style={{
                          width: `${(PROJECT_STATISTICS.issuesBySeverity.critical / PROJECT_STATISTICS.totalIssues) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{PROJECT_STATISTICS.issuesBySeverity.critical}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">High</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-orange-500 h-4 rounded-full"
                        style={{
                          width: `${(PROJECT_STATISTICS.issuesBySeverity.high / PROJECT_STATISTICS.totalIssues) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{PROJECT_STATISTICS.issuesBySeverity.high}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Medium</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-yellow-500 h-4 rounded-full"
                        style={{
                          width: `${(PROJECT_STATISTICS.issuesBySeverity.medium / PROJECT_STATISTICS.totalIssues) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{PROJECT_STATISTICS.issuesBySeverity.medium}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Low</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{
                          width: `${(PROJECT_STATISTICS.issuesBySeverity.low / PROJECT_STATISTICS.totalIssues) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>{PROJECT_STATISTICS.issuesBySeverity.low}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Issues by Category</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PROJECT_STATISTICS.issuesByCategory).map(
                  ([category, count]) => (
                    <div key={category} className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">
                        {category}: {count}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Module Coverage</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Module</th>
                    <th className="px-4 py-2 text-left">Implementation</th>
                    <th className="px-4 py-2 text-left">Storyboards</th>
                    <th className="px-4 py-2 text-left">Tests</th>
                    <th className="px-4 py-2 text-left">Documentation</th>
                    <th className="px-4 py-2 text-left">i18n</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(MODULE_COVERAGE).map(([module, coverage]) => (
                    <tr key={module} className="border-t">
                      <td className="px-4 py-2 font-medium">{module}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${coverage.implementation}%` }}
                            ></div>
                          </div>
                          <span>{coverage.implementation}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${coverage.storyboards}%` }}
                            ></div>
                          </div>
                          <span>{coverage.storyboards}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${coverage.tests < 50 ? "bg-red-600" : "bg-yellow-500"}`}
                              style={{ width: `${coverage.tests}%` }}
                            ></div>
                          </div>
                          <span>{coverage.tests}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${coverage.documentation}%` }}
                            ></div>
                          </div>
                          <span>{coverage.documentation}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${coverage.i18n}%` }}
                            ></div>
                          </div>
                          <span>{coverage.i18n}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === "issues" && (
        <div>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                className="border rounded px-3 py-2"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="border rounded px-3 py-2"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                className="border rounded px-3 py-2"
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                <option value="all">All Modules</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Severity</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Module</th>
                  <th className="px-4 py-2 text-left">File</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectIssue && onSelectIssue(issue.id)}
                  >
                    <td className="px-4 py-2 font-medium">{issue.id}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          issue.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : issue.severity === "high"
                              ? "bg-orange-100 text-orange-800"
                              : issue.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {issue.severity.charAt(0).toUpperCase() +
                          issue.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{issue.category}</td>
                    <td className="px-4 py-2">{issue.module}</td>
                    <td className="px-4 py-2 font-mono text-sm">
                      {issue.file}
                    </td>
                    <td className="px-4 py-2">{issue.description}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          issue.status === "open"
                            ? "bg-red-100 text-red-800"
                            : issue.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtasks Tab */}
      {activeTab === "subtasks" && (
        <div>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="border rounded px-3 py-2"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Module</label>
              <select
                className="border rounded px-3 py-2"
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                <option value="all">All Modules</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Priority</th>
                  <th className="px-4 py-2 text-left">Module</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Est. Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubtasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectSubtask && onSelectSubtask(task.id)}
                  >
                    <td className="px-4 py-2 font-medium">{task.id}</td>
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "critical"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{task.module}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          task.status === "todo"
                            ? "bg-red-100 text-red-800"
                            : task.status === "in-progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{task.estimatedHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
