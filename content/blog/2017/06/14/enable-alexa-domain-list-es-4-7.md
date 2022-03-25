---
title: 'How to enable the Alexa Domain list in ES 4.7'
date: '2017-06-14T07:52:42-05:00'
status: publish
permalink: /2017/06/14/enable-alexa-domain-list-es-4-7
author: ryan@dss-i.com
excerpt: ''
type: post
id: 458
category:
    - Uncategorized
tag: []
post_format: []
---
This post is short and sweet, in ES 4.7 the Alexa download is not enabled by default enabling and using this list which can be very valuable in domain/fqdn based analysis is a simple two step process

1. Navigate to Enterprise Security –&gt; Configure –&gt; Threat Intelligence Downloads 
  1. Find Alexa
  2. Click enable
2. Navigate to Splunk Settings –&gt; Search Reports and Alerts 
  1. Select “All” from the app drop down
  2. Search for “[Threat – Alexa Top Sites – Lookup Gen](https://srvsplunkidx.ad.southsideag.com:8000/en-US/manager/SplunkEnterpriseSecuritySuite/saved/searches?app=&count=10&offset=0&itemType=&owner=&search=alexa#)“
  3. Click Edit under actions and then enable
  4. Optional Click Edit under actions again and cron schedule, Set the task to daily execution 03:00 with an auto window. This reduces the chances the list will not be updated if skipped due to search head maintenance.
  5. Optional the OOB gen search creates a large dispatch directory entry which is not desirable on search head clusters or where disk space is premium such as public clouds. Update the search as follow (appending the stats count) to prevent creation of a result set on the search head | inputthreatlist alexa\_top\_one\_million\_sites fieldnames=”rank,domain” | outputlookup alexa\_lookup\_by\_stra **<span style="color: #000000;">*| stats count*</span>**
  6. Click “Run” to build the list so you can have it right now