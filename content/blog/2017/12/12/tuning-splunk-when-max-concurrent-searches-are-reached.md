---
title: 'Tuning Splunk when max concurrent searches are reached'
date: '2017-12-12T11:11:15-05:00'
status: publish
permalink: /2017/12/12/tuning-splunk-when-max-concurrent-searches-are-reached
author: ryan@dss-i.com
excerpt: ''
type: post
id: 478
category:
    - Uncategorized
tag: []
post_format: []
---
Your searches are queued but you have cores, memory and IO to spare? Tuning your limits can allow Splunk to utilize “more” of your hardware when scaled up instances are in use.

**Warnings**

This approach is **NOT** useful when searches run **LONG.** If regular searches such as datamodel acceleration, summary and reporting searches are not completing inside of the expected/required time constraints this information could make the symptoms *<span style="text-decoration: underline;">**worse**</span>*.

This approach is useful when searches consistently execute faster than the required times for datamodel acceleration, summary and reporting and additional searches are queued while the utilization of cpu, memory, storage IOPS, storage bandwidth are well below the ***validated*** capacity of the infrastructure.

Details
-------

First in all certain versions of Splunk apply the following setting to disable a feature that can slow search initialization.

$SPLUNK\_HOME/etc/local/limits.conf

$SPLUNK\_HOME/etc/master-apps/\_cluster/local/limits.conf

```
[search]
#Splunk version >=6.5.0 <6.5.6
#Splunk version >=6.6.0 <6.6.3
#Not required >7.0.0
#SPL-136845 Review future release notes to determine if this can be reverted to auto
max_searches_per_process = 1
```

On the search head only where DMA is utilized (ES) update the following

$SPLUNK\_HOME/etc/local/limits.conf

```
#this is useful when you have ad-hoc to spare but are skipping searches (ES I'm looking at you) or other 
# home grown or similar things
[scheduler]
max_searches_perc = 75
auto_summary_perc = 100
```

Evaluate the load percentage on the search heads and indexers including memory, cpu utilized and memory utilized. We can increase the value of base\_max\_searches in increments of 10 to allow more concurrent searches per SH until one of the following occurs

- CPU or memory utilization is 60% on IDX or SH
- IOPS or storage throughput hits ceiling and no longer increases decrease the system is fully utilized to prevent failure due to unexpected load decrement the base\_max\_searches value by 10 and confirm IOPS is no longer constant.
- Skipping /queuing no longer occurs (increase by 1-3 additional units from this point to provide some “head room”

```
#limits.conf set SH only
[search]
#base value is 6 increase by 10 until utilization on IDX or SH is at 60% CPU/memory starting with 20
#base_max_searches = TBD
```