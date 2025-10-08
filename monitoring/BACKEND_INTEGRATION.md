# Backend API - Application Insights Integration

## Overview

Tài liệu này hướng dẫn tích hợp Azure Application Insights vào Node.js Express API với monitoring đầy đủ cho 4 Golden Signals.

## 4 Golden Signals

1. **Latency** - Response time (P50, P95, P99)
2. **Error Rate** - Failed requests percentage
3. **Traffic** - Requests per second
4. **Capacity** - CPU, Memory, Disk usage

## Bước 1: Cài đặt Dependencies

```bash
cd week1-fullstack-app/api

# Install Application Insights SDK
npm install applicationinsights

# Install additional performance monitoring
npm install @opentelemetry/api @opentelemetry/sdk-node
```

## Bước 2: Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Azure Application Insights
APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=...;LiveEndpoint=..."

# Monitoring Configuration
APPINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL="info"
APPINSIGHTS_ENABLE_AUTO_COLLECTION="true"
APPINSIGHTS_ENABLE_LIVE_METRICS="true"
```

## Bước 3: Tạo App Insights Configuration Module

Tạo file `src/middleware/appInsights.ts`:

```typescript
import * as appInsights from "applicationinsights";

export function setupApplicationInsights() {
  const connectionString = process.env.APPINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.warn(
      "⚠️  Application Insights connection string not found. Monitoring disabled."
    );
    return null;
  }

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

  return client;
}

export function getAppInsightsClient() {
  return appInsights.defaultClient;
}
```

## Bước 4: Implement Custom Metrics Middleware

Tạo file `src/middleware/metricsMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { getAppInsightsClient } from "./appInsights";

// Track Golden Signals
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const client = getAppInsightsClient();

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to capture metrics
  res.end = function (this: Response, ...args: any[]): Response {
    // Calculate latency (Golden Signal #1: LATENCY)
    const duration = Date.now() - startTime;

    if (client) {
      // Track custom metric for latency
      client.trackMetric({
        name: "API Response Time",
        value: duration,
        properties: {
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode.toString(),
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
            errorType: res.statusCode >= 500 ? "server_error" : "client_error",
          },
        });
      }

      // Traffic is automatically tracked by auto-collection (Golden Signal #3: TRAFFIC)
      // Capacity metrics are tracked by performance counters (Golden Signal #4: CAPACITY)
    }

    // Call original end function
    return originalEnd.apply(this, args);
  };

  next();
}

// Track custom events
export function trackCustomEvent(
  eventName: string,
  properties?: { [key: string]: string },
  measurements?: { [key: string]: number }
) {
  const client = getAppInsightsClient();
  if (client) {
    client.trackEvent({
      name: eventName,
      properties,
      measurements,
    });
  }
}

// Track custom errors with context
export function trackCustomError(
  error: Error,
  properties?: { [key: string]: string }
) {
  const client = getAppInsightsClient();
  if (client) {
    client.trackException({
      exception: error,
      properties,
    });
  }
}
```

## Bước 5: Update Main Application File

Cập nhật file `src/index.ts`:

```typescript
// ===== AT THE VERY TOP OF THE FILE (BEFORE ANY OTHER IMPORTS) =====
import dotenv from "dotenv";
dotenv.config();

// Initialize Application Insights FIRST (must be before other imports)
import {
  setupApplicationInsights,
  getAppInsightsClient,
} from "./middleware/appInsights";
const appInsightsClient = setupApplicationInsights();

// ===== THEN OTHER IMPORTS =====
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  metricsMiddleware,
  trackCustomEvent,
  trackCustomError,
} from "./middleware/metricsMiddleware";

// ... rest of your imports ...

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE SETUP =====
app.use(cors());
app.use(express.json());

// Add metrics middleware AFTER body parsers but BEFORE routes
app.use(metricsMiddleware);

// ===== YOUR EXISTING ROUTES =====

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    monitoring: appInsightsClient ? "enabled" : "disabled",
  });
});

// Example: Track custom events in your routes
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    // ... your login logic ...

    // Track successful login
    trackCustomEvent("UserLogin", {
      method: "password",
      userId: "user-id-here", // Don't log sensitive data
    });

    res.json({ success: true });
  } catch (error) {
    // Track login failure
    trackCustomError(error as Error, {
      operation: "login",
      endpoint: "/api/auth/login",
    });

    res.status(500).json({ error: "Login failed" });
  }
});

