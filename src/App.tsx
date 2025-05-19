import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";

// Import components
import DashboardOverview from "./components/Dashboard/DashboardOverview";
import AdminDashboard from "./components/Administration/AdminDashboard";
import { AppProvider } from "./App.provider";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginForm from "./components/Auth/LoginForm";
import RegistrationForm from "./components/Auth/RegistrationForm";
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  // Handle Tempo routes for storyboards
  const tempoRoutes = import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;

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
              <Route path="admin" element={<AdminDashboard />} />
              {/* Add more routes as needed */}
            </Route>

            {/* Auth routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginForm />} />
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
