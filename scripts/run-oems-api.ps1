param(
    [switch]$MockAuth
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$profiles = if ($MockAuth) { "local,mock-auth" } else { "local" }
$installSharedArgs = @(
    "-pl", "shared/common,shared/contracts",
    "-am",
    "install",
    "-DskipTests"
)
$runAppArgs = @(
    "-f", "apps/oems-api/pom.xml",
    "spring-boot:run",
    "-Dspring-boot.run.profiles=$profiles"
)

& (Join-Path $repoRoot "mvnw.cmd") @installSharedArgs
if ($LASTEXITCODE -ne 0) {
    throw "Failed to install shared modules before starting oems-api."
}

& (Join-Path $repoRoot "mvnw.cmd") @runAppArgs @args
