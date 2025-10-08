# Simple script to create Kubernetes secret for Application Insights

Write-Host "Creating Kubernetes Secret for Application Insights" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please paste your Application Insights Connection String:" -ForegroundColor Yellow
Write-Host ""

$ConnectionString = Read-Host "Connection String"

if ([string]::IsNullOrEmpty($ConnectionString)) {
    Write-Host "Error: Connection string cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating secret..." -ForegroundColor Yellow

try {
    # Delete old secret if exists
    kubectl delete secret app-insights-secret --ignore-not-found=true
    
    # Create new secret
    kubectl create secret generic app-insights-secret --from-literal=connection-string="$ConnectionString"
    
    Write-Host ""
    Write-Host "SUCCESS! Secret created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now restart the API deployment:" -ForegroundColor Cyan
    Write-Host "  kubectl rollout restart deployment mindx-api" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Error creating secret: $_" -ForegroundColor Red
    exit 1
}

