---
title: 'Syslog server you say'
date: '2019-10-16T18:23:00-05:00'
status: publish
permalink: /2019/10/16/syslog-server-you-say
author: ryan@dss-i.com
excerpt: ''
type: post
id: 710
category:
    - Uncategorized
tag:
    - Splunk
    - syslog
    - syslog-ng
post_format: []
---
I’ve had quite a bit to say about syslog as a component of a streaming data architecture primarily feeding Splunk Enterprise (or Enterprise Cloud). In seven days I will be presenting the culmination of small developments that have taken shape into the brand new Splunk Connect for Syslog (SC4S).

You don’t have to wait swing over via Splunk Base <https://splunkbase.splunk.com/app/4740/#/details>

SC4S is designed to:

Do the heavy lifting of deploying a functioning current build of the awesome syslog-ng OSE (3.24.1 as of this posting).

Support many popular syslog vendor products OOB with zero configuration or as little configuration as a host glob or IP address

Scale your Splunk vertically by very evenly distributing events across indexers by the second

Scale your syslog-ng servers by reducing constrains on CPU and disk

Reduce your exposure to data loss by minimizing the amount of data at rest on the syslog-ng instance

Promote great practices and collaboration. SC4S is a liberally licensed open source solution. We will be able to collaborate directly with the end users on filters and usage to promote great big data deployments.

Personal thanks to many but especially Mark Bonsack and Balazs Scheidler (syslog-ng creator)