import * as appInsights from "applicationinsights";

export function setupApplicationInsights() {
  const connectionString = process.env.APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn(
      "⚠️  Application Insights connection string not found. Monitoring disabled."
    );
    return null;
  }

  try {
    // Initialize Application Insights
    appInsights
      .setup(connectionString)
      .setAutoDependencyCorrelation(true) // Track dependencies
      .setAutoCollectRequests(true) // Track HTTP requests (Traffic + Latency)
      .setAutoCollectPerformance(true, true) // Track performance counters (Capacity)
      .setAutoCollectExceptions(true) // Track exceptions (Error Rate)
      .setAutoCollectDependencies(true) // Track external calls
      .setAutoCollectConsole(true, true) // Collect console logs
      .setUseDiskRetryCaching(true) // Retry on network failures
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    console.log("✅ Application Insights initialized successfully");

    // Get client instance for custom tracking
    const client = appInsights.defaultClient;

    // Set common properties for all telemetry
    client.context.tags[client.context.keys.cloudRole] = "api";
    client.context.tags[client.context.keys.cloudRoleInstance] =
      process.env.HOSTNAME || "local";

    // Configure sampling (optional - reduces costs for high traffic)
    // client.config.samplingPercentage = 100; // 100 = no sampling

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Application Insights:", error);
    return null;
  }
}

export function getAppInsightsClient() {
  return appInsights.defaultClient;
}

// Helper to check if monitoring is enabled
export function isMonitoringEnabled(): boolean {
  return appInsights.defaultClient !== undefined;
}
