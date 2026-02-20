# ============================================================
#  PIXORUS — Deploy All 9 Lambda Functions (Windows PowerShell)
#
#  HOW TO RUN:
#    1. Open PowerShell in the pixorus-aws\ folder
#    2. Run: .\deploy-lambdas.ps1
# ============================================================

$REGION = "us-east-2"
$STAGE  = "prod"
$ERRORS = 0

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PIXORUS Lambda Deployer"
Write-Host "  Region: $REGION  |  Stage: $STAGE"
Write-Host "============================================"
Write-Host ""

function Deploy-Lambda($FN) {
  $ZIP      = "$env:TEMP\pixorus-$FN.zip"
  $FuncName = "pixorus-$FN-$STAGE"
  $IndexJs  = "backend\lambda\$FN\index.js"

  Write-Host "  Deploying $FuncName ... " -NoNewline

  if (-not (Test-Path $IndexJs)) {
    Write-Host "SKIPPED (file missing)" -ForegroundColor Yellow
    return
  }

  if (Test-Path $ZIP) { Remove-Item $ZIP -Force }
  Compress-Archive -Path $IndexJs -DestinationPath $ZIP -Force

  $out = aws lambda update-function-code `
    --function-name $FuncName `
    --zip-file "fileb://$ZIP" `
    --region $REGION `
    --output text 2>&1

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✓" -ForegroundColor Green
  } else {
    Write-Host "✗ FAILED" -ForegroundColor Red
    Write-Host "    $out" -ForegroundColor Red
    $script:ERRORS++
  }

  if (Test-Path $ZIP) { Remove-Item $ZIP -Force }
}

Deploy-Lambda "getProducts"
Deploy-Lambda "addProduct"
Deploy-Lambda "updateProduct"
Deploy-Lambda "deleteProduct"
Deploy-Lambda "getCategories"
Deploy-Lambda "manageCategory"
Deploy-Lambda "placeOrder"
Deploy-Lambda "getOrders"
Deploy-Lambda "uploadImage"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
if ($ERRORS -eq 0) {
  Write-Host "  All 9 Lambdas deployed!" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Verify:"
  Write-Host "  curl https://50926csg2g.execute-api.us-east-2.amazonaws.com/prod/products"
} else {
  Write-Host "  $ERRORS function(s) failed - see above" -ForegroundColor Red
}
Write-Host "============================================"
Write-Host ""
