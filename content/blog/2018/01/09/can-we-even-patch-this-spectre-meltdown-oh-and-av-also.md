---
title: 'Can we even patch this Spectre/Meltdown oh and AV also'
date: '2018-01-09T11:04:38-05:00'
status: publish
permalink: /2018/01/09/can-we-even-patch-this-spectre-meltdown-oh-and-av-also
author: ryan@dss-i.com
excerpt: ''
type: post
id: 490
category:
    - Uncategorized
tag: []
post_format: []
---
Isn’t it great when things are in meltdown and you can’t patch yet because your waiting on another patch?

Microsoft has stated you can’t patch until AV goes first

http://www.zdnet.com/article/windows-meltdown-spectre-fix-how-to-check-if-your-av-is-blocking-microsoft-patch/

https://support.microsoft.com/en-us/help/4072699/january-3-2018-windows-security-updates-and-antivirus-software

Bottom line if your AV vendor hasn’t update to set this registry to give the update permissions to install or you don’t use AV and instead use an application whitelist approach for security the patch won’t apply. You can use splunk to track down hosts that will refuse to apply the patch by adding this monitor to splunk and well Splunking the results

```
Key="HKEY_LOCAL_MACHINE" Subkey="SOFTWARE\Microsoft\Windows\CurrentVersion\QualityCompat" Value="cadca5fe-87d3-4b96-b7fb-a231484277cc" Type="REG_DWORD”
<span class="">Data="0x00000000</span>
```

Add the following to the inputs.conf applied to all windows system and ensure the server class is set to restart the UF and happy Splunking

```
[WinRegMon://HKLMSoftwareMSWindowsQualityCompat]
index = epintel
baseline = 1
disabled = 0
hive = \\REGISTRY\\MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\QualityCompat\\.*
proc = .*
type = delete|create|set|rename
```