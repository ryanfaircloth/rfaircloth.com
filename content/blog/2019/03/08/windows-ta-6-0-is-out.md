---
title: "Windows TA 6.0 is out!"
date: "2019-03-08T10:08:16-05:00"
status: publish
permalink: /2019/03/08/windows-ta-6-0-is-out
author: ryan@dss-i.com
excerpt: ""
type: post
id: 628
category:
  - Uncategorized
tag: []
post_format: []
---

Splunk released a major update to the [Splunk TA for Windows](https://splunkbase.splunk.com/app/742/) last month you may not have noticed but I think you should take a closer look. A few key things

- Simplified deployment for new customers Splunk merged the TA for Microsoft DNS and TA for Microsoft AD
- The improved support for “XML” format Windows events from 5.0.1 is now the default in 6.0.0 there is upgrade action to accept this switch. XML events allow for extraction of additional value-able data such as the restart reason from event ID 1074
- Improved CIM compliance for Security events from modern logging channels like Remote Desktop Session
- Improved extensibility its now much easier to add support for third part logging via Windows Event Log
- Improved support for Windows Event forwarding – Note I still strongly discourage this solution for performance, reliability and audit reasons.

If you are a SecKit for Windows user it is safe to upgrade just follow Splunk’s upgrade instructions. Need some guidance on good practices for Windows data on-boarding to Splunk be sure to checkout [SecKit](https://seckit.readthedocs.io/projects/seckit-ta/en/latest/index.html)

## But Change!

While this is not a replacement for the upgrade notes you are probably wondering how will this impact my users.

- sourcetype changes: Prepare for the upgrade review use of sourcetype=wineventlog:\* and replace with an appropriate eventtype OR source= With this TA version we use the source to differentiate between the specific event logs. sourcetype which represents the format of the log becomes a constant regardless of log type. This reduces the memory used in index and search time.
- License impact: XML is bigger, yes but classic has white space and thats not free either and all that static text is gone. In my travels I have not seen much impact if any to license it seems to be a wash
- XML logs are ugly: You are not wrong there. What can I say its Windows
- XML parsing is slower: Yes and no overall the impact of switch from Classic to XML is not much slower. The TA uses regex parsing not “XML”, while you see XML on screen Splunk treats it like normal text. The changes implemented in the prior release (5.0.1) made improvements compared to 4.8.4 if your prior experience relates to this version its worth a second look.
