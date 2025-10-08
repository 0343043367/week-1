# GitHub Secrets Setup for Monitoring

## Overview

This guide explains how to add monitoring credentials to GitHub Secrets for the CI/CD pipeline.

## Required Secrets

### 1. Google Analytics 4 Measurement ID

- **Secret Name**: `VITE_GA4_MEASUREMENT_ID`
- **Value**: `G-4JM2MY93GL`

### 2. Azure Application Insights Connection String

- **Secret Name**: `VITE_APPINSIGHTS_CONNECTION_STRING`
- **Value**: `InstrumentationKey=92f4edad-cf35-4b1d-8f27-7964ca682a3d;IngestionEndpoint=https://southeastasia-1.in.applicationinsights.azure.com/;LiveEndpoint=https://southeastasia.livediagnostics.monitor.azure.com/;ApplicationId=87895a95-ebe2-4062-9fe1-142bdd25bd96`

## How to Add GitHub Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository: https://github.com/0343043367/week-1
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret

1. Click **New repository secret** button
2. For **GA4 Measurement ID**:

   - Name: `VITE_GA4_MEASUREMENT_ID`
   - Secret: `G-4JM2MY93GL`
   - Click **Add secret**

3. Click **New repository secret** again
4. For **App Insights Connection String**:
   - Name: `VITE_APPINSIGHTS_CONNECTION_STRING`
   - Secret: (paste the full connection string above)
   - Click **Add secret**

### Step 3: Verify Secrets

After adding both secrets, you should see:

- ✅ `VITE_GA4_MEASUREMENT_ID`
- ✅ `VITE_APPINSIGHTS_CONNECTION_STRING`

## Deployment Flow

Once secrets are added:

1. **Commit and Push** your code to `main` branch
2. **GitHub Actions** will automatically:
   - Build frontend with monitoring credentials
   - Build backend API
   - Push Docker images to Azure Container Registry
   - Deploy monitoring secrets to Kubernetes
   - Deploy updated applications to AKS
3. **Verify** at https://tulm.mindx.edu.vn

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit** `.env` files to Git
2. **Never expose** secrets in logs or error messages
3. **Rotate secrets** periodically (every 3-6 months)
4. **Use separate** credentials for development vs production

## Monitoring URLs

After deployment, access monitoring dashboards:

### Azure Application Insights

- Portal: https://portal.azure.com
- Resource: `week1-fullstack-app-insights`
- Resource Group: `mindx-tulm-rg`

### Google Analytics 4

- Dashboard: https://analytics.google.com
- Property: `Week1 Fullstack App`
- Measurement ID: `G-4JM2MY93GL`

## Troubleshooting

### Frontend Not Tracking Events

1. Check if secrets are correctly added to GitHub
2. Verify build logs show environment variables being set
3. Check browser console for initialization messages
4. Test with GA4 DebugView (realtime debugging)

### Backend Not Sending Telemetry

1. Verify `app-insights-secret` exists in Kubernetes:
   ```bash
   kubectl get secret app-insights-secret
   ```
2. Check API pod logs:
   ```bash
   kubectl logs deployment/mindx-api
   ```
3. Look for "✅ Application Insights initialized successfully"

### CI/CD Pipeline Fails

1. Check GitHub Actions logs
2. Verify all secrets are added
3. Ensure Azure credentials (`AZURE_CREDENTIALS`) are still valid
4. Check Docker build logs for errors

## Next Steps

After setup is complete:

1. ✅ Add GitHub Secrets (this guide)
2. ✅ Commit and push code
3. 📊 Monitor deployment in GitHub Actions
4. 🎉 Verify at https://tulm.mindx.edu.vn
5. 📈 Check realtime data in GA4 and App Insights

## Support

For issues or questions:

- Check `WEEK2_COMPLETION_SUMMARY.md` for full documentation
- Review monitoring guides in `/monitoring` folder
- Test locally first with `.env.production` file
