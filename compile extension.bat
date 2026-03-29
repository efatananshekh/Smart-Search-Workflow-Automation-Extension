@echo off
title Case Searcher Extension - Configuration Tool
color 0F

echo ============================================================
echo        Case Searcher Extension - Configuration Tool
echo ============================================================
echo.
echo This tool will configure the extension for your website.
echo.

:: Get the current directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo Current directory: %CD%
echo.

:: Check if files exist
if not exist "manifest.json" (
    echo ERROR: manifest.json not found in current directory.
    echo Please run this script from the extension folder.
    pause
    exit /b 1
)

if not exist "contentScript.js" (
    echo ERROR: contentScript.js not found in current directory.
    pause
    exit /b 1
)

echo ============================================================
echo STEP 1: Enter your website domain
echo ============================================================
echo.
echo Example formats:
echo   - cs.yourcompany.com
echo   - app.yourcompany.com
echo   - yourcompany.com
echo.
echo Do NOT include https:// or trailing slash
echo.
set /p USER_DOMAIN="Enter your domain: "

if "%USER_DOMAIN%"=="" (
    echo ERROR: No domain entered.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo STEP 2: Enter the case view path
echo ============================================================
echo.
echo This is the URL path that appears before the case ID.
echo.
echo Common examples:
echo   - inquiry-center/cases/view
echo   - cases/view
echo   - support/tickets/view
echo.
echo Do NOT include leading or trailing slashes
echo.
set /p USER_PATH="Enter case view path: "

if "%USER_PATH%"=="" (
    echo ERROR: No path entered.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo STEP 3: Verify your configuration
echo ============================================================
echo.
echo Domain: %USER_DOMAIN%
echo Path: %USER_PATH%
echo.
echo Full URL pattern: https://%USER_DOMAIN%/%USER_PATH%/*
echo.
echo Is this correct? (Y/N)
set /p CONFIRM="> "

if /i not "%CONFIRM%"=="Y" (
    echo Configuration cancelled.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo Applying configuration...
echo ============================================================

:: Create backup of original files
echo Creating backups...
if exist "manifest.json" (
    if not exist "manifest.json.bak" (
        copy "manifest.json" "manifest.json.bak" > nul
        echo manifest.json.bak created
    )
)
if exist "contentScript.js" (
    if not exist "contentScript.js.bak" (
        copy "contentScript.js" "contentScript.js.bak" > nul
        echo contentScript.js.bak created
    )
)

:: Configure manifest.json
echo Configuring manifest.json...

powershell -Command "$path = '%CD%\manifest.json'; $content = Get-Content $path -Raw -Encoding UTF8; $content = $content -replace 'https://YOUR_DOMAIN_HERE/YOUR_PATH_HERE/\*', 'https://%USER_DOMAIN%/%USER_PATH%/*'; $content = $content -replace '<ENTER_YOUR_BASE_URL>/<ENTER_CASE_VIEW_PATH>/\*', 'https://%USER_DOMAIN%/%USER_PATH%/*'; $content = $content -replace 'YOUR_DOMAIN_HERE/YOUR_PATH_HERE', '%USER_DOMAIN%/%USER_PATH%'; Set-Content $path -Value $content -NoNewline -Encoding UTF8" 2> nul

if errorlevel 1 (
    echo PowerShell method failed, trying alternative...
    powershell -Command "$path = '%CD%\manifest.json'; $content = Get-Content $path -Raw; $content = $content -replace 'YOUR_DOMAIN_HERE', '%USER_DOMAIN%'; $content = $content -replace 'YOUR_PATH_HERE', '%USER_PATH%'; Set-Content $path -Value $content -NoNewline" 2> nul
)

:: Configure contentScript.js
echo Configuring contentScript.js...

powershell -Command "$path = '%CD%\contentScript.js'; $content = Get-Content $path -Raw -Encoding UTF8; $content = $content -replace 'const BASE_URL = \"YOUR_DOMAIN_HERE\";', 'const BASE_URL = \"https://%USER_DOMAIN%\";'; $content = $content -replace 'const URL_PATTERN = \"YOUR_PATH_HERE\";', 'const URL_PATTERN = \"/%USER_PATH%/\";'; $content = $content -replace '<ENTER_YOUR_BASE_URL>', 'https://%USER_DOMAIN%'; $content = $content -replace '<ENTER_CASE_VIEW_PATH>', '/%USER_PATH%/'; Set-Content $path -Value $content -NoNewline -Encoding UTF8" 2> nul

if errorlevel 1 (
    echo ERROR: Failed to configure contentScript.js.
    goto :error_exit
)

echo contentScript.js configured.

:: Verify configuration
echo.
echo ============================================================
echo Verifying configuration...
echo ============================================================

findstr /C:"%USER_DOMAIN%" "manifest.json" > nul
if errorlevel 1 (
    echo WARNING: Domain may not be correctly set in manifest.json
) else (
    echo OK: manifest.json contains your domain
)

findstr /C:"/%USER_PATH%/" "contentScript.js" > nul
if errorlevel 1 (
    echo WARNING: Path may not be correctly set in contentScript.js
) else (
    echo OK: contentScript.js contains your path
)

echo.
echo ============================================================
echo Configuration Complete!
echo ============================================================
echo.
echo Your extension is now configured for:
echo   URL: https://%USER_DOMAIN%/%USER_PATH%/*
echo.
echo ============================================================
echo NEXT STEPS:
echo ============================================================
echo.
echo 1. Open Chrome and go to: chrome://extensions/
echo 2. Enable "Developer mode" (top right)
echo 3. Click "Load unpacked"
echo 4. Select this folder: %CD%
echo 5. The extension will appear
echo.
echo To test: Navigate to https://%USER_DOMAIN%/%USER_PATH%/[case-id]
echo.
echo ============================================================
pause
exit /b 0

:error_exit
echo.
echo ERROR: Configuration failed.
echo.
echo Please configure manually:
echo.
echo === manifest.json ===
echo Replace with: "https://%USER_DOMAIN%/%USER_PATH%/*"
echo.
echo === contentScript.js ===
echo Set: const BASE_URL = "https://%USER_DOMAIN%";
echo Set: const URL_PATTERN = "/%USER_PATH%/";
echo.
pause
exit /b 1