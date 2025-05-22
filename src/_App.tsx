import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";

import { AppProvider } from "./App.provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import components
import MainLayout from "./layouts/MainLayout";
import DashboardOverview from "./components/Dashboard/DashboardOverview";
import AssessmentDashboard from "./components/Assessment/AssessmentDashboard";
import CommitteeManagementDashboard from "./components/Committee/CommitteeManagementDashboard";
import AdminDashboard from "./components/Administration/AdminDashboard";
import UserManagement from "./components/Administration/UserManagement";

import BeneficiarySearchForm from "./components/Beneficiary/BeneficiarySearchForm";

// --------------------------------------------------------------------------
import AuthLayout from "./layouts/AuthLayout";
import LoginForm from "./components/Auth/LoginForm";
import RegistrationForm from "./components/Auth/RegistrationForm";
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";

function App() {
  // Handle Tempo routes for storyboards
  // const tempoRoutes = import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;
  const tempoRoutes = useRoutes(routes);

  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="app-container">
          {/* Tempo routes for storyboards */}
          {tempoRoutes}

          <Routes>
            {/* Main application routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="assessments" element={<AssessmentDashboard />} />
              <Route path="committees" element={<CommitteeManagementDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />

              <Route path="benefit" element={<BeneficiarySearchForm />} />

              {/* Add more routes as needed */}
            </Route>

            {/* Auth routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<LoginForm />} />
              <Route path="register" element={<RegistrationForm />} />
              <Route path="reset-password" element={<ResetPasswordForm />} />
            </Route>

            {/* Allow Tempo to capture routes before any catchall */}
            {import.meta.env.VITE_TEMPO ? (
              <Route path="/tempobook/*" element={<></>} />
            ) : null}
          </Routes>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
