param(
    [int]$Port = 5173,
    [string]$ApiProxyTarget = "http://localhost:8080",
    [switch]$Install
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$webAppPath = Join-Path $repoRoot "apps/oems-web"
$nodeModulesPath = Join-Path $webAppPath "node_modules"

if ($Install -or -not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing frontend dependencies with npm ci..."
    Push-Location $webAppPath
    try {
        npm ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed for oems-web."
        }
    }
    finally {
        Pop-Location
    }
}

$env:WEB_PORT = "$Port"
$env:VITE_PROXY_TARGET = $ApiProxyTarget

Push-Location $webAppPath
try {
    npm run dev -- --host 0.0.0.0 --port $Port @args
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start oems-web dev server."
    }
}
finally {
    Pop-Location
}

