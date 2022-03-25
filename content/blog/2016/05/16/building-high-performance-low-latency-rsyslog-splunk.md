---
title: 'Building High Performance low latency rsyslog for Splunk'
date: '2016-05-16T08:15:12-05:00'
status: publish
permalink: /2016/05/16/building-high-performance-low-latency-rsyslog-splunk
author: ryan@dss-i.com
excerpt: ''
type: post
id: 369
category:
    - Uncategorized
tag: []
post_format: []
---
This is a brief followup on my earlier post in a very large scale environment write -&gt; monitor –&gt; read between a log appending source such as rsyslogd and Splunk can impact the latency of log data entry into the destination environment. Last week I stumbled onto a feature of Rsyslog developed a couple of major versions ago that has been very under appreciated. OmProgram allows a developer to receive events from rsyslog using any program without first waiting for disk write. I’ve developed a little bit of code allowing direct transfer of events to Splunk using the http collector download and try it out.

What the output module allows for is direct scale-able transfer between rsyslog and splunk in native protocols. Ideal use cases include dynamically scaling cloud environments and embedded devices where agents are not acceptable.

Credits

- Rsyslog dev team for making this possible and Rainer for this [presentation](http://www.rsyslog.com/rsyslog-v8-improvements-and-how-to-write-plugins-in-any-language/) that inspired me
- Splunk dev team for the really awesome http event collector and George who developed the [python class interface ](http://blogs.splunk.com/2015/12/11/http-event-collect-a-python-class/)
- Splunk Stream team who added direct event collector usage in stream 6.5 proving significant scale.

Setup

- Setup http event collector behind a load balancer
- Note your token
- Install requests using apt,yum or pip http://docs.python-requests.org/en/master/user/install/
- If using certificate verification setup what is required for requests
- “git” the code https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src
- place [omsplunkhec.py](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src/ae4c14509a181b7f543382be75d76a0393f9c937/omsplunkhec.py?at=master "omsplunkhec.py") and [splunk\_http\_event\_collector.py](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src/ae4c14509a181b7f543382be75d76a0393f9c937/splunk_http_event_collector.py?at=master "splunk_http_event_collector.py") in a location executable by rsyslog
- Setup rsyslog rule set with an action similar to the following ```
  <span class="k">module</span>(<span class="n">load</span>=<span class="s">"omprog"</span>)
  <a name="rsyslogd.d.conf.example-2"></a><span class="n">action</span>(<span class="n">type</span>=<span class="s">"omprog"</span>
  <a name="rsyslogd.d.conf.example-3"></a>       <span class="k">binary</span>=<span class="s">"/opt/rsyslog/hecout.py --source=rsyslog:hec --sourcetype=syslog --index=main"</span> 
  <a name="rsyslogd.d.conf.example-4"></a>       <span class="n">template</span>=<span class="s">"RSYSLOG_TraditionalFileFormat"</span>)
  ```