---
title: "Dev Life: Splunk Add-ons like a developer"
date: "2019-01-07T16:10:08-05:00"
status: publish
permalink: /2019/01/07/dev-life-splunk-add-ons-like-a-developer
author: ryan@dss-i.com
excerpt: ""
type: post
id: 586
category:
  - Uncategorized
tag: []
post_format: []
---

As a life long (seems that way) software developer come to Splunk I would like to have some of the properties of a Integrated Development Environment (IDE). This blog post walks you through setting up and experiencing my approach to development for Splunk I wrote a second post in this series creating an actual add-on for Splunk using this toolchain. <https://www.rfaircloth.com/2019/01/07/building-a-cef-source-add-on-for-splunk-enterprise/>

- I can edit “code” i.e splunk conf in my editor and reload the code without restarting
- Every time I build/debug I have a clean environment
- I can run unit tests manually or automatically in a consistent way.
- I can participate in VCS (i.e. git) if desired
- I can consistently reproduce build and packaging including integration into a CI/CD process
- I can leverage dependencies from other developed products.
- Have ready access to common tools like add-on builder and eventgen

## Setting up the environment Mac OSX

- Install [Brew](https://brew.sh/)
- Install LibMagic “brew install libmagic”
- Install python “brew install python”
- Install pandoc “brew install pandoc”
- Install moreutills “brew **install moreutils”**
- Install jq “brew install jq”
- Install lxml support “xcode-select –install”
- Install git “brew install git”
- Install git flow “brew install git-flow”
- Install gitversion “brew **install** gitversion”
- Install virtual env for python “sudo pip install virtualenv”
- Install [docker](https://docs.docker.com/docker-for-mac/install/)
- Create the virtual env “virtualenv ~/venv/splservices”
- Activate the new env “source ~/venv/splservices/bin/activate”
- Install pip “sudo python easy_install pip”
- Install our specific requirements “pip install -r https://bitbucket.org/SPLServices/addonbuildimage/raw/master/requirements.txt”
- I personally prefer the [atom editor ](https://atom.io/)

## Setup the local project

For demonstration purposes we are going to work with one of my recent add-ons for Splunk. A full tutorial on git is beyond the scope of this article we will simply clone the repo and start a feature branch.

- Clone the repo “git clone https://bitbucket.org/SPLServices/ta-cef-for-splunk.git”
- Cd into the repo “cd ta-cef-for-splunk”
- Initials git submodules “git submodule init”
- Setup git flow “git flow init -d”
- Start a new feature “git flow feature start myfeature”

## Package and Test

Before we change anything we should verify we can recreate a successful build.

- Build a package “make package”
- Verify the package builds the last line will report something like this, path and version will vary.
-

````
<pre class="wp-block-code">```
slim package: [NOTE] Source package exported to "/Users/user/Downloads/ta-cef-for-splunk/out/packages/splunkbase/TA-cef-for-splunk-0.2.0-myfeature.1+17.tar.gz"
````

```

- Test the package using Splunk’s appinspect “make package\_test”
- Verify the test report shows one failure. While developing this one failure is expected which is the version number does not conform to release rules for Splunk Base. Note: per semver.org the feature branch version clearly indicates this is a development build this is helpful in preventing accidental “escapes” to production

```

<pre class="wp-block-code">```
splunk-appinspect inspect out/packages/splunkbase/TA-cef-for-splunk-0.2.0-myfeature.1+17.tar.gz --data-format junitxml --output-file test-reports/TA-cef-for-splunk.xml --excluded-tags manual
Validating: TA-cef-for-splunk Version: 0.2.0-myfeature.1+17
.......F.....SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS
SSSSSSSSSSSSSSSSSSSSSSSSSSSSS

A default value of 25 for max-messages will be used.
Splunk app packaging standards These checks validate that a Splunk app has been 
correctly packaged, and can be provided safely for package validation. 
    Check that the extracted Splunk App contains a default/app.conf file 
    that contains an [id] or [launcher] stanza with a version property that is 
    formatted as Major.Minor.Revision. 
        FAILURE: `Major.Minor.Revision` version numbering is required. 
            File: default/app.conf Line Number: 20 


TA-cef-for-splunk Report Summary:

       skipped: 176
       success:  9
  manual_check:  0
       failure:  1
       warning:  0
         error:  0
not_applicable:  3
-------------------
         Total: 189

Please note that more issues could be found out later during the optional manual review process.
```
```

Interactive Development
-----------------------

Now for the good stuff how can we interactively lets fire up a Splunk Docker container with the latest version of Splunk and our local copy of the addon. “make docker\_dev” wait for the text “Ansible playbook complete” to appear on terminal indicating Splunk is ready to work. Visit “http://127.0.0.1:8000” and login to a fresh copy of Splunk with the addon ready to go. The password will be “Changed!11” lets prove life by making a simple change to our addon.

- Open atom or the editor of your choice
- Navigate to &lt;project&gt;/src/TA-cef-for-splunk/default/props.conf
- Add the “EVAL-alive=”yes”” to the \[cef\] stanza
- Return to the running copy of Splunk and visit http://127.0.0.1:8000/debug/refresh/ (click refresh)
- Turn on the event gen “Settings –&gt;Data Inputs –&gt; SA Event-Gen then click enable
- Wait about and minute and click disable
- Go back to search and check for the alive field “index=\* sourcetype=cef | head | table sourcetype,alive”

Further reading
---------------

- Read more about [Event Gen ](https://github.com/splunk/eventgen)
- Read more about [developing](http://dev.splunk.com) for Splunk
- Want to see a fully working CI/CD for Splunk Add ons? Visit the bitbucket repository [https://bitbucket.org/splservices/](https://bitbucket.org/SPLServices/ta-cef-for-splunk/overview)
