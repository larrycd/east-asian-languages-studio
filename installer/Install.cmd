@echo off
title East Asian Languages Studio installer
echo Placing the East Asian Languages Studio infographic on your Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); Copy-Item -LiteralPath '%~dp0East Asian Languages Studio - How It Works.png' -Destination $d -Force; Write-Host ('Copied to ' + $d)"
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install.ps1" -Source "%~dp0payload"
echo.
pause
