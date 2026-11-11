; East Asian Languages Studio - Windows setup (per-user, no administrator rights)
Unicode true
SetCompressor /SOLID lzma
!include "MUI2.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"
!define APPNAME "East Asian Languages Studio"
!define VERSION "1.0.3"
!define PUBLISHER "Larry Dalton"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\EastAsianLanguagesStudio"
Name "${APPNAME}"
OutFile "EastAsianLanguagesStudio-Setup.exe"
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\EastAsianLanguagesStudio-Setup"
BrandingText "East Asian Languages Studio - by Larry Dalton"
VIProductVersion "1.0.3.0"
VIAddVersionKey "ProductName" "${APPNAME}"
VIAddVersionKey "CompanyName" "${PUBLISHER}"
VIAddVersionKey "FileDescription" "East Asian Languages Studio setup"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "ProductVersion" "${VERSION}"
VIAddVersionKey "LegalCopyright" "East Asian Languages Studio by Larry Dalton"
!define MUI_ICON "eastasian.ico"
!define MUI_UNICON "eastasian.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "East Asian Languages Studio ${VERSION}"
!define MUI_WELCOMEPAGE_TEXT "Mandarin, Japanese and Korean: write, read and study - by Larry Dalton.$\r$\n$\r$\nThis will:$\r$\n  - install East Asian Languages Studio for your Windows account (no administrator rights needed)$\r$\n  - start it at sign-in and open it at http://localhost:8770/$\r$\n  - place the East Asian Languages Studio infographic on your Desktop$\r$\n$\r$\nA PowerShell window shows the install checks. If any check fails, your previous version is restored automatically."
!define MUI_FINISHPAGE_TITLE "East Asian Languages Studio is installed"
!define MUI_FINISHPAGE_TEXT "East Asian Languages Studio is running at http://localhost:8770/ and starts automatically when you sign in.$\r$\n$\r$\nThe infographic is on your Desktop:$\r$\n  East Asian Languages Studio - How It Works.png"
!define MUI_FINISHPAGE_LINK "Open East Asian Languages Studio"
!define MUI_FINISHPAGE_LINK_LOCATION "http://localhost:8770/"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
Var PS
Var RES
Function .onInit
  SetShellVarContext current
FunctionEnd
Function un.onInit
  SetShellVarContext current
FunctionEnd
Section "Install"
  SetShellVarContext current
  ${If} ${RunningX64}
    ${DisableX64FSRedirection}
  ${EndIf}
  StrCpy $PS "$WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
  IfFileExists "$PS" +3 0
    MessageBox MB_ICONSTOP "Windows PowerShell was not found ($PS). East Asian Languages Studio needs Windows PowerShell 5.1."
    Abort "Windows PowerShell not found."
  SetOutPath "$INSTDIR"
  File "Install.ps1"
  File "Uninstall.ps1"
  File "eastasian.ico"
  RMDir /r "$INSTDIR\payload"
  SetOutPath "$INSTDIR\payload"
  File /r "payload\*"
  DetailPrint "Placing the infographic on your Desktop..."
  SetOutPath "$DESKTOP"
  File "East Asian Languages Studio - How It Works.png"
  SetOutPath "$INSTDIR"
  DetailPrint "Installing and verifying East Asian Languages Studio (see the PowerShell window)..."
  Delete "$TEMP\EastAsianLanguagesStudio-install-result.txt"
  ExecWait '"$PS" -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\Install.ps1" -Source "$INSTDIR\payload"'
  StrCpy $RES ""
  ClearErrors
  FileOpen $0 "$TEMP\EastAsianLanguagesStudio-install-result.txt" r
  ${IfNot} ${Errors}
    FileRead $0 $RES
    FileClose $0
  ${EndIf}
  StrCpy $1 $RES 2
  ${If} $1 != "OK"
    ${If} $RES == ""
      StrCpy $RES "The PowerShell install did not report a result."
    ${EndIf}
    DetailPrint "Install failed: $RES"
    MessageBox MB_ICONSTOP "East Asian Languages Studio was not installed.$\r$\n$\r$\n$RES$\r$\n$\r$\nYour previous version (if any) has been restored."
    Abort "East Asian Languages Studio was not installed."
  ${EndIf}
  RMDir /r "$INSTDIR\payload"
  DetailPrint "Install verified."
  WriteINIStr "$SMPROGRAMS\East Asian Languages Studio.url" "InternetShortcut" "URL" "http://localhost:8770/"
  WriteINIStr "$SMPROGRAMS\East Asian Languages Studio.url" "InternetShortcut" "IconFile" "$INSTDIR\eastasian.ico"
  WriteINIStr "$SMPROGRAMS\East Asian Languages Studio.url" "InternetShortcut" "IconIndex" "0"
  WriteINIStr "$DESKTOP\East Asian Languages Studio.url" "InternetShortcut" "URL" "http://localhost:8770/"
  WriteINIStr "$DESKTOP\East Asian Languages Studio.url" "InternetShortcut" "IconFile" "$INSTDIR\eastasian.ico"
  WriteINIStr "$DESKTOP\East Asian Languages Studio.url" "InternetShortcut" "IconIndex" "0"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayIcon" "$INSTDIR\eastasian.ico"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$LOCALAPPDATA\EastAsianLanguagesStudio"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "${UNINSTKEY}" "URLInfoAbout" "http://localhost:8770/"
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
SectionEnd
Section "Uninstall"
  SetShellVarContext current
  ${If} ${RunningX64}
    ${DisableX64FSRedirection}
  ${EndIf}
  ExecWait '"$WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\Uninstall.ps1"'
  Delete "$SMPROGRAMS\East Asian Languages Studio.url"
  Delete "$DESKTOP\East Asian Languages Studio.url"
  DeleteRegKey HKCU "${UNINSTKEY}"
  Delete "$INSTDIR\Install.ps1"
  Delete "$INSTDIR\Uninstall.ps1"
  Delete "$INSTDIR\eastasian.ico"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  MessageBox MB_ICONINFORMATION "East Asian Languages Studio has been removed.$\r$\nThe infographic on your Desktop and earlier backups (EastAsianLanguagesStudio-backup-*) were left in place."
SectionEnd
