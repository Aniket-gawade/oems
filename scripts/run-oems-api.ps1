$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

& (Join-Path $repoRoot "mvnw.cmd") -pl apps/oems-api -am spring-boot:run -Dspring-boot.run.profiles=local @args
