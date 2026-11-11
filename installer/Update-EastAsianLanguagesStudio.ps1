# East Asian Languages Studio - update the installed copy to the version in the release folder (by Larry Dalton)
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File "$([Environment]::GetFolderPath('MyDocuments'))\east-asian-languages-studio-release\Update-EastAsianLanguagesStudio.ps1"
$ErrorActionPreference = 'Stop'
$docs = [Environment]::GetFolderPath('MyDocuments')
$zip  = Join-Path $docs 'east-asian-languages-studio-release\EastAsianLanguagesStudio-Package.zip'
$work = Join-Path $env:TEMP 'EastAsianLanguagesStudio-update'
if (-not (Test-Path -LiteralPath $zip)) { throw "Package not found: $zip" }
if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
Expand-Archive -LiteralPath $zip -DestinationPath $work -Force
# The installer stops the running studio, backs up the current version, installs, verifies over HTTP and rolls back on failure.
& (Join-Path $work 'EastAsianLanguagesStudio\Install.ps1') -Source (Join-Path $work 'EastAsianLanguagesStudio\payload')
$health = (Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8770/api/health' -TimeoutSec 10).Content
Write-Host "Server reports: $health"
if ($health -match '"version":"1\.0\.3"') { Write-Host 'East Asian Languages Studio 1.0.3 is running. Refresh the studio tab with Ctrl+F5.' -ForegroundColor Green }
else { Write-Host 'The version did not change - see the messages above.' -ForegroundColor Yellow }
