import React from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "react-router-dom";

import { AppProvider } from "./App.provider";
import { ErrorBoundary } from "./components/ErrorBoundary";

import routes from "./routes";

function App() {
  const tempoRoutes = useRoutes(routes);
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="app-container">
          {/* Tempo routes for storyboards */}
          {tempoRoutes}
         
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
