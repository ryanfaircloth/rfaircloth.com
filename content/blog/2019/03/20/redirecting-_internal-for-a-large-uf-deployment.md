---
title: "Redirecting _internal for a large forwarder deployment"
date: "2019-03-20T20:43:43-05:00"
status: publish
permalink: /2019/03/20/redirecting-_internal-for-a-large-uf-deployment
author: ryan@dss-i.com
excerpt: ""
type: post
id: 634
category:
  - Uncategorized
tag: []
post_format: []
---

Sometimes it is not noticed because there is no license charge associated with Splunk’s Universal forwarder internal logs and in some cases heavy forwarders. In very large deployments this can be a significant portion of storage used per day. Do you really need to keep those events around as long as the events associated with the Splunk Enterprise instances probably not.

## License Warning – Updated

It has been pointed out this change WILL impact license on recent versions of Splunk in older versions and customers with EAA agreements in place this is OK. If you are on a recent (not sure which version) this change will impact license.

## Warning!

The following changes will disable the Splunk Monitoring consoles built in forwarder monitoring feature. You can customize the searches but be aware this is not upgrade safe.

## Second Warning!

If you have any custom forwarder monitoring searches/dashboards/alerts they may be impacted.

## Define an index

The index we need to define is \_internal_forwarder the following sample configuration will allow us to keep about 3 days of data from our forwarders adjust according to need.

````
<pre class="wp-block-code">```
[_internal_forwarder]
maxWarmDBCount = 200
frozenTimePeriodInSecs = 259200
quarantinePastSecs = 459200
homePath = $SPLUNK_DB/$_index_name/db
coldPath = $SPLUNK_DB/$_index_name/colddb
thawedPath = $SPLUNK_DB/$_index_name/thaweddb
maxHotSpanSecs = 43200
maxHotBuckets = 10
````

```

Change the index for internal logs
----------------------------------

We need to create a new “TA” named “Splunk\_TA\_splunkforwarder we will CAREFULLY use the DS to push this to forwarders only. DO NOT push this to any Splunk Enterprise instance (CM/LM/MC/SH/IDX/deployer/ds) but you may push this to a “heavy” or intermediate forwarder. The app only needs two files in default app.conf and inputs.conf

```

<pre class="wp-block-code">```
#app.conf
[install]
state_change_requires_restart = true
is_configured = 0
state = enabled
build = 2

[launcher]
author = Ryan Faircloth
version = 1.0.0

[ui]
is_visible = 0
label = Splunk_UF Inputs

[package]
id = Splunk_TA_splunkforwarder
```
```

```
<pre class="wp-block-code">```
#inputs.conf
[monitor://$SPLUNK_HOME/var/log/splunk]
index = _internal_forwarder
```
```

Check our Work
--------------

First lets check positive make sure UFs have moved to the new index, we should get results.

```
<pre class="wp-block-code">```
index=_internal_forwarder source=*splunkforwarder*
```
```

Second lets check the negative make sure only UF logs got moved we should get no results

```
<pre class="wp-block-code">```
index= _internal_forwarder source=*splunk* NOT source=*splunkforwarder*
```
```

Updates
-------

- Index definition example used “\_internal” rather than “\_internal\_uf”
- renamed app to “Splunk\_TA\_splunkforwarder
- renamed index to \_internal\_forwarder
