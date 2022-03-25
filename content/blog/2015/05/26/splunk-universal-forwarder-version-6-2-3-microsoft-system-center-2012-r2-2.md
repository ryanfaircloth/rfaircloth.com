---
title: 'Splunk Universal Forwarder Version 6.2.3+ Microsoft System Center 2012 R2'
date: '2015-05-26T09:09:43-05:00'
status: publish
permalink: /2015/05/26/splunk-universal-forwarder-version-6-2-3-microsoft-system-center-2012-r2-2
author: ryan@dss-i.com
excerpt: ''
type: post
id: 119
category:
    - Splunk
tag:
    - Deployment
    - Splunk
    - 'Universal Forwarder'
    - Windows
post_format: []
---
Author: Ryan Faircloth

Summary: Rapid deployment of the universal forwarder in a production environment is possible with a minimal amount of risk for the customer. The installation of a universal forwarder can be performed at any time without impact to the production system and without reboot. A small caution is required in that if an existing MSI installation has created on reboot actions the installation of the Splunk universal forwarder or any other MSI may trigger a reboot by the SCCM client.

\[TOC\]

Overview
========

This guide will deploy the universal forwarder to all servers with a supported version of the Microsoft Windows Server operating system.

- Create a new folder to contain Splunk related collections
- Create one or more collection containing all systems which should receive the universal forwarder.
- Create a collection containing all systems where any version of the universal forwarder -has been deployed
- Create an application definition to deploy the universal forwarder without configuration
- Create an application definition to deploy an upgrade to the universal forwarder without configuration
- Create a package containing a powershell script to configure the universal forwarder
- Deploy the configuration script using a task sequence

Prerequisite Steps
==================

|Task|Responsible|
|--- |--- |
|Create CNAME for Deployment Server|DNS Admin|
|Install Splunk Enterprise on Server|Splunk Admin|
|Configure Splunk Instance as Deployment Server|Splunk Admin|


Step by Step
============

Create the deployment collection folder
---------------------------------------

1. Navigate to Device Collections
2. Right click
3. Create new folder
4. Name the new folder “Splunk Universal Forwarders”
5. Navigate to the new folder

Create a collection for deployment
----------------------------------

1. Right click and choose "“Create New Device Collection”
2. Name the collection “Splunk Deployment Collection for Servers”
3. Select “All Desktop and Server Clients” as the limiting collection  
  ![Create Device Collection](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-1_CreateDeviceCollection.png?w=1100 "Create Device Collection")
4. Click Next
5. Click Add to define the criteria used to determine which devices will receive the Universal Forwarder
6. Click Query
7. Name the Query “Server OS”
8. Click Edit
9. Click Show query language
10. Enter the following query:  
  `sql<br></br>select SMS_R_SYSTEM.ResourceID,<br></br>SMS_R_SYSTEM.ResourceType,<br></br>SMS_R_SYSTEM.Name,SMS_R_SYSTEM.SMSUniqueIdentifier,<br></br>SMS_R_SYSTEM.ResourceDomainORWorkgroup,SMS_R_SYSTEM.Client<br></br>from SMS_R_System<br></br>inner join<br></br>SMS_G_System_OPERATING_SYSTEM on SMS_G_System_OPERATING_SYSTEM.ResourceId = SMS_R_System.ResourceId<br></br>where<br></br>SMS_G_System_OPERATING_SYSTEM.ProductType = 2<br></br>or SMS_G_System_OPERATING_SYSTEM.ProductType = 3<br></br>`
11. Click OK
12. Click OK again
13. Enable Incremental Update by checking the box
14. Click Next
15. Click Next
16. Click Close

&gt; Note: the collection will contain zero members until the update collection background task completes

Create a collection of all successfully deployed universal forwarders
---------------------------------------------------------------------

