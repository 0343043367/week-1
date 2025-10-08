# Frontend React App - Application Insights Integration

## Overview

Tài liệu này hướng dẫn tích hợp Azure Application Insights JavaScript SDK vào React frontend để monitor client-side performance và errors.

## Why Monitor Frontend?

✅ **Client-side errors** - JavaScript errors users experience  
✅ **Browser performance** - Page load times, render times  
✅ **AJAX tracking** - API calls from browser perspective  
✅ **User sessions** - Active users, session duration  
✅ **Page views** - Navigation patterns in SPA

## Bước 1: Cài đặt Dependencies

```bash
cd week1-fullstack-app/frontend

# Install Application Insights React plugin
npm install @microsoft/applicationinsights-react-js @microsoft/applicationinsights-web
```

## Bước 2: Tạo App Insights Service

Tạo file `src/services/appInsights.ts`:

```typescript
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { createBrowserHistory } from "history";

// Create browser history for React Router tracking
const browserHistory = createBrowserHistory();

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
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory },
        },
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

export { reactPlugin, browserHistory };
```

## Bước 3: Update Main Entry Point

Update file `src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";

// Initialize Application Insights BEFORE rendering app
import { initializeAppInsights } from "./services/appInsights";
const appInsights = initializeAppInsights();

// Log initialization status
if (appInsights) {
  console.log("📊 Frontend monitoring: Enabled");
} else {
  console.log("📊 Frontend monitoring: Disabled");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

## Bước 4: Wrap App with App Insights HOC

Update file `src/App.tsx`:

```typescript
import { withAITracking } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./services/appInsights";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import OpenIDCallback from "./components/OpenIDCallback";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth/callback" element={<OpenIDCallback />} />
      </Routes>
    </>
  );
}

