---
title: 'MaxMind Databases and Splunk Enterprise'
date: '2020-11-13T20:49:06-05:00'
status: publish
permalink: /2020/11/13/maxmind-databases-and-splunk-enterprise
author: ryan@dss-i.com
excerpt: ''
type: post
id: 844
category:
    - Uncategorized
tag: []
post_format: []
---
I’ve finally been able to take a couple of days and update and refresh my MaxMind Add-on for Splunk Enterprise and Enterprise Cloud. The latest version of the add-on updates the GeoIP2 library allowing for additional fields from the licensed anonymous IP database. It also built and tested using the new Addonfactory CI/CD infrastructure at Splunk. (See my conf talk). This is a major version as it introduces a requirement for python3 and thus Splunk Enterprise 8.0&gt; because GeoIP2 is now python3 only. Older versions should still work for now if you can not upgrade. Head over to Splunkbase to get it now [https://splunkbase.splunk.com/app/3022/ ](https://splunkbase.splunk.com/app/3022/%20)