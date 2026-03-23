param(
    [switch]$StartApi,
    [string]$ApiBaseUrl = "http://localhost:8080",
    [string]$KeycloakBaseUrl = "http://localhost:8081",
    [string]$Realm = "oems",
    [string]$ClientId = "oems-api",
    [string]$TraderUsername = "trader1",
    [string]$TraderPassword = "trader1pass",
    [string]$OpsUsername = "ops1",
    [string]$OpsPassword = "ops1pass"
)

$ErrorActionPreference = "Stop"

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

function Invoke-HttpRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Uri,
        [hashtable]$Headers,
        [string]$Body,
        [string]$ContentType
    )

    $request = @{
        Method = $Method
        Uri = $Uri
        UseBasicParsing = $true
        ErrorAction = "Stop"
    }
    if ($Headers) {
        $request["Headers"] = $Headers
    }
    if ($PSBoundParameters.ContainsKey("Body")) {
        $request["Body"] = $Body
    }
    if ($ContentType) {
        $request["ContentType"] = $ContentType
    }

    try {
        $response = Invoke-WebRequest @request
        return @{
            StatusCode = [int]$response.StatusCode
            Body = $response.Content
        }
    }
    catch {
        $webResponse = $_.Exception.Response
        if (-not $webResponse) {
            throw
        }

        $stream = $webResponse.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()

        return @{
            StatusCode = [int]$webResponse.StatusCode
            Body = $responseBody
        }
    }
}

function Assert-Status {
    param(
        [hashtable]$Response,
        [int]$ExpectedStatus,
        [string]$Context
    )

    if ($Response.StatusCode -ne $ExpectedStatus) {
        throw "$Context expected HTTP $ExpectedStatus but got $($Response.StatusCode). Body: $($Response.Body)"
    }
}

