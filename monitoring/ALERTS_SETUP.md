# Application Insights Alerts Configuration

## Overview

Hướng dẫn này giúp bạn thiết lập critical alerts cho 4 Golden Signals với proper thresholds và notification channels.

## Alert Strategy

### Alert Severity Levels

| Severity                  | Response Time     | Use Case                           |
| ------------------------- | ----------------- | ---------------------------------- |
| **Sev 0 - Critical**      | Immediate (5 min) | System down, data loss             |
| **Sev 1 - Error**         | 15 minutes        | High error rate, major degradation |
| **Sev 2 - Warning**       | 1 hour            | Performance issues, minor errors   |
| **Sev 3 - Informational** | Next day          | Trends, capacity planning          |

## Phần 1: Create Action Group

Action Group định nghĩa **WHO** gets notified và **HOW**.

### Bước 1: Tạo Action Group

1. Vào **Azure Portal** → **Monitor**
2. Menu bên trái → **Alerts** → **Action groups**
3. Click **"+ Create"**

### Bước 2: Cấu hình Basic Settings

```
Resource Group: mindx-week1-rg
Action group name: mindx-critical-alerts
Display name: MindX Alerts
```

### Bước 3: Add Notifications

**Email Notification:**

```
Notification type: Email/SMS message/Push/Voice
Name: Email On-Call Engineer
Email: your-email@example.com
```

**Azure Mobile App Push:**

```
Notification type: Email/SMS message/Push/Voice
Name: Push Notification
Azure app push notification: ✅ Checked
```

**SMS (Optional - costs money):**

```
SMS: +84-xxx-xxx-xxx
```

### Bước 4: Add Actions (Optional)

**Webhook to Slack/Teams:**

```
Action type: Webhook
Name: Notify Slack
URI: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Azure Function (Advanced):**

```
Action type: Azure Function
Name: Auto-Scale Function
Function: your-function-name
```

### Bước 5: Review + Create

Click **"Review + create"** → **"Create"**

---

## Phần 2: Golden Signal #1 - Latency Alerts

### Alert 1: High P95 Latency (Warning)

**Khi nào alert:** API responding too slowly

1. Vào **Application Insights** → **Alerts** → **+ Create** → **Alert rule**

2. **Scope:**

   - Resource: mindx-week1-app-insights

3. **Condition:**

   ```
   Signal name: Server response time
   Aggregation: P95
   Threshold: Static
   Operator: Greater than
   Threshold value: 5000 (5 seconds)
   Check every: 1 minute
   Lookback period: 5 minutes
   ```

4. **Actions:**
   - Action group: mindx-critical-alerts
5. **Details:**

   ```
   Severity: Sev 2 - Warning
   Alert rule name: High P95 Latency Warning
   Description: P95 response time exceeded 5 seconds
   ```

6. Click **"Create alert rule"**

### Alert 2: Critical P99 Latency (Critical)

**Khi nào alert:** Severe performance degradation

Lặp lại steps trên với:

```
Signal: Server response time
Aggregation: P99
Threshold: > 10000 (10 seconds)
Severity: Sev 0 - Critical
Name: Critical P99 Latency Alert
```

### Alert 3: Latency Spike (Dynamic)

**Khi nào alert:** Response time increased significantly from baseline

```
Signal: Server response time
Aggregation: Average
Threshold: Dynamic
Operator: Greater than
Sensitivity: Medium
Threshold value: Based on +300% from historical
Lookback period: 15 minutes
```

---

## Phần 3: Golden Signal #2 - Error Rate Alerts

### Alert 4: High Error Rate (Warning)

**Khi nào alert:** Too many failed requests

1. **Condition:**

   ```
   Signal: Failed requests
   Aggregation: Count
   Threshold: Static
   Operator: Greater than

   Calculate:
   - Failed requests count / Total requests
   - If ratio > 5%, alert
   ```

2. **KQL-based Alert (Better approach):**

   ```
   Signal: Custom log search
   Search query:

   requests
   | where timestamp > ago(5m)
   | summarize
       Total = count(),
       Failed = countif(success == false)
   | extend ErrorRate = 100.0 * Failed / Total
   | where ErrorRate > 5
   ```

3. **Alert Logic:**

   ```
   Based on: Number of results
   Operator: Greater than
   Threshold: 0
   Frequency: Every 5 minutes
   ```

4. **Details:**
   ```
   Severity: Sev 1 - Error
   Name: High Error Rate Alert
   Description: Error rate exceeded 5% threshold
   ```

### Alert 5: Server Errors (Critical)

**Khi nào alert:** 5xx errors indicating server issues

```
Search query:
requests
| where timestamp > ago(5m)
| where resultCode startswith "5"
| summarize Count = count()
| where Count > 10

Threshold: > 0 results
Frequency: Every 1 minute
Severity: Sev 0 - Critical
Name: Server Error Alert (5xx)
```

### Alert 6: Specific Endpoint Failure

**Khi nào alert:** Critical endpoint failing

```
Search query:
requests
| where timestamp > ago(5m)
| where operation_Name == "/api/protected"  // or your critical endpoint
| where success == false
| summarize FailCount = count()
| where FailCount > 5

