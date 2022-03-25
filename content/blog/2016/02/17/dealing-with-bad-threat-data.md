---
title: "Dealing with bad threat data"
date: "2016-02-17T04:04:16-05:00"
status: publish
permalink: /2016/02/17/dealing-with-bad-threat-data
author: ryan@dss-i.com
excerpt: ""
type: post
id: 350
category:
  - Security
  - Splunk
tag:
  - "Enterprise Security"
  - Splunk
  - "Threat Lists"
post_format: []
---

Every now and then a threat data provider will include invalid entries in their threat list creating loads of false positives in Enterprise Security. For “reasons” namely performance ES will append new entries to the internal threat system but does not remove entries no longer present in a source. You can easily clear an entire threat collection which will allow your system to reload from the current sources.

splunk stop  
splunk clean inputdata threatlist  
splunk clean inputdata threat_intelligence_manager  
splunk start  
splunk clean kvstore -app DA-ESS-ThreatIntelligence -collection <collection>Common values for collection are http_intel and domain_intel

</collection>
