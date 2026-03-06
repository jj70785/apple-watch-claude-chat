Add-Type -AssemblyName System.Drawing

$pngPath = "C:\Users\john\Downloads\Claude Bot Icon.png"
$icoPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\claude-bot.ico"

# Load the PNG
$png = [System.Drawing.Image]::FromFile($pngPath)

# Create icon and save
$icon = [System.Drawing.Icon]::FromHandle($png.GetHicon())
$stream = [System.IO.File]::Create($icoPath)
$icon.Save($stream)
$stream.Close()

$png.Dispose()
$icon.Dispose()

Write-Host "Icon converted to: $icoPath"

# Update the shortcut
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("C:\Users\john\Desktop\Claude Bot.lnk")
$s.TargetPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\start-bot.bat"
$s.WorkingDirectory = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat"
$s.IconLocation = $icoPath
$s.Description = "Start Claude Telegram Bot"
$s.Save()

Write-Host "Shortcut updated with custom icon!"
