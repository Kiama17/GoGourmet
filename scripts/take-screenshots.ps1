#requires -Version 7
<#
.SYNOPSIS
  Captures Play Store screenshots from an Android emulator/device using ADB.
  Run this after installing the APK and opening the relevant screens.
#>

$OUT = Join-Path $PSScriptRoot "..\assets\store"
$DEVICE = "emulator-5554"  # override via -Device param

param(
  [string]$Device = "emulator-5554"
)

$screens = @(
  @{ name = "phone-home";      intent = "home" }
  @{ name = "phone-menu";      intent = "food-detail" }
  @{ name = "phone-cart";      intent = "cart" }
  @{ name = "phone-checkout";  intent = "checkout" }
  @{ name = "phone-orders";    intent = "orders" }
)

Write-Host "=== Play Store Screenshot Capture ===" -ForegroundColor Cyan
Write-Host "Target device: $Device"
Write-Host "Output dir:    $OUT"
Write-Host ""

# Verify ADB
$adb = Get-Command "adb" -ErrorAction SilentlyContinue
if (-not $adb) {
  Write-Error "ADB not found. Install Android platform tools and add adb to PATH."
  exit 1
}

# Verify device
$devices = & adb devices
if ($devices -notmatch "$Device") {
  Write-Error "Device $Device not found. Connected devices:`n$devices"
  exit 1
}

Write-Host "Capturing $($screens.Count) screenshots..." -ForegroundColor Yellow

foreach ($s in $screens) {
  $path = Join-Path $OUT "$($s.name).png"
  Write-Host "  [$($s.name)] capturing..."
  & adb -s $Device shell screencap -p "/sdcard/$($s.name).png"
  & adb -s $Device pull "/sdcard/$($s.name).png" $path
  & adb -s $Device shell rm "/sdcard/$($s.name).png"

  if (Test-Path $path) {
    Write-Host "    saved to $path" -ForegroundColor Green
  } else {
    Write-Host "    FAILED" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "Before capturing each screen, navigate the app on the emulator to the correct screen."
Write-Host "Run this script once per screen state you want to capture."
