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

function Load-EnvFile([string]$Path) {
    $map = @{}
    if (-not (Test-Path $Path)) {
        return $map
    }

    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }
        if ($line -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $map[$matches[1]] = $matches[2]
        }
    }

    return $map
}

function Read-Config([hashtable]$Config, [string]$Key, [string]$DefaultValue) {
    if ($Config.ContainsKey($Key) -and $Config[$Key]) {
        return $Config[$Key]
    }
    return $DefaultValue
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env"
$docker = Resolve-DockerCli
$config = Load-EnvFile $envFile

$mysqlUser = Read-Config $config "MYSQL_USER" "oems_user"
$mysqlPassword = Read-Config $config "MYSQL_PASSWORD" "oems_password"
$keycloakPort = Read-Config $config "KEYCLOAK_PORT" "8081"
$prometheusPort = Read-Config $config "PROMETHEUS_PORT" "9090"
$grafanaPort = Read-Config $config "GRAFANA_PORT" "3000"

Push-Location $repoRoot
try {
    & $docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker engine is not reachable. Ensure Docker Desktop is running."
    }

    $runningServices = & $docker compose --env-file $envFile ps --services --status running
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read docker compose service status."
    }

    foreach ($service in @("mysql", "redis", "keycloak")) {
        if ($runningServices -notcontains $service) {
            throw "Required service '$service' is not running."
        }
    }

    & $docker compose --env-file $envFile exec -T -e MYSQL_PWD=$mysqlPassword mysql mysqladmin ping -h localhost -u$mysqlUser --silent 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "MySQL healthcheck failed."
    }

    $redisPing = & $docker compose --env-file $envFile exec -T redis redis-cli ping
    if ($LASTEXITCODE -ne 0 -or ($redisPing -join "`n") -notmatch "PONG") {
        throw "Redis healthcheck failed."
    }

    $keycloakUri = "http://localhost:$keycloakPort/realms/master/.well-known/openid-configuration"
    Invoke-WebRequest -Uri $keycloakUri -UseBasicParsing -TimeoutSec 10 | Out-Null

    if ($WithObservability) {
        foreach ($service in @("prometheus", "grafana")) {
            if ($runningServices -notcontains $service) {
                throw "Optional service '$service' is not running. Start with -WithObservability."
            }
        }

        Invoke-WebRequest -Uri "http://localhost:$prometheusPort/-/ready" -UseBasicParsing -TimeoutSec 10 | Out-Null
        Invoke-WebRequest -Uri "http://localhost:$grafanaPort/api/health" -UseBasicParsing -TimeoutSec 10 | Out-Null
    }

    Write-Host "All requested healthchecks passed."
}
finally {
    Pop-Location
}
