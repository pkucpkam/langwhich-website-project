# ======================================================================
#                 LANGWHICH WEBSITE PROJECT - POWERSHELL RUNNER         
# ======================================================================
# This script starts both the Spring Boot Backend and Next.js Frontend
# as background jobs, streams their logs in real-time, and cleans them up.
# ======================================================================

$originalDir = Get-Location

# Define clean-up script
function Cleanup {
    Write-Host "`n======================================================================" -ForegroundColor Red
    Write-Host "                 STOPPING APPLICATIONS & CLEANING UP                 " -ForegroundColor Red
    Write-Host "======================================================================" -ForegroundColor Red

    # Stop and remove background jobs
    Get-Job | ForEach-Object {
        $name = $_.Name
        Write-Host "Stopping background job: $name..." -ForegroundColor Yellow
        Stop-Job $_ -ErrorAction SilentlyContinue
        Remove-Job $_ -ErrorAction SilentlyContinue
    }
    
    # Clean up the Gradle Daemon
    Write-Host "[Backend] Stopping Gradle Daemon to release RAM..." -ForegroundColor Blue
    Set-Location "$originalDir\backend"
    .\gradlew.bat --stop | Out-Null
    
    Set-Location $originalDir
    Write-Host "All processes stopped cleanly. Have a nice day!" -ForegroundColor Yellow
    exit
}

# Trap standard break key / Ctrl+C
$Host.UI.RawUI.FlushInputBuffer()

# Check prerequisites
if (-not (Test-Path "backend\.env")) {
    Write-Error "Missing backend\.env file! Please copy backend\.env.example to backend\.env."
    exit 1
}
if (-not (Test-Path "frontend\.env.local")) {
    Write-Error "Missing frontend\.env.local file! Please copy frontend\.env.local.example to frontend\.env.local."
    exit 1
}

# Install dependencies if missing
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[Warning] frontend\node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm install
    Set-Location $originalDir
}

Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "                 STARTING LANGWHICH WEBSITE PROJECT                  " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow

# Start backend job
Write-Host "[Backend] Starting Spring Boot backend on http://localhost:8080..." -ForegroundColor Blue
Start-Job -Name "LangWhich-Backend" -ScriptBlock {
    Set-Location "$using:originalDir\backend"
    .\gradlew.bat bootRun
} | Out-Null

# Start frontend job
Write-Host "[Frontend] Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Green
Start-Job -Name "LangWhich-Frontend" -ScriptBlock {
    Set-Location "$using:originalDir\frontend"
    npm run dev
} | Out-Null

Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "✓ Frontend is starting at: http://localhost:3000" -ForegroundColor Green
Write-Host "✓ Backend is starting at:  http://localhost:8080" -ForegroundColor Blue
Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "Press [Ctrl+C] at any time to shutdown BOTH servers and free up RAM." -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow

# Loop to stream output and await Ctrl+C
try {
    while ($true) {
        Get-Job | Receive-Job
        Start-Sleep -Milliseconds 400
    }
}
finally {
    Cleanup
}
