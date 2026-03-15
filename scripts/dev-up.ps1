param(
    [switch]$WithObservability
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
$envExample = Join-Path $repoRoot ".env.example"
$docker = Resolve-DockerCli

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path $envExample)) {
        throw "Missing .env.example at $envExample."
    }
    Copy-Item -Path $envExample -Destination $envFile
    Write-Host "Created .env from .env.example"
}

$args = @("compose")
if ($WithObservability) {
    $args += @("--profile", "observability")
}
$args += @("--env-file", $envFile, "up", "-d")

Push-Location $repoRoot
try {
    & $docker @args
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose up failed."
    }
    Write-Host "Infrastructure started."
}
finally {
    Pop-Location
}
