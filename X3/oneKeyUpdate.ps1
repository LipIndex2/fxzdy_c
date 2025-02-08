

# 相对路径 | 中文支持可能有点问题
$pathsArray = @(
    "../updateDev.bat",
    "../updateDevArtUI.bat",
    "../updateDevDoc.bat",
    "./ui.bat",
    "./导表.bat"
)

# Seconds
$completionFileTimeout = 60  

# 处理每一个路径
foreach ($path in $pathsArray)
{
    # 显示正在处理的路径
    Write-Output "---------------------------------"
    Write-Output "--- Run $path ---"

    
    # 所在目录
    $batDirectory = Split-Path $path
    
    Write-Output "[Now Processing]: $path | working directory: $batDirectory"

    # 命令
    $process = Start-Process -FilePath $path -WorkingDirectory $batDirectory
    
    
    Write-Output "--- /Run $path ---"
    Write-Output ""
    Write-Output ""
}
