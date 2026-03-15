param(
    [switch]$ResetVolumes
)

$ErrorActionPreference = "Stop"

function Resolve-DockerCli {
    $dockerFromPath = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerFromPath) {
        return $dockerFromPath.Source
    }

    $fallback = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    if (Test-Path $fallback) {
        return $fallback
    }

    throw "Docker CLI not found. Install Docker Desktop and retry."
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env"
$docker = Resolve-DockerCli

$args = @("compose", "--profile", "observability")
if (Test-Path $envFile) {
    $args += @("--env-file", $envFile)
}
$args += @("down", "--remove-orphans")
if ($ResetVolumes) {
    $args += "-v"
}

Push-Location $repoRoot
try {
    & $docker @args
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose down failed."
    }
    Write-Host "Infrastructure stopped."
}
finally {
    Pop-Location
}