Threshold: > 0 results
Severity: Sev 0 - Critical
Name: Critical Endpoint Failure Alert
```

---

## Phần 4: Golden Signal #3 - Traffic Alerts

### Alert 7: Traffic Drop (Anomaly Detection)

**Khi nào alert:** Sudden drop in traffic (possible system down)

```
Signal: Requests
Aggregation: Count
Threshold: Dynamic
Operator: Less than
Sensitivity: High
Lookback period: 10 minutes

Severity: Sev 0 - Critical
Name: Traffic Drop Alert
Description: Request volume dropped significantly
```

### Alert 8: Zero Traffic (System Down)

**Khi nào alert:** No requests received

```
Search query:
requests
| where timestamp > ago(5m)
| summarize RequestCount = count()
| where RequestCount == 0

Threshold: > 0 results
Frequency: Every 1 minute
Severity: Sev 0 - Critical
Name: Zero Traffic - System Down
```

### Alert 9: Traffic Spike (Informational)

**Khi nào alert:** Unusual high traffic (might need scaling)

```
Signal: Requests
Aggregation: Count
Threshold: Dynamic
Operator: Greater than
Sensitivity: Low
Lookback period: 15 minutes

Severity: Sev 3 - Informational
Name: Unusual Traffic Spike
```

---

## Phần 5: Golden Signal #4 - Capacity Alerts

### Alert 10: High CPU Usage (Warning)

**Khi nào alert:** CPU consistently high

```
Search query:
performanceCounters
| where timestamp > ago(10m)
| where name == "% Processor Time"
| summarize AvgCPU = avg(value)
| where AvgCPU > 80

Threshold: > 0 results
Frequency: Every 5 minutes
Severity: Sev 2 - Warning
Name: High CPU Usage Warning
Description: CPU usage exceeded 80% for 10 minutes
```

### Alert 11: Critical Memory Usage

**Khi nào alert:** Memory almost exhausted

```
Search query:
performanceCounters
| where timestamp > ago(10m)
| where name == "Available Bytes"
| summarize AvgMemory = avg(value) / 1024 / 1024  // Convert to MB
| where AvgMemory < 100  // Less than 100 MB available

Threshold: > 0 results
Frequency: Every 5 minutes
Severity: Sev 0 - Critical
Name: Critical Memory Usage
Description: Available memory below 100 MB
```

### Alert 12: Disk Space Low

**Khi nào alert:** Running out of disk space

```
Search query:
performanceCounters
| where timestamp > ago(15m)
| where name contains "Disk"
| where name contains "Free"
| summarize AvgFreeSpace = avg(value) / 1024 / 1024 / 1024  // Convert to GB
| where AvgFreeSpace < 5  // Less than 5 GB

Threshold: > 0 results
Severity: Sev 1 - Error
Name: Low Disk Space Alert
```

---

## Phần 6: Availability Alerts

### Alert 13: Service Availability Drop

**Khi nào alert:** Overall availability below threshold

```
Search query:
requests
| where timestamp > ago(15m)
| summarize
    Total = count(),
    Successful = countif(success == true),
    Availability = 100.0 * countif(success == true) / count()
| where Availability < 99.0

Threshold: > 0 results
Frequency: Every 5 minutes
Severity: Sev 0 - Critical
Name: Service Availability Below 99%
Description: SLA breach - availability dropped below 99%
```

### Alert 14: Health Check Failures

**Khi nào alert:** Health endpoint failing

```
Search query:
requests
| where timestamp > ago(5m)
| where operation_Name == "GET /health"
| where success == false
| summarize FailCount = count()
| where FailCount > 3

Threshold: > 0 results
Frequency: Every 1 minute
Severity: Sev 0 - Critical
Name: Health Check Failure Alert
```

---

## Phần 7: Test Alerts

### Test Alert 1: Trigger High Latency

```bash
# Simulate slow endpoint
curl -X POST https://tulm.mindx.edu.vn/api/test-slow
```

Wait 5-10 minutes, check if alert fires.

### Test Alert 2: Trigger Error Rate

```bash
# Generate errors
for i in {1..20}; do
  curl -X GET https://tulm.mindx.edu.vn/api/nonexistent
done
```

### Test Alert 3: Check Alert in Portal

1. Vào **Monitor** → **Alerts**
2. Xem **Fired alerts** list
3. Click vào alert để xem details
4. Verify email/push notification received

---

## Phần 8: Alert Management

### View Alert History

```
Azure Portal → Monitor → Alerts → Alert history
```

### Suppress Alerts (Maintenance Mode)

```
1. Go to Action Group
2. Click "Edit"
3. Disable notifications temporarily
4. Re-enable after maintenance
```

### Alert Rules Export

```powershell
# Export all alert rules
az monitor metrics alert list \
  --resource-group mindx-week1-rg \
  --output json > alert-rules.json
