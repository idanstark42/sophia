# install.ps1
# Run as Administrator

set-StrictMode -Version Latest
Write-Host "=== Starting Assistant Server Installer ==="

# ----------- Python 3.11+ ----------
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

# ----------- Poetry ----------
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

# ----------- Install Python dependencies ----------
Write-Host "Installing Python dependencies via Poetry..."
poetry install

# ----------- MongoDB ----------
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if (-not $mongoService) {
    Write-Host "MongoDB not found. Installing..."

    $mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.1-signed.msi"
    $mongoMsi = "$env:TEMP\mongodb.msi"
    Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoMsi

    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$mongoMsi`" INSTALLLOCATION=`"C:\Program Files\MongoDB\Server\7.0`" ADDLOCAL=All /quiet"
    Remove-Item $mongoMsi

    # Ensure data and log directories exist
    New-Item -ItemType Directory -Path "C:\data\db" -Force
    New-Item -ItemType Directory -Path "C:\data\log" -Force

    # Install MongoDB as Windows service
    $mongoBin = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
    & $mongoBin --install --dbpath "C:\data\db" --logpath "C:\data\log\mongod.log" --logappend
    Start-Service MongoDB
} else {
    Write-Host "MongoDB service already exists. Status: $($mongoService.Status)"
}

Write-Host "MongoDB service status: $(Get-Service MongoDB).Status"

# ----------- Run python.seed ----------
if (Test-Path "python.seed") {
    Write-Host "Running python.seed..."
    & python seed.py
} else {
    Write-Host "python.seed not found. Skipping..."
}

Write-Host "=== Installation complete! ==="
Write-Host "Activate Poetry environment: 'poetry shell'"
Write-Host "Run server: 'poetry run uvicorn main:app --reload'"