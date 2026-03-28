$ErrorActionPreference = 'Stop'

Write-Host '--- Smoke: OpenAI Vision ---'
$bytes = [System.IO.File]::ReadAllBytes('src/assets/hero.png')
$dataUrl = 'data:image/png;base64,' + [Convert]::ToBase64String($bytes)
$openaiBody = @{ imageDataUrl = $dataUrl; prompt = 'Return ONLY JSON with keys: place, confidence, reason. place must be one of OFFICE, HOME, CAFE, CLASSROOM, STREET, MOUNTAIN, RIVER, FOREST, BEACH, OTHER.' } | ConvertTo-Json -Compress
$openaiResp = Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://127.0.0.1:5174/api/openai/vision' -ContentType 'application/json' -Body $openaiBody
Write-Host ('status=' + $openaiResp.StatusCode + ' content-type=' + $openaiResp.Headers['Content-Type'])
$openaiText = $openaiResp.Content
if ($openaiText.Length -gt 600) { $openaiText = $openaiText.Substring(0, 600) }
Write-Host $openaiText

Write-Host '--- Smoke: ElevenLabs Music ---'
$musicBody = @{ prompt = 'A pleasant instrumental lo-fi track, around 110 BPM, for studying in an office. No copyrighted references.'; musicLengthMs = 5000; outputFormat = 'mp3_44100_128' } | ConvertTo-Json -Compress
$musicResp = Invoke-WebRequest -UseBasicParsing -Method Post -Uri 'http://127.0.0.1:5174/api/elevenlabs/music' -ContentType 'application/json' -Body $musicBody
Write-Host ('status=' + $musicResp.StatusCode + ' content-type=' + $musicResp.Headers['Content-Type'] + ' bytes=' + $musicResp.RawContentLength)
