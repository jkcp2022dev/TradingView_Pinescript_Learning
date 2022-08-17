
import os
destPath = '/gupang.com/webbsite'
if not os.path.exists(destPath):
    os.makedirs(destPath)
os.chdir(destPath)

!wget -r -p https://www.gupang.com/

