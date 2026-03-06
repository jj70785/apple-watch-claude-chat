Add-Type -AssemblyName System.Drawing

$pngPath = "C:\Users\john\Downloads\Claude Bot Icon.png"
$icoPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\claude-bot.ico"

# Load PNG
$bitmap = New-Object System.Drawing.Bitmap($pngPath)

# Create new bitmap with transparency support
$transparent = New-Object System.Drawing.Bitmap($bitmap.Width, $bitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Copy pixels and make white/near-white transparent
for ($x = 0; $x -lt $bitmap.Width; $x++) {
    for ($y = 0; $y -lt $bitmap.Height; $y++) {
        $pixel = $bitmap.GetPixel($x, $y)
        # If pixel is white or near-white, make transparent
        if ($pixel.R -gt 245 -and $pixel.G -gt 245 -and $pixel.B -gt 245) {
            $transparent.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            $transparent.SetPixel($x, $y, $pixel)
        }
    }
}

Write-Host "Removed white background..."

# Resize to 256x256 for large icon
$size = 256
$resized = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($resized)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.DrawImage($transparent, 0, 0, $size, $size)
$graphics.Dispose()

# Save PNG data
$pngStream = New-Object System.IO.MemoryStream
$resized.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngData = $pngStream.ToArray()

# Create ICO file
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# ICO Header
$bw.Write([Int16]0)      # Reserved
$bw.Write([Int16]1)      # Type (1 = ICO)
$bw.Write([Int16]1)      # Number of images

# Image directory entry
$bw.Write([Byte]0)                    # Width (0 = 256)
$bw.Write([Byte]0)                    # Height (0 = 256)
$bw.Write([Byte]0)                    # Colors
$bw.Write([Byte]0)                    # Reserved
$bw.Write([Int16]1)                   # Color planes
$bw.Write([Int16]32)                  # Bits per pixel (32 for transparency)
$bw.Write([Int32]$pngData.Length)     # Size of image data
$bw.Write([Int32]22)                  # Offset to image data

# Image data
$bw.Write($pngData)

[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())

$bw.Dispose()
$ms.Dispose()
$pngStream.Dispose()
$bitmap.Dispose()
$transparent.Dispose()
$resized.Dispose()

Write-Host "Icon saved with transparency!"

# Recreate shortcut
Remove-Item "C:\Users\john\Desktop\Claude Bot.lnk" -Force -ErrorAction SilentlyContinue
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("C:\Users\john\Desktop\Claude Bot.lnk")
$s.TargetPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\start-bot.bat"
$s.WorkingDirectory = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat"
$s.IconLocation = "$icoPath,0"
$s.Description = "Start Claude Telegram Bot"
$s.Save()

Write-Host "Shortcut recreated!"
