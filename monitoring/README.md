# Week 2 - Monitoring & Analytics

Complete monitoring setup for production application using Azure Application Insights and Google Analytics 4.

---

## Quick Start

### 1. Setup Application Insights Connection

```powershell
# Run the secret creation script
cd monitoring
.\create-secret-simple.ps1
```

Paste your Application Insights Connection String when prompted.

### 2. Restart API Deployment

```bash
kubectl rollout restart deployment mindx-api
kubectl rollout status deployment mindx-api
```

### 3. Verify Setup

```powershell
# Generate test traffic
.\simple-test.ps1

# Check if monitoring is working
.\test-monitoring.ps1
```

Wait 2-3 minutes, then check:

- **Google Analytics**: https://analytics.google.com (Realtime reports)
- **Azure Portal**: https://portal.azure.com (Application Insights)

---

## Files Overview

### 📜 Setup Scripts

- `create-secret-simple.ps1` - Create Kubernetes secret for App Insights
- `create-k8s-secret.sh` - Linux/Mac version

### 🧪 Testing Scripts

- `simple-test.ps1` - Generate basic traffic (30 requests)
- `test-with-errors.ps1` - Test error tracking (50 requests, 20% errors)
- `test-monitoring.ps1` - Quick verification test

### 📚 Documentation

- `APP_INSIGHTS_SETUP.md` - Azure Application Insights setup guide
- `BACKEND_INTEGRATION.md` - Backend integration details
- `FRONTEND_INTEGRATION.md` - Frontend integration details
- `GOOGLE_ANALYTICS_GUIDE.md` - Google Analytics 4 complete guide
- `QUICK_START.md` - Fast-track testing guide

### 📦 Advanced

- `load-test.js` - k6 load testing script (requires k6 installation)
- `test-alerts.sh` - Alert testing for Linux/Mac

---

## What's Monitored

### Production Metrics (Azure Application Insights)

- ✅ **Latency**: Response times (P50, P95, P99)
- ✅ **Error Rate**: Failed requests, exceptions
- ✅ **Traffic**: Request volume, throughput
- ✅ **Capacity**: CPU, memory usage

### Product Metrics (Google Analytics 4)

- ✅ **User Behavior**: Page views, sessions
- ✅ **Custom Events**: Login, registration, navigation
- ✅ **Real-time**: Active users, live traffic
- ✅ **Conversions**: User journey tracking

---

## Troubleshooting

### No data in Application Insights?

1. **Check secret exists:**

   ```bash
   kubectl get secret app-insights-secret
   ```

2. **Check API logs:**

   ```bash
   kubectl logs -l app=mindx-api --tail=50
   ```

   Look for: `✅ Application Insights initialized successfully`

3. **Verify environment variable:**
   ```bash
   kubectl exec -it deployment/mindx-api -- env | grep APPINSIGHTS
   ```

### No data in Google Analytics?

1. Open browser console (F12) on https://tulm.mindx.edu.vn
2. Look for GA4 initialization logs
3. Check Network tab for requests to `google-analytics.com`

---

## Next Steps

After verification:

1. ✅ Check dashboards daily for insights
2. ✅ Set up alerts for critical metrics
3. ✅ Review user behavior in GA4
4. ✅ Monitor performance trends

---

## Support Resources

- **Azure Application Insights Docs**: https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview
- **Google Analytics 4 Docs**: https://support.google.com/analytics/answer/10089681
- **k6 Load Testing**: https://k6.io/docs/

---

**Week 2 Objectives: ✅ COMPLETE**

- Production monitoring with Azure
- Product analytics with GA4
- Testing & validation tools
