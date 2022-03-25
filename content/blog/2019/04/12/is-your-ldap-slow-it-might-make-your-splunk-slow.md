---
title: "Is your LDAP Slow? It might make your Splunk Slow"
date: "2019-04-12T10:04:00-05:00"
status: publish
permalink: /2019/04/12/is-your-ldap-slow-it-might-make-your-splunk-slow
author: ryan@dss-i.com
excerpt: ""
type: post
id: 650
category:
  - Uncategorized
tag: []
post_format: []
---

I’ve had this crop up enough times, I think its worth a short post. Most Splunk deployments use local and/or LDAP authentication. LDAP configuration is something of a black art and often the minimal configuration that works is the first and last time this is considered. It is worth your time as an administrator to optimize your LDAP configuration or better yet move to the more secure and reliable SAML standard.

Things to consider

- Stop using LDAP and use SAML
- LDAP authentication should never be enabled on indexers. If you have enabled LDAP authentication remove this. Indexers rarely require authentication, when required only applicable to admins and then under very strict conditions.
- Ensure the Group BIND and Group Filters are both in use and limit the groups to only those required for Splunk access management
- Ensure the User BIND and User Filters are appropriate to limit the potential users to only those users who may login to Splunk.
- Validate the number of users returned by the LDAP query used is under 1000 or increase the number of precached users via limits.conf to an appropriate number.
- Ensure DNSMASQ or an alternative DNS cache client is installed on Linux Search Heads and Indexers.

Stages to LDAP Auth

- Interactive User Login (ad-hoc search) or scheduled report execution
- Check User Cache if not cached or cache expired
- DNS lookup to resolve the LDAP host to IP (This is the reason DNS Cache on linux is important)
- TCP Connection to LDAP Server
- Post query for specific user to LDAP
- Wait for response
- Process Referrals if applicable by repeating the above sequence

The time taken for each DNS query and LDAP query is added to the time taken too login to the Splunk UI, execute an ad-hoc search OR scheduled report. Its important to ensure the DNS and LDAP infrastructure is highly available and able to service potentially thousands of requests per second. Proper use of caching ensures resources on the Splunk Server including TCP client sessions are not exhausted causing users to wait in line for their turn at authentication or worst case time outs and authorization failures.
