# Test with some errors
$url = "https://tulm.mindx.edu.vn"

Write-Host "Generating requests with 20% error rate..." -ForegroundColor Cyan
Write-Host ""

$success = 0
$errors = 0

for ($i = 1; $i -le 50; $i++) {
    try {
        # Every 5th request will be to a non-existent endpoint (error)
        if ($i % 5 -eq 0) {
            $endpoint = "$url/api/nonexistent-$i"
            Write-Host "Request $i - Sending to error endpoint..." -ForegroundColor Yellow
        } else {
            $endpoint = "$url/health"
        }
        
        $response = Invoke-WebRequest -Uri $endpoint -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $success++
        Write-Host "Request $i - OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $errors++
        Write-Host "Request $i - ERROR" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTS:" -ForegroundColor White
Write-Host "Success: $success" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor Red
Write-Host "Error Rate: $([math]::Round(($errors / 50) * 100, 2))%" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now check Azure Portal:" -ForegroundColor Yellow
Write-Host "- Failed requests chart should show $errors errors" -ForegroundColor Yellow
Write-Host "- Refresh the page after 1-2 minutes" -ForegroundColor Yellow
Write-Host ""

