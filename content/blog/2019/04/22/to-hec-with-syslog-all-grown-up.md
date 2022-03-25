---
title: "To HEC with syslog All grown up"
date: "2019-04-22T09:18:30-05:00"
status: publish
permalink: /2019/04/22/to-hec-with-syslog-all-grown-up
author: ryan@dss-i.com
excerpt: ""
type: post
id: 652
category:
  - Uncategorized
tag: []
post_format: []
---

A few years ago flying across the Atlantic, unable to sleep, I had an idea to integrate common syslog aggregation servers using Splunk’s new HTTP event Collector rather than file and the tired and true Universal Forwarder. This little idea implemented in python started solving real problems of throughput and latency while reducing the complexity of configuring syslog aggregation servers. I’m very pleased to say the [python script](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src) I created is now obsolete. Leading syslog server products syslog-ng and rsyslog upstreams have implemented maintained modules. Even more exciting Mark Bonsack has invested considerable time to further develop modular configuration for both to make getting data though syslog and into Splunk even easier!

Native syslog –&gt; http event collector modules

- [Syslog-NG](https://support.oneidentity.com/technical-documents/syslog-ng-premium-edition/7.0.12/administration-guide/sending-and-storing-log-messages-%E2%80%94-destinations-and-destination-drivers/splunk-hec-sending-messages-to-splunk-http-event-collector/)
- [RSYSLOG](https://www.rsyslog.com/doc/v8-stable/configuration/modules/omhttp.html?highlight=omhttp)

Modular Configuration Repositories

- [Syslog-NG](https://bitbucket.org/SPLServices/splunk-syslog-ng)
- [RSYSLOG](https://bitbucket.org/SPLServices/splunk-rsyslog.)

# Quick Public Service Notice

While all linux distributions include a syslog server this should NOT be used as the production syslog aggregation solution. Linux distros are often many point releases or worse selectively back port patches based only on their own customer reported issues. Before attempting to build a syslog aggregation solution for production it is critical you source current upstream binaries or build your own.
