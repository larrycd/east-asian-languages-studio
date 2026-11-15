#requires -version 5.1
<#
  East Asian Languages Studio installer - by Larry Dalton
  Installs for the current Windows account only (no administrator rights), in %LOCALAPPDATA%\EastAsianLanguagesStudio.
  Steps: back up any previous version, free port 8770 only if the previous East Asian Languages Studio holds it,
  copy the files, start the server, verify it over HTTP, add a sign-in shortcut, open the studio.
  On any failure the previous version is restored. The result is written to %TEMP%\EastAsianLanguagesStudio-install-result.txt.
#>
param(
    [string]$Source = '',
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$Port = 8770
$Version = '1.0.4'
$ResultFile = Join-Path $env:TEMP 'EastAsianLanguagesStudio-install-result.txt'
if (-not $Source) { $Source = Join-Path $PSScriptRoot 'payload' }
$App = Join-Path $env:LOCALAPPDATA 'EastAsianLanguagesStudio'
$Startup = [Environment]::GetFolderPath('Startup')
$StartupLnk = Join-Path $Startup 'East Asian Languages Studio.lnk'
$PsExe = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$Backup = $null

function Write-Result([string]$Text) { [System.IO.File]::WriteAllText($ResultFile, $Text, [System.Text.Encoding]::ASCII) }
function Step([string]$Text) { Write-Host ('  - ' + $Text) }
function Get-Url([string]$Url, [int]$TimeoutMs = 4000) {
    $rq = [System.Net.WebRequest]::Create($Url)
    $rq.Proxy = $null; $rq.Timeout = $TimeoutMs
    $rs = $rq.GetResponse()
    try {
        $ms = New-Object System.IO.MemoryStream
        $rs.GetResponseStream().CopyTo($ms)
        return , $ms.ToArray()
    } finally { $rs.Close() }
}
function Get-Text([string]$Url) { return [System.Text.Encoding]::UTF8.GetString((Get-Url $Url)) }
function Stop-Studio {
    Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match '\\EastAsianLanguagesStudio\\server\.ps1' -and $_.ProcessId -ne $PID } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 800
}
function Test-PortFree {
    try { $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port); $l.Start(); $l.Stop(); return $true } catch { return $false }
}
function Start-StudioDirect {
    $srv = Join-Path $App 'server.ps1'
    Start-Process -FilePath $PsExe -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $srv + '"')) -WindowStyle Hidden | Out-Null
}
# ---- Keep-alive (scheduled task) - by Larry Dalton ----
$KeepName = 'East Asian Languages Studio'
$script:KeepTask = $null
function Start-Studio {
    if ($script:KeepTask -and (Test-Path -LiteralPath (Join-Path $App 'start-server.vbs'))) { try { Start-ScheduledTask -TaskName $script:KeepTask -ErrorAction Stop; return } catch { } }
    Start-StudioDirect
}
function Write-KeepVbs {
    $common = @"
Function IsUp()
  On Error Resume Next
  Dim x
  Set x = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  x.setTimeouts 2000, 2000, 2000, 3000
  x.open "GET", "http://localhost:$Port/api/health", False
  x.send
  IsUp = (Err.Number = 0 And x.status = 200)
  On Error Goto 0
End Function
Sub StartServer()
  Dim sh, fso, dir
  Set sh = CreateObject("WScript.Shell")
  Set fso = CreateObject("Scripting.FileSystemObject")
  dir = fso.GetParentFolderName(WScript.ScriptFullName)
  sh.Run """" & sh.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\server.ps1""", 0, False
End Sub
"@
    $start = "' $KeepName`: starts the server hidden if it is not already answering on port $Port.`r`n' Run by the scheduled task '$KeepName - keep running'. By Larry Dalton.`r`nOption Explicit`r`n" + $common + "`r`nIf Not IsUp() Then StartServer`r`n"
    $open = "' $KeepName`: starts the server if needed, waits for it, then opens http://localhost:$Port/`r`n' By Larry Dalton.`r`nOption Explicit`r`n" + $common + @"

Dim i, ok
ok = IsUp()
If Not ok Then
  StartServer
  For i = 1 To 60
    WScript.Sleep 500
    If IsUp() Then ok = True: Exit For
  Next
End If
If ok Then
  CreateObject("WScript.Shell").Run "http://localhost:$Port/"
Else
  MsgBox "$KeepName did not start within 30 seconds." & vbCrLf & vbCrLf & "Please run its installer again.", vbExclamation, "$KeepName"
End If
"@
    [System.IO.File]::WriteAllText((Join-Path $App 'start-server.vbs'), $start.Replace("`r`n", "`n").Replace("`n", "`r`n"), [System.Text.Encoding]::ASCII)
    [System.IO.File]::WriteAllText((Join-Path $App 'open-studio.vbs'), $open.Replace("`r`n", "`n").Replace("`n", "`r`n"), [System.Text.Encoding]::ASCII)
}
function Register-KeepTask {
    $task = "$KeepName - keep running"
    $me = [System.Security.SecurityElement]::Escape([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)
    $wscript = [System.Security.SecurityElement]::Escape((Join-Path $env:WINDIR 'System32\wscript.exe'))
    $arg = [System.Security.SecurityElement]::Escape('//B //Nologo "' + (Join-Path $App 'start-server.vbs') + '"')
    $desc = [System.Security.SecurityElement]::Escape("Keeps $KeepName running at http://localhost:$Port/ - starts it at sign-in, on unlock and every 5 minutes if it has stopped.")
    $xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Author>Larry Dalton</Author><Description>$desc</Description></RegistrationInfo>
  <Triggers>
    <LogonTrigger><Enabled>true</Enabled><UserId>$me</UserId></LogonTrigger>
    <SessionStateChangeTrigger><Enabled>true</Enabled><StateChange>SessionUnlock</StateChange><UserId>$me</UserId></SessionStateChangeTrigger>
    <TimeTrigger><Repetition><Interval>PT5M</Interval><StopAtDurationEnd>false</StopAtDurationEnd></Repetition><StartBoundary>2026-01-01T00:00:00</StartBoundary><Enabled>true</Enabled></TimeTrigger>
  </Triggers>
  <Principals><Principal id="Author"><UserId>$me</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries><StopIfGoingOnBatteries>false</StopIfGoingOnBatteries><AllowHardTerminate>true</AllowHardTerminate><StartWhenAvailable>true</StartWhenAvailable><RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable><IdleSettings><StopOnIdleEnd>false</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings><AllowStartOnDemand>true</AllowStartOnDemand><Enabled>true</Enabled><Hidden>false</Hidden><RunOnlyIfIdle>false</RunOnlyIfIdle><WakeToRun>false</WakeToRun><ExecutionTimeLimit>PT5M</ExecutionTimeLimit><Priority>7</Priority></Settings>
  <Actions Context="Author"><Exec><Command>$wscript</Command><Arguments>$arg</Arguments></Exec></Actions>
</Task>
"@
    try { Register-ScheduledTask -TaskName $task -Xml $xml -Force -ErrorAction Stop | Out-Null }
    catch {
        $tmp = Join-Path $env:TEMP ('studio-task-' + $Port + '.xml')
        [System.IO.File]::WriteAllText($tmp, $xml, [System.Text.Encoding]::Unicode)
        $out = & schtasks.exe /Create /TN $task /XML $tmp /F 2>&1
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
        if ($LASTEXITCODE -ne 0) { throw ('could not create the scheduled task: ' + ($out -join ' ')) }
    }
    [void](Get-ScheduledTask -TaskName $task -ErrorAction Stop)
    return $task
}
# ---- end keep-alive ----

Write-Host ''
Write-Host "East Asian Languages Studio $Version installer - by Larry Dalton" -ForegroundColor Red
Write-Host ''
try {
    if ($PSVersionTable.PSVersion.Major -lt 5) { throw 'Windows PowerShell 5.1 or later is required.' }
    foreach ($f in @('server.ps1', 'app\index.html', 'app\engine.js', 'app\data\glyphs.json', 'app\data\zh\dict1.json', 'app\data\zh\dict2.json', 'app\data\ja\dict1.json', 'app\data\ja\dict2.json', 'app\data\ja\dict3.json', 'app\data\ko\dict.json', 'app\data\ex\ja.json', 'app\data\tpl\kr.bin', 'app\data\cmu.tsv', 'app\vendor\hb.wasm', 'app\vendor\kuromoji\kuromoji.js', 'app\vendor\kuromoji\dict\base.dat.gz', 'app\fonts\EASC.ttf', 'app\fonts\EATC.ttf', 'app\fonts\EAJP.ttf', 'app\fonts\EAKR.ttf')) {
        if (-not (Test-Path -LiteralPath (Join-Path $Source $f))) { throw "Package file missing: $f" }
    }
    Step 'Package files present'

    $hadOld = Test-Path -LiteralPath $App
    Stop-Studio
    if (-not (Test-PortFree)) { throw "Port $Port is in use by another program. East Asian Languages Studio did not stop it and did not change the port." }
    Step "Port $Port is free"

    if ($hadOld) {
        $Backup = $App + '-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
        Move-Item -LiteralPath $App -Destination $Backup
        Step "Previous version backed up to $Backup"
    }
    New-Item -ItemType Directory -Path $App -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $Source 'server.ps1') -Destination $App -Force
    Copy-Item -LiteralPath (Join-Path $Source 'app') -Destination $App -Recurse -Force
    foreach ($f in @('Uninstall.ps1', 'eastasian.ico')) { $p = Join-Path $Source $f; if (Test-Path -LiteralPath $p) { Copy-Item -LiteralPath $p -Destination $App -Force } }
    Step "Files written to $App"

    try { Write-KeepVbs; $script:KeepTask = Register-KeepTask; Step ('Scheduled task "' + $script:KeepTask + '" registered (sign-in, unlock, every 5 minutes)') }
    catch { $script:KeepTask = $null; Step ('Scheduled task not available (' + $_.Exception.Message + '); a Startup shortcut will be used instead') }
    Start-Studio
    $health = $null
    for ($i = 0; $i -lt 40 -and -not $health; $i++) {
        Start-Sleep -Milliseconds 500
        try { $health = Get-Text "http://localhost:$Port/api/health" } catch { }
    }
    if (-not $health -or $health -notmatch '"East Asian Languages Studio"') { throw 'The server did not start (no answer from /api/health).' }
    Step 'Server started'

    $page = Get-Text "http://localhost:$Port/"
    if ($page -notmatch 'East Asian Languages Studio') { throw 'The studio page was not served correctly.' }
    $eng = Get-Text "http://localhost:$Port/engine.js"
    if ($eng -notmatch 'East Asian Languages Studio engine') { throw 'The engine was not served correctly.' }
    $zhEntries = 0
    foreach ($part in @('dict1', 'dict2')) { $zh = Get-Text "http://localhost:$Port/data/zh/$part.json"; $zhEntries += ([regex]::Matches($zh, '\],\["')).Count + 1 }
    if ($zhEntries -lt 120000) { throw "Mandarin dictionary incomplete ($zhEntries entries)." }
    $jaEntries = 0
    foreach ($part in @('dict1', 'dict2', 'dict3')) { $ja = Get-Text "http://localhost:$Port/data/ja/$part.json"; $jaEntries += ([regex]::Matches($ja, '\],\[\[')).Count + 1 }
    if ($jaEntries -lt 200000) { throw "Japanese dictionary incomplete ($jaEntries entries)." }
    $ko = Get-Text "http://localhost:$Port/data/ko/dict.json"
    $koEntries = ([regex]::Matches($ko, '\],\["')).Count + 1
    if ($koEntries -lt 80000) { throw "Korean dictionary incomplete ($koEntries entries)." }
    $strokeFiles = @(Get-ChildItem -LiteralPath (Join-Path $App 'app\data\strokes') -Filter '*.json').Count
    if ($strokeFiles -lt 96) { throw "Stroke order data incomplete ($strokeFiles files)." }
    $kuro = @(Get-ChildItem -LiteralPath (Join-Path $App 'app\vendor\kuromoji\dict') -Filter '*.dat.gz').Count
    if ($kuro -lt 12) { throw "Japanese word-splitting dictionary incomplete ($kuro files)." }
    foreach ($rel in @('vendor/hb.wasm', 'fonts/EASC.ttf', 'fonts/EATC.ttf', 'fonts/EAJP.ttf', 'fonts/EAKR.ttf', 'data/tpl/sc.bin', 'data/tpl/kr.bin', 'vendor/kuromoji/dict/base.dat.gz', 'vendor/kuromoji/dict/cc.dat.gz')) {
        $local = (Get-Item -LiteralPath (Join-Path $App ('app\' + $rel.Replace('/', '\')))).Length
        $served = (Get-Url ("http://localhost:$Port/" + $rel) 30000).Length
        if ($local -ne $served) { throw ('Not served correctly: ' + $rel) }
    }
    $bad = $false; try { Get-Url "http://localhost:$Port/..%5Cserver.ps1" | Out-Null; $bad = $true } catch { }
    if ($bad) { throw 'The server allowed access outside the studio folder.' }
    Step "Verified over HTTP: page, engine, $zhEntries Mandarin, $jaEntries Japanese and $koEntries Korean dictionary entries, stroke data, Japanese word splitter, fonts, character templates, text shaper, folder protection"

    if ($script:KeepTask) {
        if (Test-Path -LiteralPath $StartupLnk) { Remove-Item -LiteralPath $StartupLnk -Force }
        Step 'Keeps itself running: the scheduled task started the server, and starts it at sign-in, on unlock and every 5 minutes if it stops'
    } else {
        $ws = New-Object -ComObject WScript.Shell
        $lnk = $ws.CreateShortcut($StartupLnk)
        $lnk.TargetPath = $PsExe
        $lnk.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $App 'server.ps1') + '"'
        $lnk.WindowStyle = 7
        $lnk.Description = 'East Asian Languages Studio server (http://localhost:8770/)'
        $ico = Join-Path $App 'eastasian.ico'; if (Test-Path -LiteralPath $ico) { $lnk.IconLocation = $ico }
        $lnk.Save()
        Step 'Starts automatically when you sign in (Startup shortcut)'
    }

    Write-Result ("OK East Asian Languages Studio $Version installed at http://localhost:$Port/")
    Write-Host ''
    Write-Host "East Asian Languages Studio is installed and running at http://localhost:$Port/" -ForegroundColor Green
    if (-not $NoBrowser) { Start-Process "http://localhost:$Port/" }
    exit 0
}
catch {
    $msg = $_.Exception.Message
    Write-Host ''
    Write-Host ('Install failed: ' + $msg) -ForegroundColor Red
    try {
        Stop-Studio
        if ($Backup -and (Test-Path -LiteralPath $Backup)) {
            if (Test-Path -LiteralPath $App) { Remove-Item -LiteralPath $App -Recurse -Force }
            Move-Item -LiteralPath $Backup -Destination $App
            Start-Studio
            Write-Host 'The previous version has been restored.'
        }
    } catch { Write-Host ('Restore problem: ' + $_.Exception.Message) }
    Write-Result ('FAIL ' + ($msg -replace '[^\x20-\x7E]', '?'))
    exit 1
}
