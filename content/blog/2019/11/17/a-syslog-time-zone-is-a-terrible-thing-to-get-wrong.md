---
title: 'A syslog time zone is a terrible thing to get wrong'
date: '2019-11-17T20:17:14-05:00'
status: publish
permalink: /2019/11/17/a-syslog-time-zone-is-a-terrible-thing-to-get-wrong
author: ryan@dss-i.com
excerpt: ''
type: post
id: 734
category:
    - Uncategorized
tag: []
post_format: []
---
Splunk release 1.2.0 of Splunk Connect for syslog today. This release focused on timezone management. We all wish time was standardized on UTC many of us have managed to get that written into approved standards but did not live to see the implementation of it. SC4S 1.2.0 enables the syslog-ng feature “guess-timezone” allowing the dynamic resolution of time zone of those poorly behaving devices relative to UTC. As a fall back or to deal with devices that batch/or stream with high latency device TZ can be managed at the host/ip/subnet level. Ready to upgrade? If you are running the container version just restart SC4S this feature is auto-magic.

Want to know more about SC4S Checkout these blog posts.

- Part 1: [https://www.splunk.com/en\_us/blog/tips-and-tricks/splunk-connect-for-syslog-turnkey-and-scalable-syslog-gdi.html](https://www.splunk.com/en_us/blog/tips-and-tricks/splunk-connect-for-syslog-turnkey-and-scalable-syslog-gdi.html)
- Part 2: [https://www.splunk.com/en\_us/blog/tips-and-tricks/splunk-connect-for-syslog-turnkey-and-scalable-syslog-gdi-part-2.html](https://www.splunk.com/en_us/blog/tips-and-tricks/splunk-connect-for-syslog-turnkey-and-scalable-syslog-gdi-part-2.html)