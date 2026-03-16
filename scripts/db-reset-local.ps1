param(
    [switch]$SkipMigrate
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
$envExample = Join-Path $repoRoot ".env.example"
$docker = Resolve-DockerCli

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path $envExample)) {
        throw "Missing .env.example at $envExample."
    }
    Copy-Item -Path $envExample -Destination $envFile
    Write-Host "Created .env from .env.example"
}

$config = Load-EnvFile $envFile
$mysqlDatabase = Read-Config $config "MYSQL_DATABASE" "oems"
$mysqlUser = Read-Config $config "MYSQL_USER" "oems_user"
$mysqlRootPassword = Read-Config $config "MYSQL_ROOT_PASSWORD" "oems_root_password"

Push-Location $repoRoot
try {
    & $docker compose --env-file $envFile up -d mysql
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start mysql service."
    }

    $ready = $false
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        & $docker compose --env-file $envFile exec -T -e MYSQL_PWD=$mysqlRootPassword mysql mysqladmin ping -h localhost -uroot --silent 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
            break
        }
        Start-Sleep -Seconds 2
    }

    if (-not $ready) {
        throw "MySQL did not become ready in time."
    }

    $sql = @"
DROP DATABASE IF EXISTS $mysqlDatabase;
CREATE DATABASE $mysqlDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON $mysqlDatabase.* TO '$mysqlUser'@'%';
FLUSH PRIVILEGES;
"@

    & $docker compose --env-file $envFile exec -T -e MYSQL_PWD=$mysqlRootPassword mysql mysql -uroot -e $sql
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to reset local database '$mysqlDatabase'."
    }

    if (-not $SkipMigrate) {
        $mvnw = Join-Path $repoRoot "mvnw.cmd"
        $apiPom = Join-Path $repoRoot "apps/oems-api/pom.xml"
        $prepareArgs = @(
            "-pl", "apps/oems-api",
            "-am",
            "-DskipTests",
            "install"
        )
        & $mvnw @prepareArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to prepare local module dependencies for oems-api."
        }

        $startArgs = @(
            "-f", $apiPom,
            "spring-boot:start",
            "-DskipTests",
            "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=local",
            "-Dspring-boot.run.arguments=--server.port=0"
        )
        & $mvnw @startArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to run Flyway migrations through Spring Boot startup."
        }

        $stopArgs = @(
            "-f", $apiPom,
            "spring-boot:stop"
        )
        & $mvnw @stopArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to stop Spring Boot process after migration."
        }
    }

    Write-Host "Local database reset completed for '$mysqlDatabase'."
}
finally {
    Pop-Location
}
