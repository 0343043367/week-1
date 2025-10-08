# Simple Traffic Test
$url = "https://tulm.mindx.edu.vn"

Write-Host "Generating 30 requests to test monitoring..." -ForegroundColor Cyan
Write-Host ""

$success = 0
$errors = 0

for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$url/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $success++
            Write-Host "Request $i - OK" -ForegroundColor Green
        }
    } catch {
        $errors++
        Write-Host "Request $i - Error" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTS:" -ForegroundColor White
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now check Azure Portal and refresh the page!" -ForegroundColor Yellow
Write-Host "You should see the Server requests chart increase." -ForegroundColor Yellow
Write-Host ""

$open = Read-Host "Open Azure Portal now? (y/n)"
if ($open -eq 'y') {
    Start-Process "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents"
}

