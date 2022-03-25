---
title: 'Building a CEF source add on for Splunk Enterprise'
date: '2019-01-07T21:06:03-05:00'
status: publish
permalink: /2019/01/07/building-a-cef-source-add-on-for-splunk-enterprise
author: ryan@dss-i.com
excerpt: ''
type: post
id: 592
category:
    - Uncategorized
tag: []
post_format: []
---
In my prior post I walked you through setting up a development environment for Splunk Enterprise to allow for an IDE/RAD development experience. In this article we are going to walk through creating an add on for Imperva’s Incapsula service the app name will be “<span class="s1">ta-cef-imperva-incapsula”. This is a very basic add-on I’ll write another post focusing on data on-boarding and the details that are important. This walkthrough focuses on the fully integrated use of the tools in your development activities.</span>

1. Create a new project locally
2. Develop the add-on including an event gen
3. Build, package and manually test
4. Create a bitbucket project
5. Build and package with pipelines for CI/CD
6. Publish your docs on “read the docs”
7. Publish your app on Splunkbase

In this walk through we will not have time to cover CIM mapping this event source stay tuned for a follow up.

Creating a new project
----------------------

- create a new directory “mkdir ta-cef-imperva-incapsula”
- cd to the directory “cd ta-cef-imperva-incapsula”
- Initialize git with the flow module “git flow init -d”
- Add the build tools submodule this does the heavy lifting of make for us “git submodule add -b master https://bitbucket.org/SPLServices/buildtools”
- Make a folder for dependencies “mkdir deps” 
  - Add eventgen “git submodule add -b master https://bitbucket.org/SPLServices/sa-eventgen.git deps/SA-Eventgen”
  - Add our parent TA “git submodule add -b master https://bitbucket.org/SPLServices/ta-cef-for-splunk.git deps/TA-cef-for-splunk”
- Copy the make file “cp buildtools/bootstrap/Makefile .”
- Copy the gitignore file “cp buildtools/bootstrap/.gitignore .gitignore”
- Copy the sample docs “cp -R buildtools/bootstrap/docs .”
- Copy the make config file “cp buildtools/bootstrap/common.mk .”
- Update the common.mk file “MAIN\_APP” must be updated at this point the other configuration can be updated later but must be reviewed and editor before release. This value should be the same as the folder name the app will be published in and confirm to the guidance in app.conf.spec package.id for this walk through we will use MAIN\_APP=TA-cef-imperva-incapsula-for-splunk
- create the folder src/$MAIN\_APP as updated above ie. “mkdir -p src/TA-cef-imperva-incapsula-for-splunk”
- copy the add on template to our working directory “cp -R buildtools/bootstrap/addon/\* src/TA-cef-imperva-incapsula-for-splunk/”
- copy the Splunk License “cp buildtools/bootstrap/license-eula.txt .”
- copy the pipelines configuration “cp buildtools/bootstrap/bitbucket-pipelines.yml .”
- Check our work “make package\_test” we expect one failure reported “Major.Minor.Revision” this is normal as development builds provide a version number pattern that is SEMVER compliant and is not allowed in Splunk base but is allowed in app.conf.spec
- browse to “out/package/splunkbase and verify the app is packaged

Developing our Add-on Word of Warning
-------------------------------------

This add-on takes advantage of existing sourcetype definitions in TA-cef-for-splunk in the parent sourcetype the “big 8” props are addressed. If you are following this to build a totally new add-on the best practices for your specific sourcetype should be considered.

Creating Samples and eventgen.conf
----------------------------------

