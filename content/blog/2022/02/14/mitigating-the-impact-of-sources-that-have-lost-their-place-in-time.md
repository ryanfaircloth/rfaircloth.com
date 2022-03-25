---
title: 'Mitigating the impact of sources that have lost their place in time'
date: '2022-02-14T11:56:05-05:00'
status: publish
permalink: /2022/02/14/mitigating-the-impact-of-sources-that-have-lost-their-place-in-time
author: ryan@dss-i.com
excerpt: ''
type: post
id: 918
category:
    - Uncategorized
tag: []
post_format: []
---
There are certain things in machine data that can not be forgiven.

- Correct identification of time in UTC (time offsets are fine)
- Correct identification of metadata at write time (what kind of data is this)
- Correct breaking of “events” where does an event end and the next begin
- Correct storage of data for access control and retention.

Getting these values wrong can prevent events from being found at all. Events with dates in the past won’t be found by alerting searches ever. Events from the future will cause performance harm in the future when data is accessed from slow storage as well as wasted space due to over retention.

Some Splunky things you should do now to improve performance and usability

```
<pre class="wp-block-code">```
#indxes.conf
[default]
# This is already set for you on Splunk Cloud, if you have been living under a rock add
# this to indexes.conf and monitor for any new data in index=main as this is
# a likely indicator of a mistake
lastChanceIndex = main
# Keep bucket spans to no more than 12 hours. This helps performance with slow storage and typical search profiles for indexes with low total daily volume. High volume indexes will continue to roll based on size
maxHotSpanSecs = 43200
# Data from the future is not normal routing such data to quarantine prevents excessive retention.
quarantineFutureSecs = 86401
# We set this to default of one day to ensure data that is incorrectly time stamped is correctly retained per retention settings. On some indexes such as those from third party threat detection systems may send "old" events by design indexes should be configured specifically for those indexes don't mix "old and batch" with real time streaming sources
quarantinePastSecs = 86401
# Once this is set you can not roll back to versions prior to 7.2 for most deployments this is safe wait until you have upgraded to a 7.2 + version for 30 days if you currently are on unsupported versions
journalCompression = zstd

# more compact (better performance) use of tsidx for DMA
tsidxWritingLevel = 4

# props.conf
[default]
# this change will potentially "break differenly" some improperly onboarded log sources.
# When no configuration is provided Splunk will try to guess how to break events this 
# requires holding data in memory as the Splunk indexer deployment scales to more indexers 
# this can be increasingly painful its better to turn it off which will result in 
# single line events and configure sourcetypes properly as needed
SHOULD_LINEMERGE = false
# related to <meta charset="utf-8"></meta>quarantinePastSecs in indexes.conf this setting mitigates the impact of bad dates but must be set per source/sourcetype for the exception cases where this is valid
MAX_DAYS_AGO = 1
MAX_DAYS_HENCE = 1

```
```

The benefit of the application of these settings is a mitigation of the impact of badly setup data. While data will continue to have reduced value the impact will be short-lived and will dissipate rapidly as individual sources are corrected.