// ===== ERROR HANDLING =====

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err);

  // Track error in App Insights
  trackCustomError(err, {
    endpoint: req.path,
    method: req.method,
    stack: err.stack || "",
  });

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📊 Monitoring: ${
      appInsightsClient ? "Enabled with App Insights" : "Disabled"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  if (appInsightsClient) {
    appInsightsClient.flush();
  }
  process.exit(0);
});
```

## Bước 6: Update Kubernetes Deployment

Cập nhật file `k8s-manifests/api-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: your-acr.azurecr.io/mindx-api:latest
          ports:
            - containerPort: 3000
          env:
            # === Application Insights Configuration ===
            - name: APPINSIGHTS_CONNECTION_STRING
              valueFrom:
                secretKeyRef:
                  name: app-insights-secret
                  key: connection-string
            - name: APPINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL
              value: "info"
            - name: APPINSIGHTS_ENABLE_AUTO_COLLECTION
              value: "true"
            - name: APPINSIGHTS_ENABLE_LIVE_METRICS
              value: "true"
            # === Your existing env vars ===
            - name: PORT
              value: "3000"
            - name: NODE_ENV
              value: "production"
          # Resource limits for accurate capacity monitoring
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          # Health probes
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Bước 7: Build và Deploy

```bash
# 1. Rebuild API với monitoring
cd api
npm install
npm run build

# 2. Build Docker image
docker build -t your-acr.azurecr.io/mindx-api:v2-monitoring .

# 3. Push to ACR
docker push your-acr.azurecr.io/mindx-api:v2-monitoring

# 4. Update deployment
kubectl set image deployment/api-deployment \
  api=your-acr.azurecr.io/mindx-api:v2-monitoring

# 5. Verify pods are running
kubectl get pods
kubectl logs <pod-name> | grep "Application Insights"
```

## Bước 8: Verify Monitoring

### Kiểm tra trong Azure Portal:

1. Vào Application Insights resource
2. Mở **Live Metrics** → Bạn sẽ thấy:

   - Incoming requests (Traffic)
   - Request duration (Latency)
   - Failed requests (Error Rate)
   - Process CPU/Memory (Capacity)

3. Mở **Application Map** → Thấy API dependencies

4. Mở **Performance** → Xem P50, P95, P99 response times

### Test bằng cURL:

```bash
# Generate some traffic
for i in {1..100}; do
  curl https://your-domain.com/api/health
  sleep 0.1
done

# Test error tracking
curl -X POST https://your-domain.com/api/test-error
```

## 4 Golden Signals - Mapping

| Signal         | App Insights Feature | Automatic | Custom                  |
| -------------- | -------------------- | --------- | ----------------------- |
| **Latency**    | Request Duration     | ✅ Yes    | + Custom metrics        |
| **Error Rate** | Failed Requests      | ✅ Yes    | + Custom error tracking |
| **Traffic**    | Request Count        | ✅ Yes    | N/A                     |
| **Capacity**   | Performance Counters | ✅ Yes    | N/A                     |

## What Gets Tracked Automatically

✅ **HTTP Requests** - URL, method, status code, duration  
✅ **Dependencies** - External API calls, database queries  
✅ **Exceptions** - Unhandled errors with stack traces  
✅ **Performance Counters** - CPU, Memory, Disk I/O  
✅ **Custom Events** - Via trackCustomEvent()  
✅ **Custom Metrics** - Via trackMetric()

## Troubleshooting

### Vấn đề: Không thấy data trong App Insights

**Giải pháp:**

```bash
# Check connection string
kubectl get secret app-insights-secret -o jsonpath='{.data.connection-string}' | base64 -d

# Check pod logs
kubectl logs <pod-name> | grep -i "insights"

# Enable debug mode
export APPINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL="verbose"
```

### Vấn đề: Metrics bị delayed

**Giải pháp:**

- Telemetry có thể mất 2-5 phút để xuất hiện
- Sử dụng Live Metrics Stream để xem real-time data

## Next Steps

✅ Part A.2 hoàn thành - Backend API đã được instrument  
➡️ Tiếp theo: [Frontend Integration](./FRONTEND_INTEGRATION.md)  
➡️ Sau đó: [Configure Alerts](./ALERTS_SETUP.md)
