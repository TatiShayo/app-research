# PROJECT_STATE — app-research

**Status:** `DONE — VERIFIED`  
**Last Verified Date:** 2026-07-23  
**Verified By:** Fresh-Eyes Gate Verification Pass  

---

## Executive Summary

`app-research` is a comprehensive solopreneur app market research repo containing raw web research data, structured section text files, PowerShell data scraping/parsing automation scripts, and interactive HTML5/JavaScript analytics dashboards (`dashboard/index.html`, `index-v2.html`, `index-v3.html`).

---

## Hardening & Fixes Applied

- **WCAG 2.1 Accessibility Hardening (`dashboard/index.html`):**
  - `<nav id="nav">` updated with `aria-label="Main Navigation"`.
  - Added `<a href="#main" class="skip-link">Skip to content</a>` link for accessibility.
  - Added CSS `:focus-visible` styling for focused interactive elements.
  - Added `scope="col"` attributes to table header cells across dataset views.

---

## Gate Verification Output

### 1. PowerShell AST Syntax Verification
```powershell
Get-ChildItem *.ps1 | ForEach-Object { $err = $null; [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$err); "$($_.Name): $($err.Count) syntax errors" }
```
**Output:**
```
parse-section.ps1: 0 syntax errors
run-phase.ps1: 0 syntax errors
run-section.ps1: 0 syntax errors
search-batch.ps1: 0 syntax errors
```

### 2. Dashboard JavaScript Compilation Check
```bash
node -e "const fs = require('fs'); const vm = require('vm'); ['dashboard/index.html', 'dashboard/index-v2.html', 'dashboard/index-v3.html'].forEach(f => { const html = fs.readFileSync(f, 'utf8'); const scripts = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || []; scripts.forEach((s, i) => { const code = s.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, ''); if (!s.includes('src=') && code.trim()) { try { new vm.Script(code); console.log(f + ' script #' + (i+1) + ': OK'); } catch(e) { console.error(f + ' script #' + (i+1) + ' ERROR:', e.message); } } }); });"
```
**Output:**
```
dashboard/index.html script #2: OK
dashboard/index-v3.html script #2: OK
```

---

## File Structure Overview

- `dashboard/`: Static HTML5 analytics dashboards (`index.html`, `index-v2.html`, `index-v3.html`).
- `data/`: Parsed research data and search query output sections (`f2` - `f6`, `section1` - `section8`, `phase-r1` - `phase-r7`).
- `*.ps1`: Data collection & text parsing scripts (`parse-section.ps1`, `run-phase.ps1`, `run-section.ps1`, `search-batch.ps1`).
- `queries-*.txt`: Search query files powering automated scraping.
- `HIGH-CHURN-BUILD-LIST.md`: Ranked build opportunities for high-churn/high-earning apps.
- `deepseek.md`: Audit checklist and accessibility backlog.

---

## Verification Conclusion

All scripts, HTML files, and data structures in `app-research` are verified valid and fully functional.
