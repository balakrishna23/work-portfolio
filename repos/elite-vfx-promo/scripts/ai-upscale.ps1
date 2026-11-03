# AI-upscales the reel 4x with Real-ESRGAN (realesrgan-x4plus) into public/footage/elite-reel-ai4k.mp4.
# Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File scripts\ai-upscale.ps1 -Esrgan "C:\path\to\realesrgan-ncnn-vulkan.exe"
# Needs about 2 GB of free disk space while it runs; takes roughly 10-20 minutes on an RTX 3050.
param(
  [Parameter(Mandatory = $true)][string]$Esrgan,
  [string]$Model = 'realesrgan-x4plus'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ffmpeg = Join-Path $root 'node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe'
$src = Join-Path $root 'public\footage\elite-reel.mp4'
$dst = Join-Path $root 'public\footage\elite-reel-ai4k.mp4'
$work = Join-Path $env:TEMP 'elite-reel-esrgan'
$in = Join-Path $work 'in'
$out = Join-Path $work 'out'

if (-not (Test-Path $Esrgan)) { throw "Real-ESRGAN not found at $Esrgan" }
if (-not (Test-Path $ffmpeg)) { throw "Remotion's ffmpeg not found; run npm install first" }
New-Item -ItemType Directory -Force $in, $out | Out-Null

Write-Host '1/3 Extracting frames...'
& $ffmpeg -hide_banner -loglevel error -y -i $src -q:v 1 (Join-Path $in '%05d.jpg')

Write-Host '2/3 Upscaling with Real-ESRGAN (GPU)...'
& $Esrgan -i $in -o $out -n $Model -s 4 -f jpg
if ($LASTEXITCODE -ne 0) { throw 'Real-ESRGAN failed' }

Write-Host '3/3 Encoding video...'
& $ffmpeg -hide_banner -loglevel error -y -framerate 30 -i (Join-Path $out '%05d.jpg') `
  -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -movflags +faststart $dst

Remove-Item -Recurse -Force $work
Write-Host "Done: $dst"
