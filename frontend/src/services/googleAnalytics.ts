import ReactGA from "react-ga4";

let isInitialized = false;

/**
 * Initialize Google Analytics 4
 */
export function initializeGA4(): boolean {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn("⚠️  GA4 Measurement ID not found. Analytics disabled.");
    return false;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        // Cookie settings
        cookieFlags: "SameSite=None;Secure",
        // Send page view on initialization
        send_page_view: false, // We'll track manually
      },
      gtagOptions: {
        // Debug mode in development
        debug_mode: import.meta.env.MODE === "development",
        // User consent (GDPR)
        anonymize_ip: true,
      },
    });

    isInitialized = true;
    console.log("✅ Google Analytics 4 initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize GA4:", error);
    return false;
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!isInitialized) return;

  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: title || document.title,
  });
}

/**
 * Track custom event (legacy format)
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  if (!isInitialized) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

/**
 * GA4 recommended events
 */
export const GA4Events = {
  // User authentication
  login: (method: string) => {
    if (!isInitialized) return;
    ReactGA.event("login", { method });
  },

  signup: (method: string) => {
    if (!isInitialized) return;
    ReactGA.event("sign_up", { method });
  },

  logout: () => {
    if (!isInitialized) return;
    ReactGA.event("logout", {});
  },

  // Page engagement
  selectContent: (contentType: string, itemId: string) => {
    if (!isInitialized) return;
    ReactGA.event("select_content", {
      content_type: contentType,
      item_id: itemId,
    });
  },

  // User interactions
  buttonClick: (buttonName: string, location: string) => {
    if (!isInitialized) return;
    ReactGA.event("button_click", {
      button_name: buttonName,
      location: location,
    });
  },

  formSubmit: (formName: string, success: boolean) => {
    if (!isInitialized) return;
    ReactGA.event("form_submit", {
      form_name: formName,
      success: success.toString(),
    });
  },

  // Feature usage
  featureUsed: (featureName: string) => {
    if (!isInitialized) return;
    ReactGA.event("feature_used", {
      feature_name: featureName,
    });
  },

  // Errors
  error: (errorType: string, errorMessage: string) => {
    if (!isInitialized) return;
    ReactGA.event("error", {
      error_type: errorType,
      error_message: errorMessage,
    });
  },

  // Search
  search: (searchTerm: string, resultsCount: number) => {
    if (!isInitialized) return;
    ReactGA.event("search", {
      search_term: searchTerm,
      results_count: resultsCount.toString(),
    });
  },

  // Navigation
  pageView: (path: string, title?: string) => {
    if (!isInitialized) return;
    ReactGA.send({
      hitType: "pageview",
      page: path,
      title: title || document.title,
    });
  },
};

export function isGA4Enabled(): boolean {
  return isInitialized;
}