function Get-AccessToken {
    param(
        [string]$Username,
        [string]$Password
    )

    $tokenEndpoint = "$KeycloakBaseUrl/realms/$Realm/protocol/openid-connect/token"
    $response = Invoke-RestMethod `
        -Method Post `
        -Uri $tokenEndpoint `
        -UseBasicParsing `
        -ContentType "application/x-www-form-urlencoded" `
        -Body @{
            grant_type = "password"
            client_id = $ClientId
            username = $Username
            password = $Password
        }

    if (-not $response.access_token) {
        throw "No access token returned for user '$Username'."
    }

    return [string]$response.access_token
}

function ConvertFrom-Base64Url {
    param([string]$Base64Url)

    $base64 = $Base64Url.Replace('-', '+').Replace('_', '/')
    switch ($base64.Length % 4) {
        0 { }
        2 { $base64 += "==" }
        3 { $base64 += "=" }
        default { throw "Invalid base64url payload." }
    }

    $bytes = [Convert]::FromBase64String($base64)
    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

function Get-JwtPayload {
    param([string]$Token)

    $parts = $Token.Split(".")
    if ($parts.Length -lt 2) {
        throw "Malformed JWT token."
    }

    $payloadJson = ConvertFrom-Base64Url $parts[1]
    return $payloadJson | ConvertFrom-Json
}

function Assert-RealmRole {
    param(
        [string]$Token,
        [string]$ExpectedRole,
        [string]$Username
    )

    $payload = Get-JwtPayload $Token
    $roles = @()
    if ($payload.realm_access -and $payload.realm_access.roles) {
        $roles = @($payload.realm_access.roles)
    }

    if ($roles -notcontains $ExpectedRole) {
        throw "Token for '$Username' does not include required role '$ExpectedRole'. Roles: $($roles -join ',')"
    }
}

function Wait-ApiReady {
    param(
        [string]$BaseUrl,
        [int]$TimeoutSeconds = 300
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $health = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -UseBasicParsing -TimeoutSec 5
            if ([int]$health.StatusCode -eq 200) {
                return
            }
        }
        catch {
        }
        Start-Sleep -Seconds 2
    }

    throw "oems-api did not become ready at $BaseUrl within $TimeoutSeconds seconds."
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId"
    foreach ($child in $children) {
        Stop-ProcessTree -ProcessId $child.ProcessId
    }

    Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env"
$config = Load-EnvFile $envFile

if (-not $PSBoundParameters.ContainsKey("KeycloakBaseUrl")) {
    $keycloakPort = Read-Config $config "KEYCLOAK_PORT" "8081"
    $KeycloakBaseUrl = "http://localhost:$keycloakPort"
}
if (-not $PSBoundParameters.ContainsKey("Realm")) {
    $Realm = Read-Config $config "KEYCLOAK_REALM" "oems"
}
if (-not $PSBoundParameters.ContainsKey("ClientId")) {
    $ClientId = Read-Config $config "KEYCLOAK_CLIENT_ID" "oems-api"
}
if (-not $PSBoundParameters.ContainsKey("TraderUsername")) {
    $TraderUsername = Read-Config $config "KEYCLOAK_TRADER_USERNAME" "trader1"
}
if (-not $PSBoundParameters.ContainsKey("TraderPassword")) {
    $TraderPassword = Read-Config $config "KEYCLOAK_TRADER_PASSWORD" "trader1pass"
}
if (-not $PSBoundParameters.ContainsKey("OpsUsername")) {
    $OpsUsername = Read-Config $config "KEYCLOAK_OPS_USERNAME" "ops1"
}
if (-not $PSBoundParameters.ContainsKey("OpsPassword")) {
    $OpsPassword = Read-Config $config "KEYCLOAK_OPS_PASSWORD" "ops1pass"
}

$smokeFailure = $null

if ($StartApi) {
    $tmpDir = Join-Path $repoRoot ".tmp"
    New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
    $apiOutLog = Join-Path $tmpDir "security-smoke-api.out.log"
    $apiErrLog = Join-Path $tmpDir "security-smoke-api.err.log"
    if (Test-Path $apiOutLog) { Remove-Item $apiOutLog -Force }
    if (Test-Path $apiErrLog) { Remove-Item $apiErrLog -Force }

    $runApiScript = Join-Path $repoRoot "scripts\\run-oems-api.ps1"
    $apiProcess = Start-Process `
        -FilePath "powershell" `
        -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$runApiScript`"" `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $apiOutLog `
        -RedirectStandardError $apiErrLog `
        -PassThru
    try {
        Wait-ApiReady -BaseUrl $ApiBaseUrl
    }
    catch {
        $smokeFailure = $_
        throw
    }
}

try {
    $traderToken = Get-AccessToken -Username $TraderUsername -Password $TraderPassword
    $opsToken = Get-AccessToken -Username $OpsUsername -Password $OpsPassword

    Assert-RealmRole -Token $traderToken -ExpectedRole "TRADER" -Username $TraderUsername
    Assert-RealmRole -Token $opsToken -ExpectedRole "OPS" -Username $OpsUsername

    $unauthorizedOrder = Invoke-HttpRequest -Method "POST" -Uri "$ApiBaseUrl/v1/orders" -Body "{}" -ContentType "application/json"
    Assert-Status -Response $unauthorizedOrder -ExpectedStatus 401 -Context "Unauthorized order placement"
    if ($unauthorizedOrder.Body) {
        $unauthorizedBody = $unauthorizedOrder.Body | ConvertFrom-Json
        if ($unauthorizedBody.code -ne "UNAUTHORIZED") {
            throw "Unauthorized response body does not include code=UNAUTHORIZED. Body: $($unauthorizedOrder.Body)"
        }
    }

    $opsOrder = Invoke-HttpRequest `
        -Method "POST" `
        -Uri "$ApiBaseUrl/v1/orders" `
        -Headers @{ Authorization = "Bearer $opsToken" } `
        -Body "{}" `
        -ContentType "application/json"
    Assert-Status -Response $opsOrder -ExpectedStatus 403 -Context "OPS order placement"
    if ($opsOrder.Body) {
        $opsBody = $opsOrder.Body | ConvertFrom-Json
        if ($opsBody.code -ne "FORBIDDEN") {
            throw "Forbidden response body does not include code=FORBIDDEN. Body: $($opsOrder.Body)"
        }
    }

    $traderOrder = Invoke-HttpRequest `
        -Method "POST" `
        -Uri "$ApiBaseUrl/v1/orders" `
        -Headers @{ Authorization = "Bearer $traderToken" } `
        -Body '{"clientOrderId":"smoke-1001","symbol":"AAPL","side":"BUY","orderType":"MARKET","quantity":10}' `
        -ContentType "application/json"
    Assert-Status -Response $traderOrder -ExpectedStatus 201 -Context "TRADER order placement"

$actuatorWithoutOps = Invoke-HttpRequest -Method "GET" -Uri "$ApiBaseUrl/actuator"
Assert-Status -Response $actuatorWithoutOps -ExpectedStatus 401 -Context "Actuator access without token"

$actuatorWithOps = Invoke-HttpRequest `
    -Method "GET" `
    -Uri "$ApiBaseUrl/actuator" `
    -Headers @{ Authorization = "Bearer $opsToken" }
Assert-Status -Response $actuatorWithOps -ExpectedStatus 200 -Context "Actuator access with OPS token"

    Write-Host "Security smoke test passed: realm/users/roles/token claims and protected endpoint outcomes are correct."
}
catch {
    $smokeFailure = $_
    throw
}
finally {
    if ($smokeFailure -and $StartApi) {
        if (Test-Path $apiErrLog) {
            Write-Host "----- oems-api stderr (tail) -----"
            Get-Content $apiErrLog -Tail 80 | Write-Host
        }
        if (Test-Path $apiOutLog) {
            Write-Host "----- oems-api stdout (tail) -----"
            Get-Content $apiOutLog -Tail 120 | Write-Host
        }
    }

    if ($StartApi -and $apiProcess -and -not $apiProcess.HasExited) {
        Stop-ProcessTree -ProcessId $apiProcess.Id
    }
}
