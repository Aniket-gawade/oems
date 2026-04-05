param(
    [string]$HostName = "127.0.0.1",
    [int]$Port = 5173,
    [int]$TimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"
$start = Get-Date
$healthUrl = "http://$HostName`:$Port/"

while ((Get-Date) -lt $start.AddSeconds($TimeoutSeconds)) {
    try {
        $statusCode = curl.exe --silent --output NUL --write-out "%{http_code}" $healthUrl
        $statusCodeInt = [int]$statusCode
        if ($statusCodeInt -ge 200 -and $statusCodeInt -lt 400) {
            Write-Host "Frontend healthcheck passed: $healthUrl ($statusCodeInt)"
            exit 0
        }
    }
    catch {
        Start-Sleep -Seconds 2
        continue
    }
}

throw "Frontend healthcheck failed after $TimeoutSeconds seconds for $healthUrl."
