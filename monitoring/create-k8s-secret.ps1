# PowerShell script to create Kubernetes secret for Application Insights
# Usage: .\create-k8s-secret.ps1 "YOUR_CONNECTION_STRING"

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString
)

Write-Host "🔐 Creating Kubernetes Secret for Application Insights" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for connection string if not provided
if ([string]::IsNullOrEmpty($ConnectionString)) {
    Write-Host "Please enter your Application Insights Connection String:" -ForegroundColor Yellow
    Write-Host "(Format: InstrumentationKey=xxx;IngestionEndpoint=xxx;LiveEndpoint=xxx)" -ForegroundColor Gray
    $ConnectionString = Read-Host
}

# Validate connection string
if ([string]::IsNullOrEmpty($ConnectionString)) {
    Write-Host "❌ Error: Connection string cannot be empty" -ForegroundColor Red
    exit 1
}

if (-not $ConnectionString.Contains("InstrumentationKey=")) {
    Write-Host "❌ Error: Connection string format appears invalid" -ForegroundColor Red
    Write-Host "Expected format: InstrumentationKey=xxx;IngestionEndpoint=xxx;LiveEndpoint=xxx" -ForegroundColor Yellow
    exit 1
}

# Create the secret
Write-Host ""
Write-Host "Creating secret 'app-insights-secret' in default namespace..." -ForegroundColor Yellow

try {
    # Create secret using kubectl
    $secretYaml = kubectl create secret generic app-insights-secret `
        --from-literal=connection-string="$ConnectionString" `
        --namespace default `
        --dry-run=client -o yaml
    
    $secretYaml | kubectl apply -f -
    
    Write-Host "✅ Secret created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify with:" -ForegroundColor Cyan
    Write-Host "  kubectl get secret app-insights-secret" -ForegroundColor Gray
    Write-Host ""
    Write-Host "View (base64 encoded):" -ForegroundColor Cyan
    Write-Host "  kubectl get secret app-insights-secret -o yaml" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Decode to verify (PowerShell):" -ForegroundColor Cyan
    Write-Host '  $encoded = kubectl get secret app-insights-secret -o jsonpath="{.data.connection-string}"' -ForegroundColor Gray
    Write-Host '  [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($encoded))' -ForegroundColor Gray
}
catch {
    Write-Host "❌ Failed to create secret: $_" -ForegroundColor Red
    exit 1
}

