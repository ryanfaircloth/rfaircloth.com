---
title: "Trust but verify your logs might be lieing to you aka, the case for network tap traffic monitoring"
date: "2017-03-08T09:55:18-05:00"
status: publish
permalink: /2017/03/08/trust-verify-logs-might-lieing-aka-case-network-tap-traffic-monitoring
author: ryan@dss-i.com
excerpt: ""
type: post
id: 426
category:
  - Uncategorized
tag: []
post_format: []
---

I really do “get” it, logging and monitoring can be very costly, we all agree not nearly as costly as a breach. Each organization is struggling to ensure they log enough to see detection and value while being good stewards of their company budget. It has been a day reading vault 7 leaks and I see honestly not much that surprises me. I do see something worth a strong restatement, that is an encouragement to rethink what you log and how you log it. The CIA has a very cool (sorry hacker at heart) tool we have known about for some time but have not been able to talk about. Their tool “Drillbit” allows the creation of a covert tunnel using common cisco gear in such a way typical monitoring and logging using IDS and firewalls will not identify. American companies should note criminal gangs and foreign governments certainly have similar capabilities. Splunk has your back if you are willing to let us. Using [Splunk Stream](https://splunkbase.splunk.com/app/1809/) and proper sensor placement we can collect data from the inside and outside of your firewall that can be used to identify covert tunnels. Detection should be performed three approaches. The danger these leaks are presenting you is an increased awareness of the effectiveness of these techniques, encouraging the advancement of commodity cybercrime toolkits with ever more difficult to detect features. Don’t use cisco, sorry bad news is almost every major gear vendor has been exploited with similar approaches

- Static Rules such as
  - This not that “Stream identified traffic not in firewall logs”
  - New patterns in DNS, NTP, GRE flows
  - Change/login to firewall or switch not associated with a change record
- Threat List Enrichment and detection
  - Source and Destination traffic on quality threat lists. Traffic for protocols other than http(s) and DNS should be treated with high or critical priority
- Machine Learning
  - Anomalous egress traffic by source from network devices
  - Anomalous admin connections by source to network devices
