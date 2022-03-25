---
title: "Outage due to DDOS"
date: "2017-07-09T11:47:29-05:00"
status: publish
permalink: /2017/07/09/outage-due-to-ddos
author: ryan@dss-i.com
excerpt: ""
type: post
id: 466
category:
  - Uncategorized
tag: []
post_format: []
---

> The sites been down for a few days, BlueHost has been suffering from a DDOS on at least one of the sites they host. My site shared infrastructure. for $3.95 a month I don’t expect too much but having some ability to move sites to new hosts would be nice. Anyways, I’m up on Azure now until I decide if I want to be my own webmaster or revert to paying someone else to pretend to worry about things like that. On the plus side of things, the outage forced me to update the site infrastructure. Now using certificates from Let’s Encrypt. If you have CLI access to your apache hosted site, super easy and free to enable good encryption.
>
> <span class="s1">sudo certbot –apache -d www.rfaircloth.com -d rfaircloth.com -d rfaircloth.westus.cloudapp.azure.com –must-staple –redirect <span class="Apple-converted-space"> </span>–hsts <span class="Apple-converted-space"> </span>–uir –rsa 4096</span>
