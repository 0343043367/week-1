import { useEffect } from "react";
import { getAppInsights } from "../services/appInsights";
import type { ICustomProperties } from "@microsoft/applicationinsights-web";

/**
 * Custom hook for Application Insights tracking
 */
export function useAppInsights() {
  const appInsights = getAppInsights();

  /**
   * Track custom event
   */
  const trackEvent = (
    eventName: string,
    properties?: ICustomProperties,
    measurements?: { [key: string]: number }
  ) => {
    if (appInsights) {
      appInsights.trackEvent({ name: eventName, properties, measurements });
    }
  };

  /**
   * Track page view manually
   */
  const trackPageView = (
    name?: string,
    uri?: string,
    properties?: ICustomProperties
  ) => {
    if (appInsights) {
      appInsights.trackPageView({ name, uri, properties });
    }
  };

  /**
   * Track exception/error
   */
  const trackException = (
    error: Error,
    severityLevel?: number,
    properties?: ICustomProperties
  ) => {
    if (appInsights) {
      appInsights.trackException(
        {
          exception: error,
          severityLevel: severityLevel || 3, // Error level
        },
        properties
      );
    }
    console.error("Error tracked:", error, properties);
  };

  /**
   * Track metric
   */
  const trackMetric = (
    name: string,
    average: number,
    properties?: ICustomProperties
  ) => {
    if (appInsights) {
      appInsights.trackMetric({ name, average }, properties);
    }
  };

  /**
   * Track trace/log message
   */
  const trackTrace = (
    message: string,
    severityLevel?: number,
    properties?: ICustomProperties
  ) => {
    if (appInsights) {
      appInsights.trackTrace(
        {
          message,
          severityLevel: severityLevel || 1, // Info level
        },
        properties
      );
    }
  };

  /**
   * Set authenticated user context
   */
  const setAuthenticatedUser = (userId: string, accountId?: string) => {
    if (appInsights) {
      appInsights.setAuthenticatedUserContext(userId, accountId);
    }
  };

  /**
   * Clear authenticated user context
   */
  const clearAuthenticatedUser = () => {
    if (appInsights) {
      appInsights.clearAuthenticatedUserContext();
    }
  };

  return {
    trackEvent,
    trackPageView,
    trackException,
    trackMetric,
    trackTrace,
    setAuthenticatedUser,
    clearAuthenticatedUser,
    isEnabled: !!appInsights,
  };
}

/**
 * Hook to track component mount/unmount
 */
export function useComponentTracking(componentName: string) {
  const { trackEvent } = useAppInsights();

  useEffect(() => {
    trackEvent("ComponentMounted", { componentName });

    return () => {
      trackEvent("ComponentUnmounted", { componentName });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount
}
