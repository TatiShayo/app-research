$section = $args[0]
$queryFile = "C:\Users\TATI\Desktop\DEV\app-research\queries-section$section.txt"
$outDir = "C:\Users\TATI\Desktop\DEV\app-research\data\section$section"

if (!(Test-Path $queryFile)) { Write-Host "Missing: $queryFile"; exit 1 }

$queries = Get-Content $queryFile | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^\s*#' }
$total = $queries.Count
$i = 1

foreach ($q in $queries) {
    $safeFile = "{0:D3}" -f $i
    $metaFile = "$outDir\$safeFile.txt"
    Write-Host "[$i/$total] $q"
    
    try {
        $encoded = [Uri]::EscapeDataString($q)
        $url = "https://lite.duckduckgo.com/lite/?q=$encoded"
        
        $result = & curl.exe -s --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "$url" --connect-timeout 10 --max-time 25 2>$null
        
        # Extract just the search results (not the HTML boilerplate)
        "[$i] QUERY: $q`n" | Out-File -FilePath $metaFile -Encoding UTF8
        $result | Out-File -FilePath $metaFile -Encoding UTF8 -Append
        
    } catch {
        "[$i] QUERY: $q`nERROR: $_`n" | Out-File -FilePath $metaFile -Encoding UTF8
    }
    
    $i++
    Start-Sleep -Milliseconds 1000
}
Write-Host "Section $section complete."
