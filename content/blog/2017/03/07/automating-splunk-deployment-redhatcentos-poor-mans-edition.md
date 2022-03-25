---
title: 'Automating Splunk deployment for RedHat/Centos (poor man&#8217;s edition)'
date: '2017-03-07T18:24:44-05:00'
status: publish
permalink: /2017/03/07/automating-splunk-deployment-redhatcentos-poor-mans-edition
author: ryan@dss-i.com
excerpt: ''
type: post
id: 422
category:
    - Uncategorized
tag: []
post_format: []
---
I pulled this out of the archives , on request notice this was originally developed for Splunk 6.2.x and RHEL 7.0. Please review the details make sure it is suitable for you and TEST. If I can talk you out of doing things this way I would. Salt is a great way to manage app config its free and just awesome.

```
<pre class="bp-text bp-text-plain hljs">```
Title: Splunk Universal Forwarder Version 6.2.3+ Red Hat Enterprise Linux 7

Author: Ryan Faircloth 

Summary: Using repositories for version managment of the Splunk Universal Forwarder assists in ensuring managed Red Hat and compatible linux  systems are using the approved version of the software at all times. 

[TOC]

## Setup the repository server ##
1. Install createrepo  and nginx ``` yum install createrepo apache2 ```
3. Create a user to work with the repository 

	``` 
	sudo adduser  repouser 
	```  
3. Change user to our repouser user all commands for the repository should be executed using this ID 

	 ``` 
	 sudo su - repouser
	 ```

## Generate GPG Keys ##
1. Change user to our repouser user all commands for the repository should be executed using this ID 

	```
	sudo su - repouser 
	```
2. Create the default configuration for gpg by running the command 

	```
	gpg --list-keys
	``` 
3. Edit ~/.gnupg/gpg.conf 
	* uncomment the line ``` no-greeting ```
	* add the following content to the end of the file 
	
	```
	# Prioritize stronger algorithms for new keys.
	default-preference-list SHA512 SHA384 SHA256 SHA224 AES256 AES192 AES CAST5 BZIP2 ZLIB ZIP UNCOMPRESSED
	# Use a stronger digest than the default SHA1 for certifications.
	cert-digest-algo SHA512
	```
	
4. Generate a new key with the command ``` gpg --gen-key ```
5. Select the folowing options ON CENTOS/RHEL this procedure must be executed on the console or SSH having logged in as the repouser
	1. Type of key "(1) RSA and RSA (default)"
	2. Key size "4096"
	3. Expires "10y"
	4. Confirm "Y"
	5. Real Name "Splunk local repository"
	6. Email address on repository contact this generally should be an alias or distribution list
	7. Leave the comment blank
	8. Confirm and "O" to Okay
	9. Leave passphrase blank and confirm, a key will be generated not the sub KEY ID in the following example * E507D48E * 

	```
	gpg: checking the trustdb
	gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
	gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
	gpg: next trustdb check due at 2025-05-24
	pub   4096R/410E1699 2015-05-27 [expires: 2025-05-24]
    	  Key fingerprint = 7CB8 81A9 E07F DA7B 83FF  2E1B 8B31 DA83 410E 1699
	uid                  Splunk local repository <repo@example.com>
	sub   4096R/E507D48E 2015-05-27 [expires: 2025-05-24]
	```	
10. Export the signing keys public component save this content for use later

	```
	gpg --export --armor KEY_ID >~/repo.pub 
	``` 
11. Install the new key into the RPM database

```
sudo cp ~/repo.pub /etc/pki/rpm-gpg/RPM-GPG-KEY-splunkrepo
sudo rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-splunkrepo
```
12. Configure RPM signing with the new key

