// Initialize Application Insights BEFORE other imports
import { initializeAppInsights } from "./services/appInsights";
const appInsights = initializeAppInsights();

// Initialize Google Analytics 4
import { initializeGA4 } from "./services/googleAnalytics";
const ga4Enabled = initializeGA4();

// Regular imports
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
// import { StrictMode } from "react";

// Log monitoring status
console.log("📊 Monitoring Status:");
console.log(
  "  - Application Insights:",
  appInsights ? "✅ Enabled" : "❌ Disabled"
);
console.log(
  "  - Google Analytics 4:",
  ga4Enabled ? "✅ Enabled" : "❌ Disabled"
);

createRoot(document.getElementById("root")!).render(
  // Temporarily disable StrictMode to fix double OpenID requests
  // <StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
  // </StrictMode>
);
