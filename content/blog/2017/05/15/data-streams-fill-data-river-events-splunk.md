---
title: "Data Streams Fill the data river with events from Splunk"
date: "2017-05-15T20:43:36-05:00"
status: publish
permalink: /2017/05/15/data-streams-fill-data-river-events-splunk
author: ryan@dss-i.com
excerpt: ""
type: post
id: 450
category:
  - Uncategorized
tag: []
post_format: []
---

I’ve had this in the bucket for a while waiting for the right time to share. There is a growing demand to develop “real time” analytic capability using machine data. Some great things are being created in labs their problem coming out of the lab is generally the inability to get events from the source systems, immediately following by difficulty normalizing events. If you’ve been working with these systems for very long and also worked with Splunk you may share my opinion that the Universal Forwarder, and the Schema at read power of Splunk is simply unmatched. How can we leverage the power of Splunk without reinventing the wheel, the axel, and the engine.

Credits

- Liu-yuan Lai, Engineer, Splunk https://conf.splunk.com/session/2015/conf2015\_LYuan\_Splunk\_BigData\_DistributedProcessingwithSpark.pdf
- Splunk App for CEF https://splunkbase.splunk.com/app/1847/

Back in 2015 I attended a short conf presentation that introduced me to the concepts and the value of Spark like engines. Last year our new CEF app introduced the idea message distribution can be executed on the indexer allowing very large scale processing with Splunk.

Introducing Integration Kit (IntKit)

- Message Preparation Tools [https://bitbucket.org/SPLServices/intkit_sa_msgtools](https://bitbucket.org/SPLServices/intkit_sa_msgtools)
- Kafka Producer [https://bitbucket.org/SPLServices/intkit_sa_kafkaproducer](https://bitbucket.org/SPLServices/intkit_sa_kafkaproducer)

The solution adds three interesting abilities to Splunk using “summarizing searches” to distribute events via a durable message bus.

1. Send raw events using durable message queue
2. Send reformated events using an arbitrary schema
3. Send “Data Model” schema eliminating the need to build parsing logic for each type of source on the receiving side.

But what about other solutions

- Syslog Output using the heavy forwarder
  - Syslog is not a reliable delivery protocol unable to resend lost events can cause backup on the UF
- CEF 2.0
  - Great tool limited to single line events or reformating also allows for data loss.

The tools consist of a message formatter currently preparing a \_json field, other formats such as xml or csv could be implemented and a producer that will place the message into the kafka queue (other queues can also be implemented)

example

\[code lang=text\]  
| datamodel Network_Traffic All_Traffic search  
| fields + \_raw,All_Traffic.\*  
| generatejsonmsg suppress_empty=true suppress_unknown=true suppress_stringnull=true output_field=\_json  
include_metadata=true include_fields=true include_raw=false sort_fields=true sort_mv=true  
| ProduceKafkamsgCommand bootstrap_servers="localhost:9092" topic="topicname" msgfield="\_json"  
| stats count  
\[/code\]

What does this do:

1. Using the datamodel command gather all Network_Traffic events
2. Keep only \_raw and the data model fields
3. generate a \_json field containing the fields in json format omit empty strings, “null”, sort the values of mv fields
4. Send the message to kafka using a bootstrap server (localhost) topic “topicname”

This project is slightly above science project. That is poorly documented and mostly functional. I expect it will fit in well with the ecosystem its helping. Please submit enhancements to make it better including documentation if you use it.
