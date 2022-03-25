---
title: 'Splunk Universal Forwarder Version 6.2.3+ Ubuntu 15.04'
date: '2015-05-28T10:06:05-05:00'
status: publish
permalink: /2015/05/28/splunk-universal-forwarder-version-6-2-3-ubuntu-15-04
author: ryan@dss-i.com
excerpt: ''
type: post
id: 121
category:
    - Splunk
tag:
    - Deployment
    - linux
    - Splunk
post_format: []
---
Author: Ryan Faircloth

Summary: Using repositories for version managment of the Splunk Universal Forwarder assists in ensuring managed Ubuntu systems are using the approved version of the software at all times.

Setup the repository server
---------------------------

1. Install reprepro and nginx `<br></br>sudo apt-get install reprepro nginx packaging-dev -y<br></br>`
2. Create a user to work with the repository `<br></br>adduser  --disabled-password --disabled-login --home /srv/reprepro --group reprepro<br></br>`
3. Change user to our reprepro user all commands for the repository should be executed using this ID
  
  `<br></br> sudo su - reprepro<br></br>`

Generate GPG Keys
-----------------

1. Change user to our reprepro user all commands for the repository should be executed using this ID
  
  ```
  sudo su - reprepro 
  
  ```
2. Create the default configuration for gpg by running the command  
  `<br></br>gpg --list-keys<br></br>`
3. Edit ~/.gnupg/gpg.conf 
  - uncomment the line `no-greeting`
  - add the following content to the end of the file
  
  ```
  # Prioritize stronger algorithms for new keys.
  default-preference-list SHA512 SHA384 SHA256 SHA224 AES256 AES192 AES CAST5 BZIP2 ZLIB ZIP UNCOMPRESSED
  # Use a stronger digest than the default SHA1 for certifications.
  cert-digest-algo SHA512
  
  ```
4. Generate a new key with the command `gpg --gen-key`
5. Select the folowing options 
  1. Type of key “(1) RSA and RSA (default)”
  2. Key size “4096”
  3. Expires “10y”
  4. Confirm “Y”
  5. Real Name “Splunk local repository”
  6. Email address on repository contact this generally should be an alias or distribution list
  7. Leave the comment blank
  8. Confirm and “O” to Okay
  9. Leave passphrase blank and confirm, a key will be generated not the sub KEY ID in the following example \* E507D48E \*
  
  `<br></br>gpg: checking the trustdb<br></br>gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model<br></br>gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u<br></br>gpg: next trustdb check due at 2025-05-24<br></br>pub   4096R/410E1699 2015-05-27 [expires: 2025-05-24]<br></br>      Key fingerprint = 7CB8 81A9 E07F DA7B 83FF  2E1B 8B31 DA83 410E 1699<br></br>uid                  Splunk local repository <repo@example.com><br></br>sub   4096R/E507D48E 2015-05-27 [expires: 2025-05-24]<br></br>`
6. Export the signing keys public component save this content for use later
  
  `<br></br>gpg --export --armor KEY_ID >~/repo.pub<br></br>`

Configure Prerepro
------------------

1. Change user to our reprepro user all commands for the repository should be executed using this ID `sudo su - reprepro`
2. Create the directory structure `sudo mkdir -p /srv/reprepro/ubuntu/{conf,dists,incoming,indices,logs,pool,project,tmp}`
3. Change directories to the new repository `cd /srv/reprepro/ubuntu/`
4. Edit the file `/srv/reprepro/ubuntu/conf/distributions`
5. Update the file contents
  
  ```
  Origin: SplunkEnterprise
  Label: SplunkEnterprise
  Codename: ponies
  Architectures: i386 amd64 source    
  Components: main
  Description: Splunk Enterprise and Universal Forwarders for Debian based systems
  SignWith: YOUR-KEY-ID 
  
  ```
6. Edit the file `/srv/reprepro/ubuntu/conf/options`
7. Update the file contents
  
  ```
  ask-passphrase
  basedir .
  
  ```

Load the packages
-----------------

Load the packages using the following commands syntax replace package.deb with the correct path to the splunkforwarder deb file

```
reprepro -S utils -P standard includedeb ponies package.deb

```

Setup the web server
--------------------

