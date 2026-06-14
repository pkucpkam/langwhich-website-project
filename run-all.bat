@echo off
title LangWhich Launcher
echo ======================================================================
echo                  STARTING LANGWHICH WEBSITE PROJECT                  
echo ======================================================================

REM Check prerequisites
if not exist "backend\.env" (
    echo [Error] Missing backend\.env file!
    echo Please copy backend\.env.example to backend\.env and configure your database.
    pause
    exit /b 1
)
if not exist "frontend\.env.local" (
    echo [Error] Missing frontend\.env.local file!
    echo Please copy frontend\.env.local.example to frontend\.env.local.
    pause
    exit /b 1
)

REM Check if Git Bash exists to run the sh script, otherwise run PowerShell
where bash >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [System] Launching via Git Bash (Bash Script)...
    bash run-all.sh
    exit /b %ERRORLEVEL%
)

where powershell >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [System] Launching via PowerShell Script...
    powershell -ExecutionPolicy Bypass -File run-all.ps1
    exit /b %ERRORLEVEL%
)

echo [Error] Neither Git Bash (bash) nor PowerShell was found in your PATH!
pause
exit /b 1
