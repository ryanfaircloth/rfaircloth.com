---
title: "Good Assets and Identities make for big bundles"
date: "2017-02-28T12:26:00-05:00"
status: publish
permalink: /2017/02/28/good-assets-identities-make-big-bundles
author: ryan@dss-i.com
excerpt: ""
type: post
id: 413
category:
  - Uncategorized
tag: []
post_format: []
---

Having great and informative data will make for some hefty lookups. I’ve heard from a few customers that run into this rather than plan for it so let us talk about the levers we need to pull.

- Don’t wait around upgrade to Splunk Enterprise 6.5.2+ Now is the time
- Don’t wait any longer upgrade to Splunk Enterprise Security 4.5.1 the dev team invested in improvements to assets and identities lookups that also improve by decreasing the size of the merged lookups.
- Update server.conf on the indexers and search head cluster peers.

> `<span class="pun">[</span><span class="pln">httpServer</span><span class="pun">]</span>`
>
> <span class="pln" style="font-family: Consolas, Monaco, 'Lucida Console', monospace; font-size: 0.857143rem;">max_content_length </span><span class="pun" style="font-family: Consolas, Monaco, 'Lucida Console', monospace; font-size: 0.857143rem;">= 1610612736 # 1.5 GB</span>

- Update distsearch.conf to better replication on the SH/SHC

> ```
> <pre class="mw-collapsed">[replicationSettings]
> # 1.5 GB with encoding room this will increase the memory utilization while decreasing CPU utilization
> maxMemoryBundleSize = 1700
> #1.5 GB to match server.conf on the other side
> maxBundleSize = 1536
> ```
