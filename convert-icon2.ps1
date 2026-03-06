Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$pngPath = "C:\Users\john\Downloads\Claude Bot Icon.png"
$icoPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\claude-bot.ico"

# Load PNG
$bitmap = New-Object System.Drawing.Bitmap($pngPath)

# Resize to 256x256 (max ICO size)
$size = 256
$resized = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($resized)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($bitmap, 0, 0, $size, $size)
$graphics.Dispose()

# Convert to icon using proper method
$hIcon = $resized.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

# Write ICO file manually with proper header
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICO Header
$bw.Write([Int16]0)      # Reserved
$bw.Write([Int16]1)      # Type (1 = ICO)
$bw.Write([Int16]1)      # Number of images

# Save bitmap to memory to get PNG data
$pngStream = New-Object System.IO.MemoryStream
$resized.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngData = $pngStream.ToArray()

# Image directory entry
$bw.Write([Byte]0)                    # Width (0 = 256)
$bw.Write([Byte]0)                    # Height (0 = 256)
$bw.Write([Byte]0)                    # Colors (0 = no palette)
$bw.Write([Byte]0)                    # Reserved
$bw.Write([Int16]1)                   # Color planes
$bw.Write([Int16]32)                  # Bits per pixel
$bw.Write([Int32]$pngData.Length)     # Size of image data
$bw.Write([Int32]22)                  # Offset to image data (6 + 16 = 22)

# Image data (PNG)
$bw.Write($pngData)

# Save to file
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())

$bw.Dispose()
$ms.Dispose()
$pngStream.Dispose()
$bitmap.Dispose()
$resized.Dispose()

Write-Host "Icon created: $icoPath"

# Update shortcut
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("C:\Users\john\Desktop\Claude Bot.lnk")
$s.TargetPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\start-bot.bat"
$s.WorkingDirectory = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat"
$s.IconLocation = "$icoPath,0"
$s.Description = "Start Claude Telegram Bot"
$s.Save()

Write-Host "Shortcut updated!"