1. Right click and choose “Create New Device Collection”
2. Name the collection “Splunk Deployment Collection for Deployed Forwarders”
3. Select “All Desktop and Server Clients” as the limiting collection
4. Click Next
5. Click Add to define the criteria used to determine which devices will receive the Universal Forwarder
6. Click Query
7. Name the Query “Server OS”
8. Click Edit
9. Click Show query language
10. Enter the following query: ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-2_DeviceCollectionQueryExample.png?w=1100)
  
  `sql<br></br>Select<br></br>SMS_R_SYSTEM.ResourceID,<br></br>SMS_R_SYSTEM.ResourceType,<br></br>SMS_R_SYSTEM.Name,<br></br>SMS_R_SYSTEM.SMSUniqueIdentifier,<br></br>SMS_R_SYSTEM.ResourceDomainORWorkgroup,<br></br>SMS_R_SYSTEM.Client<br></br>from SMS_R_System<br></br>inner join<br></br>SMS_G_System_ADD_REMOVE_PROGRAMS on SMS_G_System_ADD_REMOVE_PROGRAMS.ResourceID = SMS_R_System.ResourceId<br></br>inner join<br></br>SMS_G_System_INSTALLED_SOFTWARE on SMS_G_System_INSTALLED_SOFTWARE.ResourceID = SMS_R_System.ResourceId<br></br>inner join<br></br>SMS_G_System_ADD_REMOVE_PROGRAMS_64 on<br></br>SMS_G_System_ADD_REMOVE_PROGRAMS_64.ResourceId = SMS_R_System.ResourceId<br></br>where<br></br>SMS_G_System_ADD_REMOVE_PROGRAMS.DisplayName = "UniversalForwarder"<br></br>and SMS_G_System_ADD_REMOVE_PROGRAMS_64.DisplayName = "UniversalForwarder"<br></br>or SMS_G_System_INSTALLED_SOFTWARE.ProductName = "UniversalForwarder"<br></br>order by SMS_R_System.Name<br></br>`
11. Click OK
12. Click OK again
13. Enable Incremental Update by checking the box
14. Click Next
15. Click Next
16. Click Close

> Note: the collection will contain zero members until the update collection background task completes

Create Application Definitions
------------------------------

Download both the 32bit and 64bit versions of the Splunk Universal Forwarder into the source folder structure used for SCCM deployment applications. Do this for all versions currently deployed as well as the new version to be deployed.

> In general the locations are similar to the path:  
> \\\\servername\\source\\vendor\\product\\version\\bitness  
> \\\\servername\\source\\Splunk\\UniversalForwarder\\6.2.3\\x86

Create the application definition for the oldest deployed version of the Univeral Forwarder first.

1. Navigate to Applications in the Software Library screen
2. Right click and create a new folder for Splunk definitions
3. Right click on the new folder and choose Create New Application
4. Locate the 64 bit MSI for this product version ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-3_1_ApplicationDef.png?w=1100)
5. Click Next
6. Click Next again
7. Update the definition with the following information 
  - Name (Include version Number and bitness Version number i.e. Universal Forwarder 6.2.3 (x64)
  - Publisher
  - Version
  - Update the command line by removing “/q” and appending “/quiet AGREETOLICENSE=Yes”  
      > Note it is very important that /q is replaced by /quiet  
      > ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-3_2_ApplicationDef.png?w=1100)
8. Click Next
9. Click Next
10. Click Close
11. Right click on the new application definition and click properties
12. Select the deployment type tab
13. Select the first deployment and click edit
14. Select the program tab
15. update the uninstall command replacing /q with /quiet
16. select the third browse next to product code and select the MSI
17. Click requirements
18. Click add
19. Select category = device condition = operating system and provide the supported 64bit operating systems ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-3_3_ApplicationDef.png?w=1100)
20. Create and additional requirements appropriate for your environment such as memory and disk space free
21. Click OK
22. Click OK again
23. Add a new deployment type define the 32 bit MSI type using the information above
24. Edit the new type using the information above to set the product MSI and verify requirements
25. Select the supersedence tab
26. click add
27. Click Browse and select the oldest prior version of the application deployed to replace
28. Map old deployment type to new ensuring the types match ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-3_4_ApplicationDef.png?w=1100)
29. Click OK
30. Add any other replacements required
31. Verify your work and click OK

> Repeat the application creation process for all versions of the UF in production If you are upgrading monitor your deployment progress You may continue with this procedure while the Universal Forwarder application is deployed.

Create a Configuration Script
-----------------------------

1. Create a source folder to contain the configuration script for example \\\\servername\\source\\splunk\\scripts\\UF\_Config\_V1
2. The following script can be used as a template for the appropriate configuration for your site. At minimum the deployment server FQDN must be customized. Name the script configure.ps1

