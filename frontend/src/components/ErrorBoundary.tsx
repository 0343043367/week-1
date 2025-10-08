import { Component, type ErrorInfo, type ReactNode } from "react";
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
                  fontSize: "12px",
                }}
              >
                {this.state.error?.toString()}
                {"\n\n"}
                {this.state.error?.stack}
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
                fontSize: "14px",
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
