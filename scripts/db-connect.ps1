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
$mysqlPassword = Read-Config $config "MYSQL_PASSWORD" "oems_password"

Push-Location $repoRoot
try {
    & $docker compose --env-file $envFile up -d mysql
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start mysql service."
    }

    & $docker compose --env-file $envFile exec -e MYSQL_PWD=$mysqlPassword mysql mysql -u$mysqlUser -D $mysqlDatabase
}
finally {
    Pop-Location
}