```
#Splunk Configuration Script for SCCM Task Sequence
#Locate Splunk based on the MSI registration

function Get-IniContent ($filePath)
{
$ini = @{}
$section="GLOBAL"
$CommentCount=0
switch -regex -file $FilePath
{
 
 "^\[(.+)\]" # Section
{
$section = $matches[1]
$ini[$section] = @{}
$CommentCount = 0
}
"^(\#.*)$" # Comment
{
$value = $matches[1]
$CommentCount = $CommentCount + 1
$name = "Comment" + $CommentCount
#$ini[$section][$name] = $value
}
"(.+?)\s*=(.*)" # Key
{
$name,$value = $matches[1..2]
$ini[$section][$name] = $value
}
}
return $ini
}

$location ="C:\Program Files\SplunkUniversalForwarder\"

#note if splunk may not be installed at the default location uncomment the following lines
#$list = Get-WmiOBject -Class Win32_Product | Where-Object {
# $_.Name -eq 'UniversalForwarder' -or $_.Name -eq 'Splunk' }

#$splunkprod = $list | where-Object { $_.InstallLocation }

#$location = $splunkprod.InstallLocation

$scriptappver = 2

$splunkcmd = $location + "bin\splunk.exe"
$staticapp = $location + "etc\apps\_static_all_universalforwarder\"
$staticdefault = $staticapp + "default\"
$staticlocal = $staticapp + "local\"

$staticdefault_dc = $staticdefault + "deploymentclient.conf"
$staticlocal_dc = $staticlocal + "deploymentclient.conf"
$staticdefault_app = $staticdefault + "app.conf"

if (!(Test-Path -Path $staticapp)) {new-item -ItemType Directory -Path $staticapp}

if (!(Test-Path -Path $staticdefault)) {new-item -ItemType Directory -Path $staticdefault}

if (!(Test-Path -Path $staticlocal)) {new-item -ItemType Directory -Path $staticlocal}

if (!(Test-Path -Path $staticdefault_app))
{
 new-item -path $staticdefault_app -ItemType File
 Add-Content -Path $staticdefault_app -Value "#Generated by scripting"
 #Add-Content -Path $staticdefault_app -Value "`r`n"
 Add-Content -Path $staticdefault_app -Value "[_static_all_universalforwarder]"
 Add-Content -Path $staticdefault_app -Value "author=Ryan Faircloth"
 Add-Content -Path $staticdefault_app -Value "description=Script Generated UF default configuration applied by SCCM"
 Add-Content -Path $staticdefault_app -Value "version=1"
 Add-Content -Path $staticdefault_app -Value "[ui]"
 Add-Content -Path $staticdefault_app -Value "is_visible = false"
}

$appconf = Get-IniContent $staticdefault_app
$appver = $appconf[“_static_all_universalforwarder”][“version”]

if ($appver -ne $scriptappver)
{
if (!(Test-Path -Path $staticdefault_dc))
{
 new-item -path $staticdefault_dc -ItemType File
 Add-Content -Path $staticdefault_dc -Value "#Generated by scripting"
 Add-Content -Path $staticdefault_dc -Value "[deployment-client]"
 Add-Content -Path $staticdefault_dc -Value "clientName=ScriptDeployed|"
 Add-Content -Path $staticdefault_dc -Value "[target-broker:deploymentServer]"
 Add-Content -Path $staticdefault_dc -Value "targetUri=srvsplunk.ad.domainname.com:8089"
 Add-Content -Path $staticdefault_dc -Value ""

}

& $splunkcmd "restart"
}

```

Create a Package to contain the configuration script
----------------------------------------------------

1. Create a new package folder Splunk
2. Create a new folder on a network share Splunk\_config\_vx where X is the version of the script and include a customized version of the config script provided
3. Right click on the package folder create package
4. Name the package Splunk Configuration Script v1
5. Select the source folder ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-3_PackageDef.png?w=1100)
6. Click Next
7. Click do not create a program
8. Click next
9. Click next
10. Click Close
11. Right click on the package and click “Distribute Content” using appropriate options for the environment. ***Do not click deploy***
12. Create the Task Sequence
13. Crea a new Task Sequence Folder “Splunk”
14. Right click the Task Sequence Folder Create Task Sequence
15. Name the task Splunk Config Vx
16. Click Next
17. Click Next
18. Click Close
19. Right click on the task sequence
20. Click properties
21. Click the advance tab
22. Select suppress task sequence notifications and disable this task sequence on computers where it is deployed
23. Right click on the task sequence and choose edit
24. Click Add General —&gt; powershell script
25. Set the script name i.e. configure.ps1 and execution policy=bypass
26. Click OK
27. Right click on the task and deploy to the deployed collection created second above

Create the configuration task sequence
--------------------------------------

1. Navigate to Software Library
2. Navigate to Operating System Deployment
3. Navigate to Task Sequence
4. Optional Create a new folder called Splunk
5. Right click and Create a new task sequence
6. Select Custom Sequence ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-4_1_TaskSequence.png?w=1100)
7. Click Next
8. Name the sequence i.e. *Splunk Configuration Script Vx*
9. Click Next
10. Click Next
11. Click Close
12. Right click on the task sequence
13. Click properties
14. Click the advanced tab 
  - Select suppress task sequence notifications
  - disable this task sequence on computers where it is deployed  
      ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-4_2_TaskSequence.png?w=1100)
15. Click Ok
16. Right click on the task sequence and choose edit 
  - Click Add General —&gt; powershell script
  - Set the script name and execution policy=bypass  
      ![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/05/wpid-4_3_TaskSequence.png?w=1100)
17. Click OK
18. Right click on the task and deploy to the deployed collection created second above