
$section = $args[0]
$indir = "C:\Users\TATI\Desktop\DEV\app-research\data\section$section"
$outfile = "C:\Users\TATI\Desktop\DEV\app-research\data\section${section}_parsed.txt"
Remove-Item $outfile -ErrorAction SilentlyContinue

Get-ChildItem $indir -Filter "*.txt" | Sort-Object Name | ForEach-Object {
    $html = Get-Content $_.FullName -Raw -Encoding UTF8
    # Flatten to one line for regex
    $flat = $html -replace '\r?\n', ' '
    
    $query = if ($html -match "QUERY: (.+?)\n") { $matches[1].Trim() } else { "Unknown" }
    "===================================================================" | Out-File -FilePath $outfile -Append -Encoding UTF8
    "QUERY: $query" | Out-File -FilePath $outfile -Append -Encoding UTF8
    "===================================================================" | Out-File -FilePath $outfile -Append -Encoding UTF8
    
    # Match title + URL from result-link anchors
    $pattern = "class='result-link'>([^<]+)</a>"
    $titles = [regex]::Matches($flat, $pattern)
    
    # Match snippets
    $pattern2 = "class='result-snippet'>(.+?)</td>"
    $snippets = [regex]::Matches($flat, $pattern2)
    
    # Match link-text domains
    $pattern3 = "class='link-text'>([^<]+)</span>"
    $urls = [regex]::Matches($flat, $pattern3)
    
    $count = 0
    foreach ($t in $titles) {
        $title = ($t.Groups[1].Value -replace '&amp;', '&' -replace '&#x27;', "'" -replace '&quot;', '"').Trim()
        # Skip "more info" etc.
        if ($title -match '^more info|^DuckDuckGo') { continue }
        $count++
        $snippet = if ($count -le $snippets.Count) { ($snippets[$count-1].Groups[1].Value -replace '<[^>]+>', '' -replace '&amp;', '&').Trim() } else { "" }
        $url = if ($count -le $urls.Count) { $urls[$count-1].Groups[1].Value.Trim() } else { "" }
        "  [$count] $title" | Out-File -FilePath $outfile -Append -Encoding UTF8
        "      $url" | Out-File -FilePath $outfile -Append -Encoding UTF8
        "      $snippet" | Out-File -FilePath $outfile -Append -Encoding UTF8
        "" | Out-File -FilePath $outfile -Append -Encoding UTF8
    }
    "" | Out-File -FilePath $outfile -Append -Encoding UTF8
}
Write-Host "Parsed section $section -> $outfile"
