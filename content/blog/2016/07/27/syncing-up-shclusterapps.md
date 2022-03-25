---
title: "Syncing up shclusterapps"
date: "2016-07-27T05:01:33-05:00"
status: publish
permalink: /2016/07/27/syncing-up-shclusterapps
author: ryan@dss-i.com
excerpt: ""
type: post
id: 376
category:
  - Uncategorized
tag:
  - Deployment
  - "Enterprise Security"
  - SHC
  - shcluster
  - Splunk
post_format: []
---

This one is short and sweet, when building a Splunk search head cluster we often will create a search head unattached to indexers to “stage” .spl deployments, configure THEN update shcluster/apps and push the following rsync command does this for you and obeys the golden rule to avoid default core apps. The list is correct as of 6.4.1 update as needed for new versions and be sure to exclude anything like an “app” containing deployment client

> rsync –verbose –progress –stats –recursive –times –perms \\  
> –exclude alert_logevent \\  
> –exclude launcher \\  
> –exclude SplunkForwarder \\  
> –exclude alert_webhook \\  
> –exclude learned \\  
> –exclude splunk_httpinput \\  
> –exclude appsbrowser \\  
> –exclude legacy \\  
> –exclude SplunkLightForwarder \\  
> –exclude framework \\  
> –exclude sample_app \\  
> –exclude splunk_management_console \\  
> –exclude gettingstarted \\  
> –exclude search \\  
> –exclude\*\_deploymentclient\*\* \\  
> –exclude introspection_generator_addon \\  
> –exclude splunk_archiver \\  
> –exclude user-prefs \\  
> /opt/splunk/etc/apps/\* /opt/splunk/etc/shcluster-test/apps