// Wrap App component with AI tracking
export default withAITracking(reactPlugin, App);
```

## Bước 5: Tạo Custom Tracking Hooks

Tạo file `src/hooks/useAppInsights.ts`:

```typescript
import { useEffect } from "react";
import { getAppInsights } from "../services/appInsights";
import { ICustomProperties } from "@microsoft/applicationinsights-web";

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
      appInsights.trackEvent({ name: eventName }, properties, measurements);
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
      appInsights.trackPageView({ name, uri }, properties);
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

  return {
    trackEvent,
    trackPageView,
    trackException,
    trackMetric,
    trackTrace,
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
  }, [componentName, trackEvent]);
}
```

## Bước 6: Add Error Boundary

Tạo file `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from "react";
import { getAppInsights } from "../services/appInsights";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);

    // Track error in Application Insights
    const appInsights = getAppInsights();
    if (appInsights) {
      appInsights.trackException({
        exception: error,
        severityLevel: 3, // Error
        properties: {
          componentStack: errorInfo.componentStack || "",
          errorBoundary: "true",
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "20px",
              margin: "20px",
              border: "1px solid #ff0000",
              borderRadius: "8px",
              backgroundColor: "#ffeeee",
            }}
          >
            <h2>⚠️ Something went wrong</h2>
            <p>We've been notified and are working on a fix.</p>
            <details style={{ marginTop: "10px", cursor: "pointer" }}>
              <summary>Error details</summary>
              <pre
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Update `src/main.tsx` để wrap App với ErrorBoundary:

```typescript
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
```

## Bước 7: Track User Actions

Update file `src/components/Login.tsx` để add tracking:

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useAppInsights } from "../hooks/useAppInsights";
import "./Auth.css";

function Login() {
  // ... existing code ...
  const { trackEvent, trackException } = useAppInsights();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const startTime = Date.now();

    try {
      await login(email, password);

      // Track successful login
      const duration = Date.now() - startTime;
      trackEvent(
        "UserLogin",
        {
          method: "password",
          status: "success",
        },
        {
          duration: duration,
        }
      );

      navigate("/profile");
    } catch (err) {
      setError("Login failed. Please check your credentials.");

      // Track login failure
      trackException(err as Error, 2, {
        operation: "login",
        method: "password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component ...
}
```

Tương tự cho `Register.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing validation ...

  const startTime = Date.now();

  try {
    await register(email, password, name);

    // Track successful registration
    const duration = Date.now() - startTime;
    trackEvent(
      "UserRegistration",
      {
        method: "password",
        status: "success",
      },
      {
        duration: duration,
      }
    );

    navigate("/profile");
  } catch (err) {
    // Track registration failure
    trackException(err as Error, 2, {
      operation: "registration",
      method: "password",
    });
  }
};
```

## Bước 8: Track API Calls

Tạo file `src/services/apiClient.ts`:

```typescript
import { getAppInsights } from "./appInsights";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://tulm.mindx.edu.vn";

/**
 * Enhanced fetch with Application Insights tracking
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const appInsights = getAppInsights();
  const startTime = Date.now();
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const duration = Date.now() - startTime;

    // Track successful API call
    if (appInsights) {
      appInsights.trackDependencyData({
        id: `${Date.now()}`,
        name: endpoint,
        duration: duration,
        success: response.ok,
        responseCode: response.status,
        type: "Ajax",
        data: url,
        target: API_BASE_URL,
      });
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Track failed API call
    if (appInsights) {
      appInsights.trackDependencyData({
        id: `${Date.now()}`,
        name: endpoint,
        duration: duration,
        success: false,
        responseCode: 0,
        type: "Ajax",
        data: url,
        target: API_BASE_URL,
      });

      appInsights.trackException({
        exception: error as Error,
        properties: {
          endpoint,
          url,
          method: options?.method || "GET",
        },
      });
    }

    throw error;
  }
}
```

## Bước 9: Environment Variables

Tạo file `.env.local` (KHÔNG commit):

```env
# Application Insights
VITE_APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=...;LiveEndpoint=..."

# API Base URL
VITE_API_URL="https://tulm.mindx.edu.vn"
```

Tạo file `.env.example` (commit được):

```env
# Application Insights (Frontend)
VITE_APPINSIGHTS_CONNECTION_STRING="your-connection-string-here"

# API Base URL
VITE_API_URL="https://your-domain.com"
```

## Bước 10: Update Package.json

```json
{
  "dependencies": {
    "@microsoft/applicationinsights-react-js": "^17.3.1",
    "@microsoft/applicationinsights-web": "^3.3.1",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    ...existing dependencies...
  }
}
```

## Bước 11: Build và Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build will include App Insights SDK
# Environment variables will be injected at build time
```

## Bước 12: Update Kubernetes ConfigMap

Tạo file `k8s-manifests/frontend-config.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: default
data:
  VITE_APPINSIGHTS_CONNECTION_STRING: "InstrumentationKey=xxx;IngestionEndpoint=xxx;LiveEndpoint=xxx"
  VITE_API_URL: "https://tulm.mindx.edu.vn"
```

Update `k8s-manifests/frontend-deployment.yaml`:

```yaml
# Add env section
env:
  - name: VITE_APPINSIGHTS_CONNECTION_STRING
    valueFrom:
      configMapKeyRef:
        name: frontend-config
        key: VITE_APPINSIGHTS_CONNECTION_STRING
  - name: VITE_API_URL
    valueFrom:
      configMapKeyRef:
        name: frontend-config
        key: VITE_API_URL
```

**Note:** Vite injects env vars at BUILD time, không phải runtime. Cần rebuild image khi thay đổi env vars.

## What Gets Tracked Automatically

✅ **Page Views** - React Router navigation  
✅ **AJAX Calls** - All fetch/axios requests  
✅ **JavaScript Errors** - Unhandled exceptions  
✅ **Performance** - Page load times  
✅ **User Sessions** - Anonymous session tracking

## What Requires Manual Tracking

📝 **Custom Events** - Button clicks, form submissions  
📝 **User Properties** - User IDs, roles (after login)  
📝 **Custom Metrics** - Business-specific measurements  
📝 **Trace Logs** - Debug information

## Verify Frontend Monitoring

### 1. Check Browser Console

```
✅ Application Insights (Frontend) initialized successfully
📊 Frontend monitoring: Enabled
```

### 2. Check Network Tab

Look for requests to:

- `dc.services.visualstudio.com` - Telemetry endpoint
- Status 200 OK

### 3. Check Application Insights

1. Vào **Application Insights** → **Browser**
2. Xem:
   - Page views
   - Browser exceptions
   - AJAX requests from frontend
   - User sessions

## Troubleshooting

### Issue: No data in Application Insights

**Check:**

```javascript
// In browser console
console.log(import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING);
```

If undefined:

- Check `.env.local` file exists
- Restart dev server
- For production, rebuild image with correct env vars

### Issue: CORS errors

**Solution:**
Enable CORS correlation:

```typescript
enableCorsCorrelation: true,
```

And ensure backend API has proper CORS headers.

### Issue: Too much data / high costs

**Solution:**
Enable sampling:

```typescript
samplingPercentage: 50,  // Sample 50% of telemetry
```

## Next Steps

✅ Part A.3 hoàn thành - Frontend monitoring configured  
➡️ Tiếp theo: [Part B - Google Analytics](./GOOGLE_ANALYTICS_GUIDE.md)
