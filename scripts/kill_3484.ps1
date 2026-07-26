Stop-Process -Id 3484 -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, StartTime | Format-Table -AutoSize
