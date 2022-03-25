---
title: "Five things you can do now to get ready for Splunk Smart Store"
date: "2019-03-07T10:46:56-05:00"
status: publish
permalink: /2019/03/07/five-things-you-can-do-now-to-get-ready-for-splunk-smart-store
author: ryan@dss-i.com
excerpt: ""
type: post
id: 626
category:
  - Uncategorized
tag: []
post_format: []
---

Splunk’s [SmartStore](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/AboutSmartStore) technology is a game changing advancement in data retention for Splunk Enterprise. Allowing Splunk to move least used data to an AWS for low cost “colder storage”.

## Reduce the maximum size of a bucket

We will review indexes.conf on the indexer and identify any references to the setting maxDataSize. Common historical practice has been to increase the size of this setting from the default of auto to an arbitrary large value or auto_high_volume. SmartStore is optimized and enforces the use of “auto” or 750mb as the max bucket size. This task should be completed at least 7 days prior cutover to SmartStore.

## Reduce the maximum span of a bucket

We will review indexes.conf and identify all indexes which continuously stream data. Common historical practice to leave this as default value which are very wide this increases the likely a user will retrieve buckets from S3 that do not actually meet their needs. We will determine a value of maxHotSpanSecs that will SmartStore to uncache buckets not used while also keeping buckets available likely to be used. Often 1 day (86400s) is appropriate.

- What is the time window a typical search will use for this index relative to now i.e 15 min, 1 day, 3 days, 1 week
- What span of time would allow a set of buckets to contain the events for the user search without excessive “extra” events. For example if the span is 90 days and the users primarily only work with 1 days worth of events therefore 89 days of events will use cache space in a wasteful way.

## Review Getting Data In problems impacting bucket use

Certain oversights in onboard data into Splunk impact both use-ability of data and performance review and resolve any issues identified by the Splunk Monitoring Console page [Data Quality](https://docs.splunk.com/Documentation/Splunk/7.2.4/DMC/Dataquality) the most important indicators of concern are

- <div class="li_content">time stamp extraction</div>
- <div class="li_content">time zone detection</div>
- <div class="li_content">indexing latency (`_indextime - _time`)</div>

One common source of “latency” is events from offline endpoints such as windows laptops. Any endpoint that can spool locally for an undetermined period of time then forward old events should be routed to a index not used for normal streaming events. For example “oswinsec” is the normal index I use for Windows Security Events however for endpoint monitoring I use “oswinsecep”.

## Review bucket roll behavior

After the above activities are done, wait an hour before beginning this work. We should identify pre-mature bucket roll behavior that is buckets rolled from hot to warm regularly for not great reasons. The following search

```
index=_internal source="/opt/splunk/var/log/splunk/splunkd.log"
component=HotDBManager evicting_count="*"
| stats max(maxHotBuckets) values(count) as reason count by idx
| sort -count
```

This search identifies buckets which are “high volume” and rolling due to lack of an available bucket to index a new event in correct relative order. For each index where the maxHotBuckets is less than 10 increase the value of maxHotBuckets in indexes.conf to no more than 10. For these indexes 10 is a safe value.
