---
title: "Share that search! Building a content pack for Splunk Enterprise Security 4.0+"
date: "2016-01-07T06:29:22-05:00"
status: publish
permalink: /2016/01/07/shareable-content-for-splunk-enterprise-security
author: ryan@dss-i.com
excerpt: ""
type: post
id: 158
category:
  - Security
  - Splunk
  - Uncategorized
tag:
  - "Enterprise Security"
  - Splunk
  - "Use Case"
post_format: []
---

Splunk has initial support for export of “content” which can be dashboards and correlation searches created by the user to share with another team. What if you need to be a little more complex for example including a lookup generating search? This will get a little more complicated but very doable by the average admin. Our mission here is to implement UC0029. What is UC0029 glad you ask Each new malware signature detected should be reviewed by a security analyst to determine if proactive steps can be taken to prevent infection. We will create this as a notable event so that we can provide evidence to audit that the process exists and was followed.

Source code will be provided so I will not detail step by step how objects will be created and defined for this post

# UC0029 Endpoint new malware detected by signature

My “brand” is SecKit so you will see this identifier in content I have created alone or with my team here at Splunk. As per our best practice adopt your own brands and use appropriately for your content. There is no technical reason to replace the “brand” on third party content you elect to utilize.

Note ensure all knowledge objects are exported as all app’s owned by admin as you go

- Create a DA-ESS-SecKit-EndpointProtection
  - This will contain ES specific content such as menus dashboards, and correlation searches
- Create the working app SA-SecKit-EndpointProtection
  - This will contain props transforms lookups and scheduled searches created outside of ES
- Create the lookup seckit_endpoint_malware_tracker this lookup will contain each signature as it is detected in the environment and some handy information such as the endpoint first detected, user involved and the most recent detection.
- Create empty lookup CSV files
  - seckit_endpoint_malware_tracker.csv (note you will not ship this file in your content pack)
  - seckit_endpoint_malware_tracker.csv.default

Build and test the saved search SecKit Malware Tracker – Lookup Gen. This search will use tstats to find the first and last instance of all signatures in a time window and update the lookup if an earlier or later instance is found

Build and test the correlation search UC0029-S01-V001 New malware signature detected. This search will find “new” signatures from the lookup we have created and create a notable event”Make it default” In both apps move content from local/ to default/ this will allow your users to customize the content without replacing the existing searches”Turn if off by default” It is best practice to ensure any load generating searches are disabled by default add disabled=1 to each savedsearches.conf stanza that does not end in”- Rule”add disabled=1 to each correleationsearches.conf

Create a spl (tar.gz) containing both apps createdWrite a blog post explaining what you did, how the searches work and share the code!Gain fame and respect maybe a fez or a cape

The source code

<https://bitbucket.org/rfaircloth-splunk/securitykit/src/1ea60c46b685622116e28e8f1660a6c63e7d9e96/base/ess/?at=master>

Bonus: Delegate administration of content app

1. Using your favorite editor edit app/metadata/local.meta
2. Update the following permisions adding “ess_admin” role

> \## access = read : \[ \* \], write : \[ admin,role2,role3 \]  
> \[savedsearches\]  
> access = read : \[ \* \], write : \[ admin,<span style="color: #ff00ff;">ess_admin </span>\]
>
> \[correlationsearches\]  
> access = read : \[ \* \], write : \[ admin,<span style="color: #ff00ff;">ess_admin</span> \]