```
echo "%_signature gpg" > ~/.rpmmacros
echo "%_gpg_name splunkrepo" >> ~/.rpmmacros
``

13. Create a repository

```
mkdir /opt/splunkrepo
cp splunkforwarder*.rpm /opt/splunkrepo
createrepo /opt/splunkrepo
```
14. Configure the local repository create the following configuration /etc/yum.repos.d/splunk.repo

```
[splunkrepo]
name=splunk repository
baseurl=file:///opt/splunkrepo/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-splunkrepo
enabled=1
```
15. Test the local repository by installing splunkforwarder

```
sudo yum update
sudo yum install splunkforwader
```
Note: Create a configuration RPM refer to https://fedoraproject.org/wiki/How_to_create_an_RPM_package and https://www.redhat.com/promo/summit/2010/presentations/summit/opensource-for-it-leaders/thurs/pwaterma-2-rpm/RPM-ifying-System-Configurations.pdf for more information do not run as root sudo to repouser
17.  Prepare the rpm tree ``` rpmdev-setuptree ```
18.  Create a spec file with the following content ~/splunkforwarder-baseconfig.spec

```
#--------------------------------------------------------------------------
# This spec file is Copyright 2010, My Company, Inc.
#--------------------------------------------------------------------------
Summary: My Company general configuration RPM
Name: splunkforwarder-baseconfig
Version: 1
Release: 3
License: Copyright 2010, My Company, Inc.
Group: MyCompany/Configs
Packager: Packager Name <my-email@mycompany.com>
requires: splunkforwarder
BuildArch: noarch
%description
This RPM provides general services and security configuration for My Company.

%triggerin -- splunkforwarder
/opt/splunkforwarder/bin/splunk enable boot-start --accept-license --answer-yes 
service splunk stop
if [ -d "/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local" ]
then
    echo "Directory /opt/splunkforwarder/etc/apps/org_all_deploymentclient/local exists."
else
    mkdir -p /opt/splunkforwarder/etc/apps/org_all_deploymentclient/local    
fi
echo #Base deployment configuration >/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local/deploymentclient.conf
echo [deployment-client] >>/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local/deploymentclient.conf
#echoclientName  >>/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local/deploymentclient.conf
echo [deployment-client] >>/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local/deploymentclient.conf
echo targetUri = ds.example.com:8089 >>/opt/splunkforwarder/etc/apps/org_all_deploymentclient/local/deploymentclient.conf

service splunk start


%triggerun -- splunkforwarder
if [ $1 -eq 0 -a $2 -gt 0 ] ; then
 /opt/splunkforwarder/bin/splunk stop
 /opt/splunkforwarder/bin/splunk disable boot-start
 rm -Rf /opt/splunkforwarder/etc/apps/org_all_deploymentclient
fi
%files

```
18.  Build the RPM ``` rpmbuild -sign -ba splunkforwarder-baseconfig.spec ```
19. Copy the RPM to the repository cp ~/rpmbuild/RPMS/noarch/splunkforwarder-baseconfig-1-3.noarch.rpm / /opt/splunkrepo
20. Update repository DB ``` createrepo /opt/splunkrepo ```
21. Test the rpms

```
yum update
yum install splunkforwarder-baseconfig
```
22. Configure a web server (Apache) for use as a repository server
23.  Set permissions on the repository folder ``` chmod -R 755 /opt/splunkrepo ```
24. Create the web server configuration file with the following contents /etc/http/conf.d/splunkrepo.conf

```
Alias /splunkrepo/ "/opt/splunkrepo/"

<Directory "/opt/splunkrepo">
   Options Indexes FollowSymLinks MultiViews
   AllowOverride All
   Require local
   Order allow,deny
   Allow from all
</Directory>
```
25. Reload (or restart) the web server ```service httpd reload ```
26. Test `` lynx http://localhost/splunkrepo/repodata/repomd.xml ```
27. Enable the new repository on the first test client

```
sudo yum-config-manager --add-repo http://localhost/splunkrepo
sudo yum update
sudo yum install splunkforwarder-baseconfig
```

```
```

<div class="bp-popup-modal"></div><div class="bp-controls-wrapper"></div>