We are using the samples provided by Imperva [here](https://docs.incapsula.com/Content/read-more/example-logs.htm#logEx1).

- rename the file in src/TA-cef-imperva-incapsula-for-splunk/samples from future.sample to imperva\_incapsula.sample
- Replace the sample file contents with the two CEF formatted events below

```
<pre class="wp-block-code">```
CEF:0|Incapsula|SIEMintegration|1|1|Illegal Resource Access|3| fileid=3412341160002518171 sourceServiceName=site123.abcd.info siteid=1509732 suid=50005477 requestClientApplication=Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0 deviceFacility=mia cs2=true cs2Label=Javascript Support cs3=true cs3Label=CO Support src=12.12.12.12 caIP=13.13.13.13 ccode=IL tag=www.elvis.com cn1=200 in=54 xff=44.44.44.44 cs1=NOT_SUPPORTED cs1Label=Cap Support cs4=c2e72124-0e8a-4dd8-b13b-3da246af3ab2 cs4Label=VID cs5=de3c633ac428e0678f3aac20cf7f239431e54cbb8a17e8302f53653923305e1835a9cd871db32aa4fc7b8a9463366cc4 cs5Label=clappsigdproc=Browser cs6=Firefox cs6Label=clapp ccode=IL cicode=Rehovot cs7=31.8969 cs7Label=latitude cs8=34.8186 cs8Label=longitude Customer=CEFcustomer123 ver=TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 start=1453290121336 request=site123.abcd.info/ requestmethod=GET qstr=p\=%2fetc%2fpasswd app=HTTP act=REQ_CHALLENGE_CAPTCHA deviceExternalID=33411452762204224 cpt=443 filetype=30037,1001, filepermission=2,1, cs9=Block Malicious User,High Risk Resources, cs9Label=Rule name
CEF:0|Incapsula|SIEMintegration|1|1|Normal|0| sourceServiceName=site123.abcd.info siteid=1509732 suid=50005477 requestClientApplication=Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0 deviceFacility=mia src=12.12.12.12 caIP=13.13.13.13 ccode=IL tag=www.elvis.com cicode=Rehovot cs7=31.8969 cs7Label=latitude cs8=34.8186 cs8Label=longitude Customer=CEFcustomer123 ver=TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 start=1453290121336 request=site123.abcd.info/main.css ref=www.incapsula.com/lama requestmethod=GET cn1=200 app=HTTP deviceExternalID=33411452762204224 in=54 xff=44.44.44.44 cpt=443
```
```

- Create a new file src/TA-cef-imperva-incapsula-for-splunk/default/eventgen.conf this file will replace our samples generated above more advanced config is possible but out of the scope of this tutorial.

```
<pre class="wp-block-code">```
[imperva_incapsula.sample]
source=/var/syslog/remote/incapsula.log
sourcetype=cef:file
#mode = replay
timeMultiple = 2
backfill = -15m

token.0.token = \d{13}
token.0.replacementType = timestamp
token.0.replacement = %s
```
```

- Create a new file src/TA-cef-imperva-incapsula-for-splunk/default/props.conf use the following content initially we will do more work on this later, right now all we need to do is setup index time transforms

```
<pre class="wp-block-code">```
[cef:syslog]
TRANSFORMS-zzTACEFimpervaincapsula = ta_cef_imperva_incapsula_for_splunk_v0_source

[cef:file]
TRANSFORMS-zzTACEFimpervaincapsula = ta_cef_imperva_incapsula_for_splunk_v0_source
```
```

- Create a new file src/TA-cef-imperva-incapsula-for-splunk/default/transforms.conf use the following content initially we will do more work on this later, right now all we need to do is setup index time transforms

```
<pre class="wp-block-code">```
[ta_cef_imperva_incapsula_for_splunk_v0_source]
DEST_KEY=MetaData:Source
REGEX = CEF:\d+\|Incapsula\|SIEMintegration\|[^\|]*\|[^\|]*\|[^\|]*\|[^\|]*\|
FORMAT= source::Imperva:Incapsula
```
```

- Check our work so far. use “make docker\_dev” to start a splunk instance and enable event gen. Using search verify records match the search “source=”Imperva:Incapsula” sourcetype=cef”

Creating the first release
--------------------------

We will use git flow to tag and create the first release

- add working files to git “git add .”
- add a comment and checkin git commit -m “Initial work”
- Start the release process “git flow release start 0.1.0”
- edit the version in src/TA-cef-imperva-incapsula-for-splunk/default/app.conf to “0.1.0”
- git add src/TA-cef-imperva-incapsula-for-splunk/default/app.conf
- git commit -m “bump version”
- git flow release finish ‘0.1.0’ #note each comments screen must have some form of comments. “Create release” will do for now
- 

Add our package to bitbucket
----------------------------

I use bitbucket but another vcs such as github will do CI/CD processes will be different and require your own creativity for integration.

- Using your organization’s account create a new repository named “ta-cef-imperva-incapsula” I enable issue tracker and use a public repository
- Follow instructions to “Get your local Git repository on Bitbucket”
- Push your other tags “git push –all –follow-tags”
- Navigate to bitbucket settings
- Select Branching Model
  - Select “develop” for development branch
  - Select “master” for main branch
  - Check each of the boxes and click save (keep defaults)
- Navigate to pipeline/settings
  - Use the toggle to enable
  - Click Configure which should show “Hooray”
- 

Edit our docs
-------------

The documentation uses restructureText in a similar what to the python documentation project. Review and update docs/index.rst view our copy on bitbucket for an up to date [example](https://bitbucket.org/SPLServices/ta-cef-imperva-incapsula/src/master/docs/index.rst).

Publish our docs
----------------

Login to readthedocs.io and following provided instructions connect your bitbucket account to readthedocs.io and publish the docs.

Continue development
--------------------

Continue development to completion a future article may elaborate on how to optimize this source for CIM and enterprise security.

Publish our 1.0.0 version to our VCS
------------------------------------

Once development and testing is complete we are ready to publish 1.0.0.

- Ensure no working files are dirty “git status”
- git flow release start 1.0.0
- edit the version in src/TA-cef-imperva-incapsula-for-splunk/default/app.conf to “0.1.0”
- git add src/TA-cef-imperva-incapsula-for-splunk/default/app.conf
- git commit -m “bump version”
- git flow release finish ‘0.1.0’ #note each comments screen must have some form of comments. “Create release” will do for now
- publish the release to bitbucket “git push –all –follow-tags”
- navigate to bitbucket and select “pipelines” in navigation
- Remember: “develop” builds will fail due to a fatal error reported by appinspect. This is presently normal
- Wait for the master build to complete (success)
- Navigate to downloads and find the “1.0.0” release package and download.

Publish our release to Splunkbase
---------------------------------

With each “release” we can download a “app inspected” package ready for Splunkbase. Follow the on page instructions to publish your app at splunkbase.splunk.com