import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";

// Import components
import DashboardOverview from "./components/Dashboard/DashboardOverview";
import AdminDashboard from "./components/Administration/AdminDashboard";
import { AppProvider } from "./App.provider";

function App() {
  return (
    <AppProvider>
      <div className="app-container">
        {/* Tempo routes for storyboards */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Add more routes as needed */}

          {/* Allow Tempo to capture routes before any catchall */}
          {(import.meta.env.VITE_TEMPO || import.meta.env.TEMPO === "true") && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;
