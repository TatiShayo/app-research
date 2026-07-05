
param([string]$QueryFile, [string]$OutputDir)

$queries = Get-Content $QueryFile | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^\s*#' }
$count = 1
$total = $queries.Count

foreach ($q in $queries) {
    $safe = $q -replace '[^\w\s-]', '' -replace '\s+', '_'
    $safeFile = "${count:D3}_$safe"
    Write-Host "[$count/$total] Searching: $q"
    
    try {
        $encoded = [System.Web.HttpUtility]::UrlEncode($q)
        $url = "https://lite.duckduckgo.com/lite/?q=$encoded"
        curl -s --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "$url" -o "$OutputDir\$safeFile.html" --connect-timeout 10 --max-time 25 2>$null
        Start-Sleep -Milliseconds 800
    } catch {
        Write-Host "  FAILED: $_"
    }
    $count++
}
Write-Host "Done. Results in: $OutputDir"
