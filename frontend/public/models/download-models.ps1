# PowerShell script to download face-api.js models
# Run this script from the frontend/public/models directory

# Using the main face-api.js repository (weights folder)
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

$files = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1"
)

Write-Host "📥 Downloading face-api.js models..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $output = Join-Path $PSScriptRoot $file
    
    if (Test-Path $output) {
        Write-Host "⏭️  Skipping $file (already exists)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "⬇️  Downloading $file..." -NoNewline
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host " ✅" -ForegroundColor Green
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Download complete!" -ForegroundColor Green
Write-Host "📁 Models saved to: $PSScriptRoot" -ForegroundColor Cyan
