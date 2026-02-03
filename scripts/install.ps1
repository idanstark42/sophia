# ========================================
# Sophia AI Assistant Server Installer
# ========================================

set-StrictMode -Version Latest
Write-Host "=== Starting Sophia Installer ==="

# ---------------- Python ----------------
$pythonInstalled = $false
try {
    $pythonVersion = & python --version 2>$null
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        if ($major -gt 3 -or ($major -eq 3 -and $minor -ge 11)) {
            $pythonInstalled = $true
        }
    }
} catch {}

if (-not $pythonInstalled) {
    Write-Host "Python 3.11+ not found. Installing..."
    $pythonUrl = "https://www.python.org/ftp/python/3.11.8/python-3.11.8-amd64.exe"
    $pythonInstaller = "$env:TEMP\python-3.11.8-amd64.exe"
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller
    Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_test=0" -Wait
    Remove-Item $pythonInstaller
} else {
    Write-Host "Python 3.11+ already installed: $pythonVersion"
}

# ---------------- Poetry ----------------
$poetryInstalled = $false
try {
    $poetryVersion = & poetry --version 2>$null
    if ($poetryVersion) { $poetryInstalled = $true }
} catch {}

if (-not $poetryInstalled) {
    Write-Host "Poetry not found. Installing..."
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://install.python-poetry.org'))
    $env:PATH += ";$env:USERPROFILE\.local\bin"
} else {
    Write-Host "Poetry already installed: $poetryVersion"
}

Write-Host "Poetry version: $(poetry --version)"

# ---------------- Python dependencies ----------------
Write-Host "Installing Python dependencies via Poetry..."
poetry install

# ---------------- MongoDB ----------------
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

# Configurable paths
$mongoInstallDir = "C:\Program Files\MongoDB\Server\7.0"
$mongoDataDir    = "C:\data\db"
$mongoLogDir     = "C:\data\log"
$mongoLogFile    = Join-Path $mongoLogDir "mongod.log"
$mongoUrl        = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.1-signed.msi"
$mongoMsi        = "$env:TEMP\mongodb.msi"

if (-not $mongoService) {
    Write-Host "MongoDB not found. Installing..."

    # Clean previous temp file
    if (Test-Path $mongoMsi) { Remove-Item $mongoMsi -Force }

    # Download MSI reliably
    Write-Host "Downloading MongoDB MSI..."
    Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoMsi -UseBasicParsing

    # Install MongoDB silently
    Write-Host "Installing MongoDB..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$mongoMsi`" INSTALLLOCATION=`"$mongoInstallDir`" ADDLOCAL=All /quiet"
    Remove-Item $mongoMsi

    # Ensure data/log dirs exist
    New-Item -ItemType Directory -Path $mongoDataDir -Force
    New-Item -ItemType Directory -Path $mongoLogDir -Force

    # Install service with explicit name
    $mongoBin = Join-Path $mongoInstallDir "bin\mongod.exe"
    if (Test-Path $mongoBin) {
        & $mongoBin --install --serviceName "MongoDB" --dbpath $mongoDataDir --logpath $mongoLogFile --logappend
        Start-Service -Name "MongoDB"
        Write-Host "MongoDB installed and service started."
    } else {
        Write-Host "ERROR: MongoDB binary not found at $mongoBin. Installation may have failed."
    }
} else {
    Write-Host "MongoDB service already exists. Status: $($mongoService.Status)"
}

# Show final service status
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) { Write-Host "MongoDB service status: $($mongoService.Status)" }

# ---------------- Seed.py ----------------
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$seedPath = Join-Path $scriptDir "seed.py"

if (Test-Path $seedPath) {
    Write-Host "Running seed.py inside Poetry environment..."
    poetry run python $seedPath
} else {
    Write-Host "seed.py not found. Skipping..."
}

# ---------------- Secrets ----------------
$envPath = Join-Path $scriptDir "config"
if (-not (Test-Path $envPath)) { New-Item -ItemType Directory -Path $envPath }

$secretsFile = Join-Path $envPath "secrets.env"
if (-not (Test-Path $secretsFile)) {
    $apiKey = -join ((1..64) | ForEach-Object { 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+'[(Get-Random -Minimum 0 -Maximum 74)] })
    @"
# Auto-generated secrets
ADMIN_API_KEY=$apiKey
"@ | Out-File -Encoding UTF8 $secretsFile
    Write-Host "Generated new ADMIN_API_KEY and saved to $secretsFile"
} else {
    Write-Host "secrets.env already exists. Skipping API key generation."
}

Write-Host "=== Installation complete! ==="
Write-Host "Activate Poetry environment: 'poetry shell'"
Write-Host "Run server: 'poetry run uvicorn main:app --reload'"
