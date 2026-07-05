$phase = $args[0]
$queryFile = "C:\Users\TATI\Desktop\DEV\app-research\queries-${phase}.txt"
$outDir = "C:\Users\TATI\Desktop\DEV\app-research\data\${phase}"

if (!(Test-Path $queryFile)) { Write-Host "Missing: $queryFile"; exit 1 }

$queries = Get-Content $queryFile | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^\s*#' }
$total = $queries.Count
$i = 1

foreach ($q in $queries) {
    $encoded = [Uri]::EscapeDataString($q)
    $url = "https://lite.duckduckgo.com/lite/?q=$encoded"
    $outFile = "$outDir\$($i.ToString('000')).txt"
    
    $short = $q
    if ($short.Length -gt 60) { $short = $short.Substring(0, 60) }
    Write-Host "[$phase $i/$total] $short..."
    
    try {
        $ua = "Mozilla/5.0"
        $result = & curl.exe -s --user-agent $ua $url --connect-timeout 8 --max-time 20 2>$null
        "[$i] QUERY: $q`n`n$result" | Out-File -FilePath $outFile -Encoding UTF8
    } catch {
        "[$i] QUERY: $q`nERROR: $_`n" | Out-File -FilePath $outFile -Encoding UTF8
    }
    $i++
    Start-Sleep -Milliseconds 1200
}
Write-Host "Phase $phase complete."
