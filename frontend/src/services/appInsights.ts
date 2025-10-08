import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";

// Create React Plugin instance
const reactPlugin = new ReactPlugin();

// Initialize Application Insights
let appInsights: ApplicationInsights | null = null;

export function initializeAppInsights(): ApplicationInsights | null {
  const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn(
      "⚠️  Application Insights connection string not found. Frontend monitoring disabled."
    );
    return null;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        extensions: [reactPlugin],
        // Enable automatic tracking
        enableAutoRouteTracking: true, // Track route changes
        enableCorsCorrelation: true, // Correlate with backend requests
        enableRequestHeaderTracking: true, // Track request headers
        enableResponseHeaderTracking: true, // Track response headers
        enableAjaxPerfTracking: true, // Track AJAX performance
        enableAjaxErrorStatusText: true, // Include error details
        disableFetchTracking: false, // Track fetch API calls
        // Sampling (optional - reduce costs for high traffic)
        // samplingPercentage: 100,           // 100 = no sampling
        // Session and user tracking
        autoTrackPageVisitTime: true,
        enableSessionStorageBuffer: true,
        // Disable telemetry in development (optional)
        disableTelemetry:
          import.meta.env.MODE === "development" &&
          !import.meta.env.VITE_ENABLE_AI_IN_DEV,
      },
    });

    appInsights.loadAppInsights();

    // Set context for all telemetry
    appInsights.addTelemetryInitializer((envelope) => {
      if (envelope.tags) {
        envelope.tags["ai.cloud.role"] = "frontend";
        envelope.tags["ai.cloud.roleInstance"] = "react-app";
      }
    });

    console.log("✅ Application Insights (Frontend) initialized successfully");
    return appInsights;
  } catch (error) {
    console.error("❌ Failed to initialize Application Insights:", error);
    return null;
  }
}

export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

export { reactPlugin };
