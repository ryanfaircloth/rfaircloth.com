---
title: "Unbelievably simple (ipfix|(net|j|s)flow) collection"
date: "2017-02-11T11:57:12-05:00"
status: publish
permalink: /2017/02/11/unbelievably-simple-ipfixnetjsflow-collection
author: ryan@dss-i.com
excerpt: ""
type: post
id: 401
category:
  - Uncategorized
tag: []
post_format: []
---

Do blog posts come in threes, keep watching to find out? Yesterday I gave you the run down on a new way to collect [syslog](http://www.rfaircloth.com/2017/02/10/building-perfect-syslog-collection-infrastructure/). Today I’m going to spend some time on a simple low cost and performant way to collect flow data.

- At least two indexers with http event collector, more = better. For this use case it is not appropriate to utilize dedicated HEC servers.
- One http load balancer, I use HA proxy. You can certainly use the same one from our rsyslog configuration.
- Optional one UDP load balancer such as NGNIX. I am not documenting this setup at this time.
- One ubuntu 16.04 VM

Basic Setup

1. Follow docs, to setup HTTP event collector on your indexers, note if your indexers are clustered docs does not cover this, you must create the configuration manually be sure to generate a unique GUID manually. Clusters environments can use the sample configuration below: IMPORTANT ensure your data indexes AND \_internal are allowed for the token
2. ```
   <pre class="p1"><span class="s1">[http] </span>
   <span class="s1">disabled=0</span>
   <span class="s1">port=8088</span>
   <span class="s1">#</span>
   <span class="s1">[http://streamfwd]</span>
   <span class="s1">disabled=0</span>
   <span class="s1">index=main</span>
   <span class="s1">token=DAA61EE1-F8B2-4DB1-9159-6D7AA5220B21</span>
   <span class="s1">indexes=_internal,main</span>
   ```

````
3. Follow documentation for your load balancer of choice to create a http VIP with https back end servers. HEC listens on 8088 by default.
4. Install stream for the independent per [Docs](http://docs.splunk.com/Documentation/StreamApp/7.0.1/DeployStreamApp/InstallStreamForwarderonindependentmachine)
5. Kill stream if its running “killall -9 streamfwd”
6. Remove the init script
1. “**update**<span class="s2">-rc.d -f streamfwd remove”</span>
2. rm /etc/init.d/streamfwd
7. Create a new service unit file for systemd /etc/systemd/system/streamfwd.service ```
<pre class="p1"><span class="s1">[Unit]</span>
<span class="s1">Description= Splunk Stream Dedicated Service</span>
<span class="s1">After=syslog.target network.target</span>
<span class="s1">[Service]</span>
<span class="s1">Type=simple</span>
<span class="s1">ExecStart=/opt/streamfwd/bin/streamfwd -D</span>
````

8. Enable the new service “systemctl enable streamfwd”
9. Create/update the streamfwd.conf replacing GUID VIP and INTERFACE
10. ```
    <pre class="p1"><span class="s1">[streamfwd]</span>

    <span class="s1">httpEventCollectorToken = <GUID></span>

    <span class="s1">indexer.0.uri= <HEC VIP></span>
    <span class="s1">netflowReceiver.0.ip = <INTERFACE TO BIND></span>
    <span class="s1">netflowReceiver.0.port = 9995</span>
    <span class="s1">netflowReceiver.0.decoder = netflow</span>
    ```

11. Create/update the inputs.conf ensure the URL is correct for the location of your stream app
12. ```
    <pre class="p1"><span class="s1">[streamfwd://streamfwd]</span>
    ```

<span class="s1">splunk_stream_app_location = https://192.168.100.62:8000/en-us/custom/splunk_app_stream/</span>

<span class="s1">stream_forwarder_id=infra_netflow</span>

```
12. Start the streamfwd “systemctl start streamfwd”
13. Login to the search head where Splunk App for Stream is Installed
14. Navigate to Splunk App for Stream –&gt; Configuration –&gt; Distributed Forwarder Managment
15. Click Create New Group
16. Enter Name as “INFRA\_NETFLOW”
17. Enter a Description
18. Click Next
19. Enter “INFRA\_NETFLOW” as the rule and click next
20. Click Finish without selecting options
21. Navigate to Splunk App for Stream –&gt; Configuration –&gt; Configure Streams
22. Click New Stream select netflow as the protocol (this is correct for netflow/sflow/jflow/ipfix
23. Enter Name as “INFRA\_NETFLOW”
24. Enter a Description and click next
25. No Aggregation and click next
26. Deselect any fields NOT interesting for your use case and click next
27. Optional develop filters to reduce noise from high traffic devices and click next
28. Select the index for this collection and click enable then click next
29. Select only the Infra\_netflow group and Create\_Stream
30. Configure your NETFLOW generator to send records to the new streamfwd

Validation! search the index configured in step 27
```
