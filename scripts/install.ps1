# OperatorOS Core installer (Windows PowerShell)
#
# Downloads TWO files from the GitHub release:
#   - operatoros.cmd     (tiny wrapper that invokes node)
#   - operatoros.cmd.js  (the single-file node bundle with shebang)
#
# Installs to $env:USERPROFILE\.local\bin (default) or OPERATOROS_INSTALL_DIR.
#
# Usage:
#   iwr -useb https://.../install.ps1 | iex
#   $env:OPERATOROS_VERSION="v0.8.0"; iwr -useb https://.../install.ps1 | iex
#
# IMPORTANT: do NOT use 'curl ... | sh' from PowerShell — 'curl' is an alias
# for Invoke-WebRequest which does not pipe raw bytes. Use iwr (above).
#
# Environment:
#   $env:OPERATOROS_VERSION     pin to a specific tag (default: v0.8.0)
#   $env:OPERATOROS_INSTALL_DIR override install directory
#                                (default: $env:USERPROFILE\.local\bin)

$ErrorActionPreference = "Stop"

$Repo = "taras-polishchuk/operatoros-framework"
$Version = if ($env:OPERATOROS_VERSION) { $env:OPERATOROS_VERSION } else { "v0.8.4" }
$InstallDir = if ($env:OPERATOROS_INSTALL_DIR) {
    $env:OPERATOROS_INSTALL_DIR
} else {
    Join-Path $env:USERPROFILE ".local\bin"
}
$CmdName = "operatoros.cmd"
$BundleName = "operatoros.cmd.js"

Write-Host ""
Write-Host "OperatorOS installer"
Write-Host "  platform: Windows (PowerShell)"
Write-Host "  version:  $Version"
Write-Host "  target:   $InstallDir"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: node is required (Node.js >= 20)." -ForegroundColor Red -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Install Node.js first:"
    Write-Host "  - winget install OpenJS.NodeJS.LTS"
    Write-Host "  - choco install nodejs-lts"
    Write-Host "  - official: https://nodejs.org/"
    exit 1
}

$nodeVersion = (node -v) -replace '^v(\d+).*', '$1'
if ([int]$nodeVersion -lt 20) {
    Write-Host "ERROR: Node.js >= 20 required (you have $(node -v))." -ErrorAction SilentlyContinue
    Write-Host "Upgrade Node.js: https://nodejs.org/"
    exit 1
}

$cmdUrl = "https://github.com/$Repo/releases/download/$Version/$CmdName"
$bundleUrl = "https://github.com/$Repo/releases/download/$Version/$BundleName"

# Pre-flight: check both URLs resolve before downloading
Write-Host "Downloading $CmdName + $BundleName $Version..."
try {
    $cmdResponse = Invoke-WebRequest -Uri $cmdUrl -Method Head -UseBasicParsing -ErrorAction Stop
    $bundleResponse = Invoke-WebRequest -Uri $bundleUrl -Method Head -UseBasicParsing -ErrorAction Stop
} catch {
    Write-Host ""
    Write-Host "ERROR: download failed." -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Possible causes:"
    Write-Host "  - The version '$Version' does not exist."
    Write-Host "    Available versions: https://github.com/$Repo/releases"
    Write-Host "  - Network/firewall blocked the request."
    Write-Host "  - GitHub is temporarily unavailable."
    Write-Host ""
    Write-Host "Detail: $($_.Exception.Message)"
    exit 1
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

try {
    Invoke-WebRequest -Uri $cmdUrl -OutFile "$InstallDir\$CmdName" -UseBasicParsing
    Invoke-WebRequest -Uri $bundleUrl -OutFile "$InstallDir\$BundleName" -UseBasicParsing
} catch {
    Write-Host ""
    Write-Host "ERROR: download failed." -ErrorAction SilentlyContinue
    Write-Host "Detail: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "OK installed $CmdName $Version"
& "$InstallDir\$CmdName" version

# PATH check
$pathHasDir = ($env:PATH -split ';') -contains $InstallDir
if (-not $pathHasDir) {
    Write-Host ""
    Write-Host "Next: add $InstallDir to your PATH for future sessions."
    Write-Host ""
    Write-Host "  [Environment]::SetEnvironmentVariable('PATH', '$InstallDir;' + `$env:PATH, 'User')"
    Write-Host ""
    Write-Host "Then open a new PowerShell and run: operatoros init --target my-os"
} else {
    Write-Host ""
    Write-Host "Try it: operatoros init --target my-os"
}
