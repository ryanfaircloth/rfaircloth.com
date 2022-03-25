---
title: "Get started with Splunk App Stream 6.4 for DNS Analysis"
date: "2015-11-06T07:00:49-05:00"
status: publish
permalink: /2015/11/06/get-started-with-splunk-app-stream-6-4-dns
author: ryan@dss-i.com
excerpt: ""
type: post
id: 135
category:
  - Security
  - Splunk
  - Uncategorized
tag: []
post_format: []
---

Passive DNS analysis is all the rage right now, the detection opportunities presented have been well discussed for some time. If your organization is like most now is the time you are being asked how you can implement these detection strategies. Leveraging your existing Splunk investment you can get started very quickly with less change to your organization than one might think. Here is what we will use older versions will work fine however the screen shots will be a bit off:

- Splunk Enterprise 6.3.1
- Splunk App for Stream 6.4

We will assume Splunk Enterprise 6.3.1has already been installed.

Decide where to install your Stream App. Typically this will be the Enterprise Security search head. <del>However if your ES search head is also a search head cluster you will need to use an AD-HOC search head, dedicated search head or a deployment server. </del>Current versions of Stream fully support installation on a Search Head Cluster.

Note: If using the deployment server (DS) you must configure the server to search the indexer or index cluster containing your stream data.

1. Install Splunk App for Stream using the standard procedures located [here](http://docs.splunk.com/Documentation/StreamApp/latest/DeployStreamApp/AboutSplunkAppforStream).
2. Copy the deployment TA to your deployment server if you installed on a search head. /opt/splunk/etc/deployment-apps/Splunk_TA_stream
3. On your deployment server create a new folder to contain configuration for your stream dns server group.

- mkdir -p Splunk_TA_stream_infra_dns/local

4. Copy the inputs.conf from the default TA to the new TA for group management

- cp Splunk_TA_stream/local/inputs.conf Splunk_TA_stream_infra_dns/local/

5. Update the inputs.conf to include your forwarder group id

- vi Splunk_TA_stream_infra_dns/local/inputs.conf
- Alter “stream_forwarder_id =” to “stream_forwarder_id =infra_dns”

6. Create a new server class “infra_stream_dns” include both the following apps and deploy to all DNS servers (Windows DNS or BIND)

- Splunk_TA_stream
- Splunk_TA_stream_infra_dns

7. Reload your deployment server

Excellent at this point the Splunk Stream app will be deployed to all of your DNS servers and sit idle. The next few steps will prepare the environment to start collections

- Create a new index I typically will create stream_dns and setup retention for 30 days.

Configure your deployment group

1. Login to the search head with the Splunk App for Stream
2. Navigate to Splunk App for Stream
3. If this is your first time you may find you need to complete the welcome wizard .
4. Click on Configure the “Distributed Forwarder Management”

- [![stream_configure_dfm](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure_dfm.png?resize=673%2C153)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure_dfm.png)

5. Click Create New Group as follows then click Next
1. Name Infra_DNS
1. Description Applied to All DNS servers
1. Include Ephemeral Streams? No
1. Enter “infra_dns” as this will ensure all clients deployed above will pickup this configuration from the Stream App
1. Search for “Splunk_DNS” and select each match then Click Finish

- [![stream_dns_aggs](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_dns_aggs.png?resize=694%2C494)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_dns_aggs.png)

8. Click on Configuration then “Configure Streams”

- [![stream_configure](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure.png?resize=673%2C153)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure.png)

1. Click on New Stream
2. Setup basic info as follows then click Next
3. Protocol DNS
4. Name “Infra_DNS”
5. Description “Capture DNS on internal DNS servers”
6. [![stream_configure_dns](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure_dns.png?resize=760%2C389)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_configure_dns.png)
7. We will no use Aggregation so leave this as “No” and click Next
8. The default fields will meet our needs so go ahead and click Next
9. Optional Step: Create filters in most cases requests from the DNS server to the outside are not interesting as they are generated based on client requests that cannot be answer from the cache. Creating filters will reduce the total volume of data by approximately 50%
10. Click create filter
11. Select src_ip as the field
12. Select “Not Regular Expression” as the type
13. Provide a regex capture that will match all DNS server IPs example “(172\\.16\\.0\\.(19|20|21))” will match in my lab network.
    - [![stream_filter](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_filter.png?resize=441%2C363)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2015/11/stream_filter.png)
14. Click next
15. Select only the Infra_DNS group and click Create Stream

At this point stream will deploy and begin collection however index selection is not permitted in this workflow so we need to go back and set it up now.

1. Find Infra_DNS and click edit
2. Select the index appropriate for your environment
3. Click save

Ready to check your work? Run this search replace index=\* with your index

index=\* sourcetype=stream:dns | stats count by query | sort – count