```

---

## Phần 9: Alert Best Practices

### ✅ DO

- **Set appropriate thresholds** - Based on your actual traffic patterns
- **Use dynamic thresholds** - For traffic and latency (learns from history)
- **Group related alerts** - Multiple conditions in one rule when possible
- **Include context** - Add descriptions explaining why alert exists
- **Test regularly** - Ensure alerts actually fire and notifications work

### ❌ DON'T

- **Over-alert** - Avoid alert fatigue
- **Under-alert** - Don't miss critical issues
- **Ignore alerts** - If alert fires often, adjust threshold or fix root cause
- **Alert on everything** - Focus on actionable alerts only
- **Forget to document** - Create runbooks for each alert type

---

## Phần 10: Alert Response Runbook Template

Tạo file `ALERT_RUNBOOK.md`:

````markdown
# Alert Response Runbook

## High P95 Latency Alert

**Severity:** Warning  
**Response Time:** 1 hour

### Initial Investigation

1. Check Live Metrics - Is latency still high?
2. Check Application Map - Any slow dependencies?
3. Query slow requests:
   ```kusto
   requests
   | where timestamp > ago(10m)
   | where duration > 5000
   | top 10 by duration desc
   ```
````

### Common Causes

- Database query slow
- External API slow
- High traffic load
- Memory leak

### Remediation

- Scale up pods: `kubectl scale deployment mindx-api --replicas=3`
- Check database: Run `EXPLAIN` on slow queries
- Clear cache if memory issue
- Contact external API provider

### Escalation

If unresolved after 1 hour:

- Escalate to: Senior Engineer
- Create incident ticket
- Notify stakeholders

````

---

## Phần 11: Create Alerts via CLI (Advanced)

### Create Alert using Azure CLI

```bash
# High CPU Alert
az monitor metrics alert create \
  --name high-cpu-alert \
  --resource-group mindx-week1-rg \
  --scopes /subscriptions/{sub-id}/resourceGroups/mindx-week1-rg/providers/Microsoft.Insights/components/mindx-week1-app-insights \
  --condition "avg performanceCounters/processorCpuPercentage > 80" \
  --window-size 10m \
  --evaluation-frequency 5m \
  --action mindx-critical-alerts \
  --severity 2 \
  --description "CPU usage exceeded 80% for 10 minutes"
````

### Create Alert using ARM Template

Tạo file `alert-template.json`:

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appInsightsName": {
      "type": "string",
      "defaultValue": "mindx-week1-app-insights"
    },
    "actionGroupId": {
      "type": "string"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Insights/metricAlerts",
      "apiVersion": "2018-03-01",
      "name": "HighErrorRateAlert",
      "location": "global",
      "properties": {
        "description": "Alert when error rate exceeds 5%",
        "severity": 1,
        "enabled": true,
        "scopes": [
          "[resourceId('Microsoft.Insights/components', parameters('appInsightsName'))]"
        ],
        "evaluationFrequency": "PT5M",
        "windowSize": "PT5M",
        "criteria": {
          "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
          "allOf": [
            {
              "name": "ErrorRate",
              "metricName": "requests/failed",
              "operator": "GreaterThan",
              "threshold": 5,
              "timeAggregation": "Average"
            }
          ]
        },
        "actions": [
          {
            "actionGroupId": "[parameters('actionGroupId')]"
          }
        ]
      }
    }
  ]
}
```

Deploy:

```bash
az deployment group create \
  --resource-group mindx-week1-rg \
  --template-file alert-template.json \
  --parameters actionGroupId="/subscriptions/{sub-id}/resourceGroups/mindx-week1-rg/providers/microsoft.insights/actionGroups/mindx-critical-alerts"
```

---

## Phần 12: Alert Notification Channels

### Email Notifications

- **Pros:** Easy to setup, free, detailed
- **Cons:** Can be missed, not real-time
- **Best for:** Non-critical alerts, daily summaries

### Azure Mobile App Push

- **Pros:** Real-time, mobile-friendly
- **Cons:** Requires app installation
- **Best for:** Critical alerts, on-call engineers

### SMS

- **Pros:** Most reliable, works offline
- **Cons:** Costs money, limited details
- **Best for:** Sev 0 critical alerts only

### Webhook (Slack/Teams)

- **Pros:** Team visibility, integration
- **Cons:** Requires setup
- **Best for:** Team alerts, incident coordination

### Azure Logic App

- **Pros:** Custom workflows, flexible
- **Cons:** Complex setup
- **Best for:** Advanced automation, ticketing systems

---

## Summary

### Alert Checklist

- [ ] Action Group created with email + push notifications
- [ ] Latency alerts configured (P95, P99)
- [ ] Error rate alerts configured (5%, 5xx)
- [ ] Traffic alerts configured (drop, zero traffic)
- [ ] Capacity alerts configured (CPU, memory, disk)
- [ ] Availability alerts configured (<99%)
- [ ] Health check alerts configured
- [ ] All alerts tested and verified
- [ ] Alert runbooks documented
- [ ] Team trained on alert response

✅ Part A.5 hoàn thành - Alerts configured and tested  
➡️ Tiếp theo: [Frontend Integration](./FRONTEND_INTEGRATION.md)
