/**
 * Centralized route configuration for the Barakatna Platform
 * This file defines all routes used in the application
 */

import React from "react";
import { RouteObject } from "react-router-dom";

// Layout components
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth pages
import LoginForm from "./components/Auth/LoginForm";
import RegistrationForm from "./components/Auth/RegistrationForm";
import ForgotPasswordForm from "./components/Auth/ForgotPasswordForm";
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";

// Dashboard pages
import DashboardOverview from "./components/Dashboard/DashboardOverview";

// Committee pages
import CommitteeManagementDashboard from "./components/Committee/CommitteeManagementDashboard";
import CommitteeStoryboard from "./components/Committee/CommitteeStoryboard";
import SubmissionReviewStoryboard from "./components/Committee/SubmissionReviewStoryboard";

// Assessment pages
import AssessmentDashboard from "./components/Assessment/AssessmentDashboard";
import RoomAssessmentManager from "./components/Assessment/RoomAssessmentManager";

// Client pages
import ClientManagementDashboard from "./components/Client/ClientManagementDashboard";

// Beneficiary pages
import BeneficiaryManagementDashboard from "./components/Beneficiary/BeneficiaryStoryboard";

// Budget pages
import BudgetManagementDashboard from "./components/Budget/BudgetManagementDashboard";

// Project pages
import ProjectManagementDashboard from "./components/Project/ProjectManagementDashboard";

// Admin pages
import AdminDashboard from "./components/Administration/AdminDashboard";
import UserManagement from "./components/Administration/UserManagement";
import SystemConfiguration from "./components/Administration/SystemConfiguration";

import { FinancialModuleDashboard } from "./components/Financial";
import SupplierManagement from "./components/Suppliers/SupplierManagement";
import CohortManagementDashboard from "./components/Cohort/CohortManagementDashboard";
import PriceListManagement from "./components/PriceList/PriceListManagement";

// Error pages
import NotFoundPage from "./components/ErrorPages/NotFoundPage";

/**
 * Route configuration object
 * Each route defines a path, element to render, and optional children routes
 */
export const routes: RouteObject[] = [
  // Auth routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true , element: <LoginForm /> },
      { path: "register", element: <RegistrationForm /> },
      { path: "forgot-password", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
    ],
  },

  // Main application routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },

      // PriceListManagement routes
      {
        path: "pricelist",
        children: [
          { index: true, element: <PriceListManagement /> },
        ],
      },
      // Cohort routes
      {
        path: "cohort",
        children: [
          { index: true, element: <CohortManagementDashboard /> },
        ],
      },
      // Supplier routes
      {
        path: "supplier",
        children: [
          { index: true, element: <SupplierManagement /> },
        ],
      },
      // Budget routes
      {
        path: "budget",
        children: [
          { index: true, element: <BudgetManagementDashboard /> },
        ],
      },
      // Beneficiary routes
      {
        path: "beneficiary",
        children: [
          { index: true, element: <BeneficiaryManagementDashboard /> },
        ],
      },
      // Financial routes
      {
        path: "financial",
        children: [
          { index: true, element: <FinancialModuleDashboard /> },
        ],
      },
      // Committee routes
      {
        path: "committees",
        children: [
          { index: true, element: <CommitteeManagementDashboard /> },
          { path: ":committeeId", element: <CommitteeStoryboard /> },
          {
            path: "submissions/:submissionId",
            element: <SubmissionReviewStoryboard />,
          },
        ],
      },

      // Assessment routes
      {
        path: "assessments",
        children: [
          { index: true, element: <AssessmentDashboard /> },
          { path: ":assessmentId", element: <RoomAssessmentManager /> },
        ],
      },

      // Client routes
      {
        path: "clients",
        children: [
          { index: true, element: <ClientManagementDashboard /> },
          { path: ":clientId", element: <ClientManagementDashboard /> },
        ],
      },

      // Beneficiary routes
      {
        path: "beneficiaries",
        children: [
          { index: true, element: <BeneficiaryManagementDashboard /> },
          {
            path: ":beneficiaryId",
            element: <BeneficiaryManagementDashboard />,
          },
        ],
      },

      // Budget routes
      {
        path: "budgets",
        children: [
          { index: true, element: <BudgetManagementDashboard /> },
          { path: ":budgetId", element: <BudgetManagementDashboard /> },
        ],
      },

      // Project routes
      {
        path: "projects",
        children: [
          { index: true, element: <ProjectManagementDashboard /> },
          { path: ":projectId", element: <ProjectManagementDashboard /> },
        ],
      },

      // Admin routes
      {
        path: "admin",
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "configuration", element: <SystemConfiguration /> },
        ],
      },
    ],
  },

  // 404 route
  { path: "*", element: <NotFoundPage /> },
];

/**
 * Get route by name
 * @param name Route name
 * @returns Route path
 */
export function getRoutePath(name: string): string {
  const routeMap: Record<string, string> = {
    home: "/",
    financial: "/financial",
    committees: "/committees",
    committee: "/committees/:committeeId",
    submission: "/committees/submissions/:submissionId",
    assessments: "/assessments",
    assessment: "/assessments/:assessmentId",
    clients: "/clients",
    client: "/clients/:clientId",
    beneficiaries: "/beneficiaries",
    beneficiary: "/beneficiaries/:beneficiaryId",
    budgets: "/budgets",
    budget: "/budgets/:budgetId",
    projects: "/projects",
    project: "/projects/:projectId",
    admin: "/admin",
    users: "/admin/users",
    configuration: "/admin/configuration",
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  };

  return routeMap[name] || "/";
}

export default routes;
