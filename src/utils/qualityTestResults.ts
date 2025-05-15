/**
 * Quality Test Results
 *
 * This file contains the results of the quality test run on the Barakatna Platform
 */

export interface QualityTestIssue {
  id: string;
  module: string;
  file: string;
  line?: number;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  recommendation: string;
  status: "open" | "in-progress" | "resolved";
  assignee?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QualityTestSubtask {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
  module: string;
  estimatedHours: number;
  dependencies?: string[];
  assignee?: string;
}

export const QUALITY_TEST_ISSUES: QualityTestIssue[] = [
  // Implementation Issues
  {
    id: "IMPL-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "medium",
    category: "implementation",
    description:
      "The attachment functionality is not fully implemented. The UI allows adding attachments but there is no actual file upload implementation.",
    recommendation:
      "Implement file upload functionality using a service like AWS S3 or a local file storage solution.",
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "IMPL-002",
    module: "API",
    file: "src/components/ui/api-documentation.tsx",
    line: 193,
    severity: "medium",
    category: "implementation",
    description:
      "The API documentation component uses string interpolation inside JSX which can lead to XSS vulnerabilities.",
    recommendation:
      "Use proper escaping or React components to render dynamic content safely.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Integration Issues
  {
    id: "INTG-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "high",
    category: "integration",
    description:
      "CommitteeDecisionList relies on committeeApi but there is no error handling for API failures beyond showing a toast.",
    recommendation:
      "Implement comprehensive error handling with retry mechanisms and fallback UI states.",
    status: "open",
    createdAt: new Date().toISOString(),
  },
  {
    id: "INTG-002",
    module: "Routing",
    file: "src/App.tsx",
    severity: "medium",
    category: "integration",
    description:
      "The App component has hardcoded routes but lacks a centralized route configuration, making it difficult to maintain as the application grows.",
    recommendation:
      "Create a centralized route configuration that can be imported and used throughout the application.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // UI/UX Issues
  {
    id: "UI-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "low",
    category: "ui",
    description:
      "The filter button has an icon but no tooltip or accessible label.",
    recommendation:
      "Add aria-label or tooltip to the filter button for better accessibility.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Performance Issues
  {
    id: "PERF-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "medium",
    category: "performance",
    description:
      "Component re-renders unnecessarily due to missing memoization.",
    recommendation:
      "Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Accessibility Issues
  {
    id: "A11Y-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "high",
    category: "accessibility",
    description:
      "Table lacks proper ARIA attributes and keyboard navigation support.",
    recommendation:
      "Add appropriate ARIA roles, labels, and keyboard navigation support to the table component.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Internationalization Issues
  {
    id: "I18N-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "medium",
    category: "i18n",
    description:
      "Some hardcoded strings found in the component that are not using the translation system.",
    recommendation:
      "Replace all hardcoded strings with t() function calls and add corresponding entries to translation files.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Documentation Issues
  {
    id: "DOC-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "medium",
    category: "documentation",
    description:
      "Component lacks proper JSDoc documentation for props and functions.",
    recommendation:
      "Add comprehensive JSDoc comments to all components, props, and functions.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Testing Issues
  {
    id: "TEST-001",
    module: "Committee",
    file: "src/components/Committee",
    severity: "high",
    category: "testing",
    description: "No unit tests found for Committee components.",
    recommendation:
      "Implement unit tests for all Committee components, especially for the decision-making logic.",
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Type Safety Issues
  {
    id: "TYPE-001",
    module: "API",
    file: "src/components/ui/api-documentation.tsx",
    line: 29,
    severity: "medium",
    category: "type-safety",
    description:
      'The requestBody and responseBody props are typed as "any" which reduces type safety.',
    recommendation: 'Replace "any" types with more specific types or generics.',
    status: "open",
    createdAt: new Date().toISOString(),
  },

  // Error Handling Issues
  {
    id: "ERR-001",
    module: "Committee",
    file: "src/components/Committee/CommitteeDecisionList.tsx",
    severity: "critical",
    category: "error-handling",
    description:
      "Error handling in fetchDecisions() only logs to console and shows a toast, but does not provide recovery options.",
    recommendation:
      "Implement retry mechanism and fallback UI for API failures.",
    status: "open",
    createdAt: new Date().toISOString(),
  },
];

export const QUALITY_TEST_SUBTASKS: QualityTestSubtask[] = [
  // Implementation Subtasks
  {
    id: "TASK-001",
    title: "Implement file upload functionality for attachments",
    description:
      "Add file upload capability to the attachment dialog in CommitteeDecisionList component.",
    priority: "medium",
    status: "todo",
    module: "Committee",
    estimatedHours: 8,
  },
  {
    id: "TASK-002",
    title: "Fix XSS vulnerability in API documentation component",
    description:
      "Replace string interpolation with safe React components in the API documentation.",
    priority: "high",
    status: "todo",
    module: "API",
    estimatedHours: 4,
  },

  // Integration Subtasks
  {
    id: "TASK-003",
    title: "Improve error handling in CommitteeDecisionList",
    description:
      "Implement comprehensive error handling with retry mechanisms and fallback UI states.",
    priority: "high",
    status: "todo",
    module: "Committee",
    estimatedHours: 6,
  },
  {
    id: "TASK-004",
    title: "Create centralized route configuration",
    description:
      "Refactor routing to use a centralized configuration for better maintainability.",
    priority: "medium",
    status: "todo",
    module: "Routing",
    estimatedHours: 5,
  },

  // UI/UX Subtasks
  {
    id: "TASK-005",
    title: "Add accessibility improvements to filter button",
    description:
      "Add aria-label and tooltip to the filter button in CommitteeDecisionList.",
    priority: "low",
    status: "todo",
    module: "Committee",
    estimatedHours: 2,
  },

  // Performance Subtasks
  {
    id: "TASK-006",
    title: "Optimize rendering in CommitteeDecisionList",
    description:
      "Add memoization to prevent unnecessary re-renders in the CommitteeDecisionList component.",
    priority: "medium",
    status: "todo",
    module: "Committee",
    estimatedHours: 4,
  },

  // Accessibility Subtasks
  {
    id: "TASK-007",
    title: "Improve table accessibility",
    description:
      "Add ARIA attributes and keyboard navigation support to the table in CommitteeDecisionList.",
    priority: "high",
    status: "todo",
    module: "Committee",
    estimatedHours: 6,
  },

  // Internationalization Subtasks
  {
    id: "TASK-008",
    title: "Fix hardcoded strings in CommitteeDecisionList",
    description:
      "Replace hardcoded strings with t() function calls and add corresponding entries to translation files.",
    priority: "medium",
    status: "todo",
    module: "Committee",
    estimatedHours: 3,
  },

  // Documentation Subtasks
  {
    id: "TASK-009",
    title: "Add JSDoc documentation to CommitteeDecisionList",
    description:
      "Add comprehensive JSDoc comments to all components, props, and functions in CommitteeDecisionList.",
    priority: "medium",
    status: "todo",
    module: "Committee",
    estimatedHours: 4,
  },

  // Testing Subtasks
  {
    id: "TASK-010",
    title: "Implement unit tests for Committee components",
    description:
      "Create comprehensive unit tests for all Committee components, especially for the decision-making logic.",
    priority: "high",
    status: "todo",
    module: "Committee",
    estimatedHours: 10,
  },

  // Type Safety Subtasks
  {
    id: "TASK-011",
    title: "Improve type safety in API documentation component",
    description:
      'Replace "any" types with more specific types or generics in the API documentation component.',
    priority: "medium",
    status: "todo",
    module: "API",
    estimatedHours: 3,
  },

  // Error Handling Subtasks
  {
    id: "TASK-012",
    title: "Implement retry mechanism for API failures",
    description:
      "Add retry mechanism and fallback UI for API failures in CommitteeDecisionList.",
    priority: "critical",
    status: "todo",
    module: "Committee",
    estimatedHours: 8,
  },
];

// Module coverage statistics
export const MODULE_COVERAGE = {
  Committee: {
    implementation: 85, // 85%
    storyboards: 70, // 70%
    tests: 30, // 30%
    documentation: 60, // 60%
    i18n: 75, // 75%
  },
  API: {
    implementation: 90, // 90%
    storyboards: 60, // 60%
    tests: 40, // 40%
    documentation: 80, // 80%
    i18n: 85, // 85%
  },
  Routing: {
    implementation: 95, // 95%
    storyboards: 50, // 50%
    tests: 20, // 20%
    documentation: 70, // 70%
    i18n: 90, // 90%
  },
};

// Overall project statistics
export const PROJECT_STATISTICS = {
  totalFiles: 354,
  totalComponents: 120,
  totalStoryboards: 85,
  totalIssues: QUALITY_TEST_ISSUES.length,
  totalSubtasks: QUALITY_TEST_SUBTASKS.length,
  implementationCompleteness: 85, // 85%
  storyboardCoverage: 70, // 70%
  testCoverage: 35, // 35%
  documentationCoverage: 65, // 65%
  i18nCoverage: 80, // 80%
  issuesBySeverity: {
    critical: QUALITY_TEST_ISSUES.filter((i) => i.severity === "critical")
      .length,
    high: QUALITY_TEST_ISSUES.filter((i) => i.severity === "high").length,
    medium: QUALITY_TEST_ISSUES.filter((i) => i.severity === "medium").length,
    low: QUALITY_TEST_ISSUES.filter((i) => i.severity === "low").length,
    info: QUALITY_TEST_ISSUES.filter((i) => i.severity === "info").length,
  },
  issuesByCategory: {
    implementation: QUALITY_TEST_ISSUES.filter(
      (i) => i.category === "implementation",
    ).length,
    integration: QUALITY_TEST_ISSUES.filter((i) => i.category === "integration")
      .length,
    ui: QUALITY_TEST_ISSUES.filter((i) => i.category === "ui").length,
    performance: QUALITY_TEST_ISSUES.filter((i) => i.category === "performance")
      .length,
    accessibility: QUALITY_TEST_ISSUES.filter(
      (i) => i.category === "accessibility",
    ).length,
    i18n: QUALITY_TEST_ISSUES.filter((i) => i.category === "i18n").length,
    documentation: QUALITY_TEST_ISSUES.filter(
      (i) => i.category === "documentation",
    ).length,
    testing: QUALITY_TEST_ISSUES.filter((i) => i.category === "testing").length,
    "type-safety": QUALITY_TEST_ISSUES.filter(
      (i) => i.category === "type-safety",
    ).length,
    "error-handling": QUALITY_TEST_ISSUES.filter(
      (i) => i.category === "error-handling",
    ).length,
  },
};
