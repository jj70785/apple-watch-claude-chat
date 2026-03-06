Add-Type -AssemblyName System.Drawing

$pngPath = "C:\Users\john\Downloads\Claude Bot Icon.png"
$icoPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\claude-bot2.ico"

# Load PNG
$bitmap = New-Object System.Drawing.Bitmap($pngPath)

# Use built-in MakeTransparent to remove white
$bitmap.MakeTransparent([System.Drawing.Color]::White)

Write-Host "Made white transparent..."

# Resize to 256x256
$size = 256
$resized = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($resized)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$graphics.DrawImage($bitmap, 0, 0, $size, $size)
$graphics.Dispose()

# Save as PNG first to verify
$resized.Save("C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\claude-bot-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved transparent PNG for verification"

# Save PNG data for ICO
$pngStream = New-Object System.IO.MemoryStream
$resized.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngData = $pngStream.ToArray()

# Create ICO
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)
$bw.Write([Int16]0)
$bw.Write([Int16]1)
$bw.Write([Int16]1)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Int16]1)
$bw.Write([Int16]32)
$bw.Write([Int32]$pngData.Length)
$bw.Write([Int32]22)
$bw.Write($pngData)
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())

$bw.Dispose()
$ms.Dispose()
$pngStream.Dispose()
$bitmap.Dispose()
$resized.Dispose()

Write-Host "Icon saved: $icoPath"

# Delete old shortcut, create new one with new icon
Remove-Item "C:\Users\john\Desktop\Claude Bot.lnk" -Force -ErrorAction SilentlyContinue
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("C:\Users\john\Desktop\Claude Bot.lnk")
$s.TargetPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\start-bot.bat"
$s.WorkingDirectory = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat"
$s.IconLocation = "$icoPath,0"
$s.Save()

Write-Host "Done! Check desktop."
