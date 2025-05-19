import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Import i18n configuration
import "./i18n";

// Initialize Tempo Devtools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL || "";
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}