1. Create the file `/etc/nginx/sites-available/vhost-packages.conf`
2. Use the following content replacing package.local with the fqdn of the repository host ```
  server {
    listen 80;
    server_name packages.internal;
      
    access_log /var/log/nginx/packages-access.log;
    error_log /var/log/nginx/packages-error.log;
      
    location / {
      root /srv/reprepro;
      index index.html;
    }
      
    location ~ /(.*)/conf {
      deny all;
    }
      
    location ~ /(.*)/db {
      deny all;
    }
  }
  
  ```
3. Increase the server name hash bucket by creating the following file `/etc/nginx/conf.d/server_names_hash_bucket_size.conf`
4. Use the following content `server_names_hash_bucket_size 64;`
5. Enable the new configuration
  
  ```
  sudo ln -s /etc/nginx/sites-available/vhost-packages.conf /etc/nginx/sites-enabled/vhost-packages.conf
  sudo service nginx reload
  
  ```

Configure the repository
------------------------

1. Edit the file ```
  /etc/apt/sources.list.d/packages.internal.list  
  
  ```
2. Use the following content ```
  deb http://packages.internal/ubuntu/ ponies main
  
  ```
3. Import the public key ```
  sudo apt-key add /tmp/repo.pub
  
  ```
4. Update the repository cache ```
  sudo apt-get update 
  
  ```

Install the Splunk Universal Forwarder
--------------------------------------

Run the following command

`sudo apt-get install splunkforwarder`

Configure the universal forwarder

- Using best practices to manually create the org\_deploymentclient configuration app
- Using RPM based configuration package
- Using Configuration Managment system such as Puppet or Chef

Create and install a configuration package for the Universal Forwarder
----------------------------------------------------------------------

In the following procedure “org” should be replace with the abbreviate of the organization using the configuration.

1. Create the paths `/srv/reprepro/org_debs/`
2. Create the path for the first version of the package ie `mkdir org-splunk-ufconfig-1`
3. Change to the new directory
4. Create the following structure
  
  ```
  ├── DEBIAN
  │   ├── control (file)
  │   ├── postinst (file)
  │   ├── preinst (file)
  │   └── prerm (file)
  └── opt
      └── splunkforwarder
          └── etc
              └── apps
                  └── org_all_deploymentclient
                      └── default
                          ├── deploymentclient.conf (file)
  
  ```
5. Edit the DEBIAN/control file as follows `<br></br>Package: org-splunk-ufconfig<br></br>Section: base<br></br>Priority: standard<br></br>Version: 1<br></br>Architecture: all<br></br>Maintainer: Your Name <you@email.com><br></br>Depends: splunkforwarder (>=6.0.0)<br></br>Description: <insert up to 60 chars description><br></br> <insert long description, indented with spaces><br></br>`
6. Edit the DEBIAN/postinst
  
  ```
  #!/bin/bash
  /opt/splunkforwarder/bin/splunk enable boot-start -user splunk --accept-license --answer-yes
  service splunk start    
  
  ```
7. Edit the DEBIAN/preinst ```
  #!/bin/bash
  file="/etc/init.d/splunk"
  if [ -f "$file" ]
  then
      echo "$file found."
      service splunk stop
  else
      echo "$file not found."
  fi
  
  ```
8. Edit the DEBIAN/prerm ```
  #!/bin/bash
  file="/etc/init.d/splunk"
  if [ -f "$file" ]
  then
      echo "$file found."
      service splunk stop
      /opt/splunkforwarder/bin/splunk disable boot-start
  else
      echo "$file not found."
  fi
  
  ```
9. Update the contents of deploymentclient.conf with the appropriate information for you installation
10. Add additional content as required for your deployment
11. Change directories up to the parent of org-splunk-ufconfig–1
12. Create the debian package with the command `dpkg-deb --build org-splunk-ufconfig-1/`
13. Change to the repository directory `/srv/reprepro/ubuntu`
14. Store the new package in the repository
  
  `reprepro -S utils -P standard includedeb ponies /srv/reprepro/org_debs/org-splunk-ufconfig-1.deb`
15. Install the new package on the client using the command `sudo apt-get install org-splunk-ufconfig` this will install the splunk forwarder package if has not yet been installed.