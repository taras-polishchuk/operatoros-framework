# OperatorOS Core installer (Windows PowerShell)
$ErrorActionPreference = "Stop"

$Repo = "taras-polishchuk/operatoros-framework"
$Version = if ($env:OPERATOROS_VERSION) { $env:OPERATOROS_VERSION } else { "v0.3.0-alpha" }
$InstallDir = if ($env:OPERATOROS_INSTALL_DIR) { $env:OPERATOROS_INSTALL_DIR } else { "$HOME\.local\bin" }
$BinName = "operatoros.cmd"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "node is required (Node.js >= 20). Install Node.js first: https://nodejs.org/"
    exit 1
}

Write-Host "  -> installing $BinName $Version -> $InstallDir\$BinName"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$Url = "https://github.com/$Repo/releases/download/$Version/operatoros.cmd"
Invoke-WebRequest -Uri $Url -OutFile "$InstallDir\$BinName" -UseBasicParsing
Write-Host ""
Write-Host "OK installed $BinName $Version"
& "$InstallDir\$BinName" version