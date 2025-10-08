# Application Insights Dashboards Guide

## Overview

Hướng dẫn này giúp bạn tạo comprehensive monitoring dashboards trong Azure Application Insights để track 4 Golden Signals.

## Phần 1: Truy cập Application Insights

1. Đăng nhập vào [Azure Portal](https://portal.azure.com)
2. Tìm resource `mindx-week1-app-insights`
3. Trong menu bên trái, khám phá các sections:
   - **Overview** - Tổng quan metrics
   - **Live Metrics** - Real-time monitoring
   - **Application Map** - Dependencies visualization
   - **Performance** - Latency analysis
   - **Failures** - Error tracking
   - **Logs** - KQL queries

## Phần 2: Live Metrics Stream

### Xem Real-time Metrics

1. Vào **Application Insights** → **Live Metrics**
2. Bạn sẽ thấy real-time:

   - **Incoming Requests** (Traffic)
   - **Request Duration** (Latency)
   - **Failed Requests** (Error Rate)
   - **Server Resources** (Capacity: CPU, Memory)

3. **Test ngay:**

   ```bash
   # Generate traffic
   for i in {1..50}; do
     curl https://tulm.mindx.edu.vn/health
     sleep 0.1
   done
   ```

4. Quan sát Live Metrics stream cập nhật real-time

## Phần 3: Application Map

### Visualize Dependencies

1. Vào **Application Insights** → **Application Map**
2. Bạn sẽ thấy:

   - API service node
   - External dependencies (nếu có)
   - Traffic volume giữa services
   - Error rates trên từng connection

3. Click vào node để xem chi tiết:
   - Average response time
   - Failed requests
   - Top operations

## Phần 4: Performance Dashboard (Latency Analysis)

### View Latency Metrics

1. Vào **Application Insights** → **Performance**
2. Bạn sẽ thấy:
   - **Operations list** - Tất cả endpoints
   - **Response time distribution** - P50, P95, P99
   - **Dependency calls** - External API latency
   - **Timeline view** - Latency trends over time

### Key Metrics để Monitor:

| Metric  | Good    | Warning | Critical |
| ------- | ------- | ------- | -------- |
| **P50** | < 100ms | < 500ms | > 500ms  |
| **P95** | < 500ms | < 2s    | > 5s     |
| **P99** | < 1s    | < 5s    | > 10s    |

### Tạo Custom Query cho Latency:

1. Click **"See all"** → **"Logs"**
2. Paste KQL query:

```kusto
// P50, P95, P99 Response Times
requests
| where timestamp > ago(1h)
| summarize
    P50 = percentile(duration, 50),
    P95 = percentile(duration, 95),
    P99 = percentile(duration, 99),
    Count = count()
    by operation_Name
| order by P99 desc
| project operation_Name, P50, P95, P99, Count
```

3. Click **"Run"**
4. Click **"Pin to dashboard"** để save

## Phần 5: Failures Dashboard (Error Rate)

### Track Errors

1. Vào **Application Insights** → **Failures**
2. Bạn sẽ thấy:
   - **Failed requests count**
   - **Dependency failures**
   - **Exception types**
   - **Top 3 response codes**

### Custom Query cho Error Rate:

```kusto
// Error Rate by Endpoint (last 24 hours)
requests
| where timestamp > ago(24h)
| summarize
    Total = count(),
    Failed = countif(success == false),
    ErrorRate = round(100.0 * countif(success == false) / count(), 2)
    by operation_Name
| where Total > 10  // Filter out low-traffic endpoints
| order by ErrorRate desc
| project operation_Name, Total, Failed, ErrorRate
```

### Error Rate Thresholds:

| Threshold | Status      | Action      |
| --------- | ----------- | ----------- |
| < 1%      | ✅ Healthy  | Monitor     |
| 1-5%      | ⚠️ Warning  | Investigate |
| > 5%      | 🚨 Critical | Alert & Fix |

## Phần 6: Traffic Dashboard

### Track Request Volume

```kusto
// Requests Per Minute (last 1 hour)
requests
| where timestamp > ago(1h)
| summarize RequestsPerMinute = count() by bin(timestamp, 1m)
| render timechart
```

```kusto
// Top Endpoints by Traffic
requests
| where timestamp > ago(24h)
| summarize RequestCount = count() by operation_Name
| order by RequestCount desc
| take 10
| render barchart
```

### Traffic Patterns:

```kusto
// Traffic by Hour of Day
requests
| where timestamp > ago(7d)
| extend hour = hourofday(timestamp)
| summarize AvgRequestsPerHour = count() / 7 by hour
| order by hour asc
| render columnchart
```

## Phần 7: Capacity Dashboard

### System Resource Monitoring

```kusto
// CPU Usage Over Time
performanceCounters
| where timestamp > ago(1h)
| where name == "% Processor Time"
| summarize AvgCPU = avg(value) by bin(timestamp, 5m)
| render timechart
```

```kusto
// Memory Usage Over Time
performanceCounters
| where timestamp > ago(1h)
| where name == "Available Bytes"
| summarize AvgMemoryMB = avg(value) / 1024 / 1024 by bin(timestamp, 5m)
| render timechart
```

```kusto
// System Resources Summary
performanceCounters
| where timestamp > ago(1h)
| summarize
    AvgCPU = round(avg(iff(name == "% Processor Time", value, real(null))), 2),
    AvgMemoryMB = round(avg(iff(name == "Available Bytes", value / 1024 / 1024, real(null))), 2)
    by bin(timestamp, 5m)
| project timestamp, AvgCPU, AvgMemoryMB
```

### Capacity Thresholds:

| Resource   | Good  | Warning | Critical |
| ---------- | ----- | ------- | -------- |
| **CPU**    | < 60% | 60-80%  | > 80%    |
| **Memory** | < 70% | 70-85%  | > 85%    |
| **Disk**   | < 80% | 80-90%  | > 90%    |

## Phần 8: Tạo Custom Dashboard

### Bước 1: Tạo Dashboard mới

1. Trong Azure Portal, click **"Dashboard"** ở top menu
2. Click **"+ New dashboard"**
3. Đặt tên: **"MindX Week1 - 4 Golden Signals"**

### Bước 2: Add Tiles từ App Insights

1. Click **"+ Add"** → **"Tile Gallery"**
2. Tìm **"Application Insights"**
3. Thêm các tiles:
   - **Requests** (Traffic)
   - **Response Time** (Latency)
   - **Failed Requests** (Error Rate)
   - **Server Exceptions**
   - **Performance Counters** (Capacity)

### Bước 3: Add Custom Query Tiles

1. Click **"+ Add"** → **"Metrics chart"**
2. Select resource: `mindx-week1-app-insights`
3. Configure metric:

   - **Metric**: Server response time
   - **Aggregation**: P95
   - Click **"Pin to dashboard"**

4. Lặp lại cho các metrics khác

### Bước 4: Organize Layout

1. Drag & drop tiles để sắp xếp:

```
┌─────────────────────────────────────────────┐
│         4 GOLDEN SIGNALS DASHBOARD          │
├──────────────────┬──────────────────────────┤
│  1. LATENCY      │  2. ERROR RATE          │
│  - P50, P95, P99 │  - Failed %             │
│  - Timeline      │  - By endpoint          │
├──────────────────┼──────────────────────────┤
│  3. TRAFFIC      │  4. CAPACITY            │
│  - Req/min       │  - CPU %                │
│  - Top endpoints │  - Memory %             │
└──────────────────┴──────────────────────────┘
```

2. Click **"Done customizing"**
3. Click **"Save"**

## Phần 9: Useful KQL Queries Collection

### Query 1: Complete Health Overview

```kusto
// System Health Overview (last 1 hour)
let timeRange = ago(1h);
let requests_data = requests
    | where timestamp > timeRange
    | summarize
        TotalRequests = count(),
        FailedRequests = countif(success == false),
        AvgDuration = round(avg(duration), 2),
        P95Duration = round(percentile(duration, 95), 2)
    | extend ErrorRate = round(100.0 * FailedRequests / TotalRequests, 2);
let exceptions_data = exceptions
    | where timestamp > timeRange
    | summarize ExceptionCount = count();
let cpu_data = performanceCounters
    | where timestamp > timeRange and name == "% Processor Time"
    | summarize AvgCPU = round(avg(value), 2);
requests_data
| extend ExceptionCount = toscalar(exceptions_data)
| extend AvgCPU = toscalar(cpu_data)
| project TotalRequests, FailedRequests, ErrorRate, AvgDuration, P95Duration, ExceptionCount, AvgCPU
```

### Query 2: Slowest Endpoints

```kusto
// Top 10 Slowest Endpoints (P95)
requests
| where timestamp > ago(24h)
| summarize
    Count = count(),
    AvgDuration = round(avg(duration), 2),
    P95Duration = round(percentile(duration, 95), 2),
    P99Duration = round(percentile(duration, 99), 2)
    by operation_Name
| where Count > 10
| order by P95Duration desc
| take 10
```

### Query 3: Error Details

```kusto
// Recent Errors with Details
requests
| where timestamp > ago(1h) and success == false
| project
    timestamp,
    operation_Name,
    resultCode,
    duration,
    url,
    client_Browser = client_Browser
| order by timestamp desc
| take 50
```

### Query 4: Custom Events Tracking

```kusto
// User Actions Tracking
customEvents
| where timestamp > ago(24h)
| where name in ("UserLogin", "UserRegistration")
| summarize Count = count() by name, tostring(customDimensions.status)
| order by Count desc
```

### Query 5: Availability Check

```kusto
// Service Availability (last 24 hours)
requests
| where timestamp > ago(24h)
| summarize
    TotalRequests = count(),
    SuccessfulRequests = countif(success == true),
    Availability = round(100.0 * countif(success == true) / count(), 2)
| project Availability, TotalRequests, SuccessfulRequests
```

## Phần 10: Export & Share Dashboards

### Export Dashboard

1. Mở dashboard
2. Click **"Download"** ở top menu
3. Chọn format: **JSON** hoặc **PNG**

### Share Dashboard

1. Click **"Share"** ở top menu
2. Options:
   - **Share within organization** - Bất kỳ ai có Azure access
   - **Generate public link** - Readonly link (cẩn thận với security)

### Set as Home Dashboard

1. Click **"⭐ Set as home"**
2. Dashboard sẽ hiện khi bạn mở Azure Portal

## Phần 11: Mobile Monitoring

### Azure Mobile App

1. Install **Azure Mobile App** (iOS/Android)
2. Login với Azure credentials
3. Thêm dashboard vào favorites
4. Enable push notifications cho alerts

## Troubleshooting

### Vấn đề: Không thấy data trong queries

**Giải pháp:**

```kusto
// Check if data is being received
requests
| where timestamp > ago(10m)
| take 10
```

Nếu empty:

- Kiểm tra API có chạy không
- Verify connection string trong Kubernetes secret
- Check pod logs: `kubectl logs <pod-name>`

### Vấn đề: Query timeout

**Giải pháp:**

- Giảm time range: `ago(1h)` thay vì `ago(30d)`
- Thêm `| take 100` để limit results
- Sử dụng `summarize` thay vì select all rows

### Vấn đề: Performance counters không hiện

**Giải pháp:**

- Performance counters cần ~5-10 minutes để bắt đầu collect
- Một số counters không available trên Linux containers
- Check: `performanceCounters | distinct name`

## Next Steps

✅ Part A.4 hoàn thành - Dashboards configured  
➡️ Tiếp theo: [Configure Alerts](./ALERTS_SETUP.md)
