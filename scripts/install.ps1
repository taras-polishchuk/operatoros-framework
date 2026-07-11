# OperatorOS Core installer (Windows PowerShell)
$ErrorActionPreference = "Stop"

$Repo = "taras-polishchuk/operatoros-framework"
# Default to the most recent published release with binary assets
# attached (v0.5.1-alpha.2). v0.5.2-alpha source is on `main`; its
# binary release is a separate follow-up. Override explicitly when ready.
$Version = if ($env:OPERATOROS_VERSION) { $env:OPERATOROS_VERSION } else { "v0.5.1-alpha.2" }
$InstallDir = if ($env:OPERATOROS_INSTALL_DIR) { $env:OPERATOROS_INSTALL_DIR } else { "$HOME\.local\bin" }
$BinName = "operatoros.cmd"
$BundleName = "operatoros.cmd.js"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "node is required (Node.js >= 20). Install Node.js first: https://nodejs.org/"
    exit 1
}

Write-Host "  -> installing $BinName + $BundleName $Version -> $InstallDir\"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Invoke-WebRequest -Uri "https://github.com/$Repo/releases/download/$Version/$BinName" -OutFile "$InstallDir\$BinName" -UseBasicParsing
Invoke-WebRequest -Uri "https://github.com/$Repo/releases/download/$Version/$BundleName" -OutFile "$InstallDir\$BundleName" -UseBasicParsing
Write-Host ""
Write-Host "OK installed $BinName $Version"
& "$InstallDir\$BinName" version