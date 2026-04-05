param(
    [switch]$Down,
    [switch]$NoBuild
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$composeFile = Join-Path $repoRoot "ops/staging/docker-compose.staging.yml"
$envFile = Join-Path $repoRoot "ops/staging/.env.staging"

if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Copy ops/staging/.env.staging.example to ops/staging/.env.staging and fill values."
}

$composeArgs = @("-f", $composeFile, "--env-file", $envFile)

if ($Down) {
    docker compose @composeArgs down --remove-orphans
    exit $LASTEXITCODE
}

Write-Host "Starting staging dependencies (MySQL, Redis, Keycloak)..."
docker compose @composeArgs up -d mysql redis keycloak
if ($LASTEXITCODE -ne 0) {
    throw "Failed to start dependency services."
}

Write-Host "Running Flyway migrations..."
docker compose @composeArgs run --rm oems-migrate
if ($LASTEXITCODE -ne 0) {
    throw "Migration step failed."
}

$apiUpArgs = @("up", "-d")
if (-not $NoBuild) {
    $apiUpArgs += "--build"
}
$apiUpArgs += "oems-api"

Write-Host "Deploying oems-api..."
docker compose @composeArgs @apiUpArgs
if ($LASTEXITCODE -ne 0) {
    throw "Failed to deploy oems-api."
}

Write-Host "Staging deployment status:"
docker compose @composeArgs ps
