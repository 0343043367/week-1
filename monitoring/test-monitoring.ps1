# Week 2 Monitoring Test Script
Write-Host "Testing Week 2 Monitoring Setup..." -ForegroundColor Cyan
Write-Host ""

# 1. Test Website
Write-Host "1. Testing Website..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://tulm.mindx.edu.vn" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK: Website is UP" -ForegroundColor Green
    }
} catch {
    Write-Host "   FAIL: Website is DOWN" -ForegroundColor Red
}

# 2. Test API Health
Write-Host "2. Testing API Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://tulm.mindx.edu.vn/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   OK: API is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "   FAIL: API health check failed" -ForegroundColor Red
}

# 3. Open monitoring dashboards
Write-Host ""
Write-Host "3. Opening Monitoring Dashboards..." -ForegroundColor Yellow
Write-Host "   Opening Google Analytics 4 Realtime..." -ForegroundColor Cyan
Start-Process "https://analytics.google.com/analytics/web/#/realtime"

Start-Sleep -Seconds 2

Write-Host "   Opening Azure Application Insights..." -ForegroundColor Cyan
Start-Process "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents"

Start-Sleep -Seconds 2

Write-Host "   Opening Test Website..." -ForegroundColor Cyan
Start-Process "https://tulm.mindx.edu.vn"

Write-Host ""
Write-Host "Manual Checks:" -ForegroundColor Yellow
Write-Host "   1. In GA4 Realtime, you should see 1 active user" -ForegroundColor White
Write-Host "   2. In App Insights Overview, check metrics are populated" -ForegroundColor White
Write-Host "   3. In browser console (F12), check for initialization logs" -ForegroundColor White
Write-Host "   4. Navigate pages and watch GA4 events in realtime" -ForegroundColor White
Write-Host ""
Write-Host "Week 2 Monitoring Test Complete!" -ForegroundColor Green
Write-Host "If all checks pass, Week 2 is DONE!" -ForegroundColor Green
