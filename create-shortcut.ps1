$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("C:\Users\john\Desktop\Claude Bot.lnk")
$s.TargetPath = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat\start-bot.bat"
$s.WorkingDirectory = "C:\Users\john\Documents\CLAUDDY\Apple Watch Claude Chat"
$s.Description = "Start Claude Telegram Bot"
$s.Save()
Write-Host "Shortcut created on Desktop!"
