# Fix Git PATH - Run as Administrator
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git PATH Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Running as Administrator ✓" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
$gitPath = "C:\Program Files\Git\bin\git.exe"
if (Test-Path $gitPath) {
    Write-Host "Git found at: $gitPath" -ForegroundColor Green
} else {
    Write-Host "ERROR: Git not found at expected location!" -ForegroundColor Red
    Write-Host "Please install Git first from: https://git-scm.com/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get current PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$gitBinPath = "C:\Program Files\Git\bin"

# Check if Git is already in PATH
if ($currentPath -like "*$gitBinPath*") {
    Write-Host "Git is already in system PATH ✓" -ForegroundColor Green
} else {
    Write-Host "Adding Git to system PATH..." -ForegroundColor Yellow
    
    # Add Git to system PATH
    $newPath = $currentPath + ";" + $gitBinPath
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    
    Write-Host "Git added to system PATH ✓" -ForegroundColor Green
    Write-Host "Note: You may need to restart your terminal for changes to take effect" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Git PATH Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a new PowerShell window" -ForegroundColor White
Write-Host "3. Test with: git --version" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit" 