---
title: 'Getting all the logs, avoid the syslog'
date: '2015-09-16T22:07:07-05:00'
status: publish
permalink: /2015/09/16/getting-all-the-logs-avoid-the-syslog
author: ryan@dss-i.com
excerpt: ''
type: post
id: 124
category:
    - Splunk
tag: []
post_format: []
---
Big data, open world a utopia we may one day have. Today I want my logs all of my logs, and then I want more. I often want to collect additional data such as:

- Performance counters on Windows operating systems
- Appended files on all platforms
- Script and executable output to translate the odd and the weird stuff developers create

All to often there is resistance to this lofty goal of security information awareness. Why might you ask. To be honest often security people have a certain reputation. I’m not talking about the funk or the mothers basement kind of reputation. There is a reputation for breaking the environment and stopping the business. IT ops is in agent overload, license compliance, monitoring, data loss prevention, av, endpoint security all want their agents. Log management often is late to the party and is viewed as a bridge to far. In some cases an ineffective solution was in place and there is resistance to replacing a legacy collection tool. Yes indeed the reason people don’t want to install a proper collection tool is the broken solution being replaced worked just fine. Really actually had this conversation.

I’m a Splunk user and customer turned consultant. I bleed green but this isn’t about Splunk it does support the idea that using the Splunk tool set including the Universal Forwarder is the best choice. But if your log collection tool is another enterprise ready product this applies to you as well.

Issue number 1: Supportability each agent will parse or fail parse and provide log data in a unique format. Each security solution vendor will be able to best test with their native language (format) if supportable and tested is a goal. You want to use the best tool.

Issue number 2: Reliable delivery each agent from a commercial vendor using a native protocol will support acknowledgment and store and forward. Any vendor neutral agent using the syslog feature will not support this feature meaning you can not assure any auditor with any level of google foo your log solution has integrity and is complete.

Issue number 3: Reliable resumption each commercial agent includes support for high water tracking with windows events, and tail tracking for files. Snare (unreliable) Lasso (unreliable) Logstash, Gray log Fluentd do not support this feature. Without this feature any time the agent stops, abends, or the system reboots data is lost. So this is not acceptable for regulated environment. Including small matters like PCI, SOX, HIPPA, GLBA to name an American focused few.

Issue number 4: The position that using a freeware or vendor neutral collection tool is reliable places you alone outside of industry support. Splunk, HP logger, Mcafee Nitro, Q1 Radar all provide reliable collection agents. Where support for syslog based solutions exists it is limited and second class at best.

Issue number 5: Cost its not free, every issue encountered will cost human labor time, opportunity (delays) and potentially leave your company open to audit finding for non compliance.

Issue number 6: False belief that performance will be impacted by these vendor agents. While for some specific vendor agents and use cases this may be true. It is no more likely (or less likley) to be than using a unsupported log collection tool.