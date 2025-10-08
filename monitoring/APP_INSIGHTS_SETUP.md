# Azure Application Insights Setup Guide

## Phần 1: Tạo Application Insights Resource

### Bước 1: Tạo App Insights qua Azure Portal (Khuyến nghị cho người mới)

1. Đăng nhập vào [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → tìm **"Application Insights"**
3. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource Group**: Sử dụng cùng resource group với AKS cluster (từ Week 1)
   - **Name**: `mindx-week1-app-insights`
   - **Region**: Chọn cùng region với AKS (ví dụ: East US)
   - **Resource Mode**: Chọn **Workspace-based**
   - **Log Analytics Workspace**: Tạo mới hoặc chọn existing workspace

4. Click **"Review + Create"** → **"Create"**

5. Sau khi deploy xong, vào resource và lấy các thông tin sau:
   - **Instrumentation Key** (tab Overview)
   - **Connection String** (tab Overview)

### Bước 2: Tạo App Insights qua Azure CLI (Cho advanced users)

```bash
# Đặt variables
RESOURCE_GROUP="mindx-week1-rg"
LOCATION="eastus"
APP_INSIGHTS_NAME="mindx-week1-app-insights"
WORKSPACE_NAME="mindx-week1-logs"

# Tạo Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --location $LOCATION

# Lấy workspace ID
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group $RESOURCE_GROUP \
  --workspace-name $WORKSPACE_NAME \
  --query id -o tsv)

# Tạo Application Insights
az monitor app-insights component create \
  --app $APP_INSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --workspace $WORKSPACE_ID

# Lấy Instrumentation Key
az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv

# Lấy Connection String
az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv
```

### Bước 3: Lưu các Keys

Tạo file `.env` trong thư mục `/monitoring` (KHÔNG commit vào Git):

```bash
# App Insights Keys
APPINSIGHTS_INSTRUMENTATION_KEY="your-instrumentation-key-here"
APPINSIGHTS_CONNECTION_STRING="InstrumentationKey=your-key;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/"
```

## Phần 2: Cấu hình Kubernetes Secrets

### Tạo Kubernetes Secret cho App Insights

```bash
# Thay YOUR_CONNECTION_STRING bằng connection string thực tế
kubectl create secret generic app-insights-secret \
  --from-literal=connection-string="YOUR_CONNECTION_STRING" \
  --namespace default

# Verify secret đã được tạo
kubectl get secret app-insights-secret -o yaml
```

## Phần 3: Self-Check Permissions

### Kiểm tra quyền truy cập của bạn:

```bash
# 1. Kiểm tra có thể tạo App Insights không
az monitor app-insights component list --resource-group $RESOURCE_GROUP

# 2. Kiểm tra có thể xem metrics không
az monitor app-insights component show \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP

# 3. Kiểm tra có thể tạo alert rules không
az monitor metrics alert list --resource-group $RESOURCE_GROUP
```

### Nếu gặp lỗi permission:

**Bạn cần quyền sau:**
- `Monitoring Contributor` role trên resource group
- Hoặc liên hệ DevOps team để được cấp quyền

**Temporary Solution:**
- Yêu cầu DevOps team tạo App Insights resource
- Họ cung cấp cho bạn Connection String
- Bạn chỉ cần integrate SDK vào code

## Phần 4: Test Connection

### Test từ local machine:

```bash
# Install Azure CLI
# Windows: https://aka.ms/installazurecliwindows
# Mac: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Test query
az monitor app-insights query \
  --app $APP_INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --analytics-query "requests | take 10"
```

## Next Steps

Sau khi hoàn thành setup này, bạn có thể:
1. ✅ Tích hợp SDK vào Backend API (xem `BACKEND_INTEGRATION.md`)
2. ✅ Tích hợp SDK vào Frontend React (xem `FRONTEND_INTEGRATION.md`)
3. ✅ Configure alerts (xem `ALERTS_SETUP.md`)
4. ✅ Create dashboards (xem `DASHBOARDS_GUIDE.md`)

## Troubleshooting

### Vấn đề: "Resource not found"
**Giải pháp**: Kiểm tra resource group name và region có đúng không

### Vấn đề: "Insufficient permissions"
**Giải pháp**: Yêu cầu `Monitoring Contributor` role từ admin

### Vấn đề: "Connection string không hoạt động"
**Giải pháp**: Regenerate keys trong Azure Portal → Settings → API Access

## Resources

- [Azure Application Insights Docs](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Node.js SDK Documentation](https://docs.microsoft.com/azure/azure-monitor/app/nodejs)
- [Troubleshooting Guide](https://docs.microsoft.com/azure/azure-monitor/app/asp-net-troubleshoot-no-data)

