import { Request, Response, NextFunction } from "express";
import { getAppInsightsClient } from "./appInsights";

/**
 * Middleware to track Golden Signals:
 * 1. Latency - Response time
 * 2. Error Rate - Failed requests
 * 3. Traffic - Request count (auto-tracked)
 * 4. Capacity - CPU/Memory (auto-tracked)
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const client = getAppInsightsClient();

  // Skip monitoring for health check to reduce noise
  if (req.path === "/health" && !process.env.MONITOR_HEALTH_CHECKS) {
    return next();
  }

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to capture metrics
  res.end = function (this: Response, ...args: any[]): Response {
    // Calculate latency (Golden Signal #1: LATENCY)
    const duration = Date.now() - startTime;

    if (client) {
      try {
        // Track custom metric for latency
        client.trackMetric({
          name: "API Response Time",
          value: duration,
          properties: {
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode.toString(),
            route: (req as any).route?.path || req.path,
          },
        });

        // Track error rate (Golden Signal #2: ERROR RATE)
        if (res.statusCode >= 400) {
          client.trackMetric({
            name: "API Error",
            value: 1,
            properties: {
              endpoint: req.path,
              method: req.method,
              statusCode: res.statusCode.toString(),
              errorType:
                res.statusCode >= 500 ? "server_error" : "client_error",
            },
          });

          // Also track as custom event for easier querying
          client.trackEvent({
            name: "API Error",
            properties: {
              endpoint: req.path,
              method: req.method,
              statusCode: res.statusCode.toString(),
              errorType:
                res.statusCode >= 500 ? "server_error" : "client_error",
              userAgent: req.get("user-agent") || "unknown",
            },
            measurements: {
              duration: duration,
            },
          });
        }

        // Track successful requests for analysis
        if (res.statusCode >= 200 && res.statusCode < 300) {
          client.trackEvent({
            name: "API Success",
            properties: {
              endpoint: req.path,
              method: req.method,
              statusCode: res.statusCode.toString(),
            },
            measurements: {
              duration: duration,
            },
          });
        }

        // Traffic is automatically tracked by auto-collection (Golden Signal #3: TRAFFIC)
        // Capacity metrics are tracked by performance counters (Golden Signal #4: CAPACITY)
      } catch (error) {
        console.error("Error tracking metrics:", error);
      }
    }

    // Call original end function
    return originalEnd.apply(this, args as any);
  };

  next();
}

/**
 * Track custom events
 * @param eventName - Name of the event
 * @param properties - Custom string properties
 * @param measurements - Custom numeric measurements
 */
export function trackCustomEvent(
  eventName: string,
  properties?: { [key: string]: string },
  measurements?: { [key: string]: number }
) {
  const client = getAppInsightsClient();
  if (client) {
    try {
      client.trackEvent({
        name: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
        measurements,
      });
    } catch (error) {
      console.error("Error tracking custom event:", error);
    }
  }
}

/**
 * Track custom metrics
 * @param metricName - Name of the metric
 * @param value - Numeric value
 * @param properties - Additional context
 */
export function trackCustomMetric(
  metricName: string,
  value: number,
  properties?: { [key: string]: string }
) {
  const client = getAppInsightsClient();
  if (client) {
    try {
      client.trackMetric({
        name: metricName,
        value: value,
        properties,
      });
    } catch (error) {
      console.error("Error tracking custom metric:", error);
    }
  }
}

/**
 * Track custom errors with context
 * @param error - Error object
 * @param properties - Additional context properties
 */
export function trackCustomError(
  error: Error,
  properties?: { [key: string]: string }
) {
  const client = getAppInsightsClient();
  if (client) {
    try {
      client.trackException({
        exception: error,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          errorMessage: error.message,
          errorName: error.name,
        },
      });
    } catch (trackingError) {
      console.error("Error tracking exception:", trackingError);
    }
  }

  // Always log to console as backup
  console.error("Error:", error, properties);
}

/**
 * Track dependency calls (external APIs, databases, etc.)
 * @param dependencyName - Name of the dependency
 * @param duration - Call duration in ms
 * @param success - Whether the call succeeded
 * @param data - Optional data about the call
 */
export function trackDependency(
  dependencyName: string,
  duration: number,
  success: boolean,
  data?: string,
  dependencyType: string = "HTTP"
) {
  const client = getAppInsightsClient();
  if (client) {
    try {
      client.trackDependency({
        name: dependencyName,
        data: data || "",
        duration: duration,
        success: success,
        dependencyTypeName: dependencyType,
        resultCode: success ? "200" : "500",
      });
    } catch (error) {
      console.error("Error tracking dependency:", error);
    }
  }
}
