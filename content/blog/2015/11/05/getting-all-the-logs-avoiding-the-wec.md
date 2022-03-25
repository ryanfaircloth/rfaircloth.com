---
title: 'Getting all the logs &#8211; Avoiding the WEC'
date: '2015-11-05T10:32:43-05:00'
status: publish
permalink: /2015/11/05/getting-all-the-logs-avoiding-the-wec
author: ryan@dss-i.com
excerpt: ''
type: post
id: 131
category:
    - Uncategorized
tag: []
post_format: []
---
I get asked about this one often, I happen to have a bit of experience with this which is very rare. There is scant documentation on the technology from Microsoft or anyone else. I do know of some success being had with very specific low volume use cases but that’s not what I do. I’m a specialist of sorts I walk of a Delta plane, drop my bag at a Marriott then walk into change someones world with data. Actual facts about their environment from their environment and I need and use data my customers don’t know they had. Which brings me to Windows Event Collection (WEC).

Customer ask me about it its seems so easy lets talk about the parts

- Group policy use to make changes to all systems in an environment.
- Remote Power Shell
- COM/DCOM/Com+ and all of the RPC that goes with it
- Kerberos authentication

How does it work?

1. Group policy instructs the computer to connect to a collector and gather a policy
2. Policy read causes a Com+ server to read the event log (yes this is code you have not been running it can and will impact your endpoints)
3. Local filter determines what do do with this event (xml parsing with XPATH and XSLT)
4. RPC call using computer account to Collector
5. Denial (Auth required)
6. Authentication (event log write on DC and on Collector)
7. Serial write with sync and block to round robin data base on the server. So if 300 events come in these have to get in queue to go to disk.
8. Close connection
9. Poll period go back to 3

Lots of steps? Lets ask about failure modes

- What happens if my collector is down 
  - Answer client goes to sleep and retries hope your logs don’t wrap
- What happens if my collector won’t get back up 
  - Answer build a new one, open a change record, wait for approval, explain to audit why you don’t have logs
- What happens to the format of the logs? 
  - Answer Good question I can’t explain what MS is doing to these logs if you know please share
- What about log rotation and archival 
  - Answer not possible you need another tool to read back and store them some place (splunk)
- My collector isn’t keeping up what do I do now? 
  - Answer Well hopefully the org structure of your Domain will support creating an assignment policy at the OU level, you might be able to use the same policy/collector pair at multiple OU points but you might also need to break up the OUs to manage the policy.
- Cross domain? 
  - Answer 1 or more collectors per domain.
- Wait I only want events XX and ZZYY from certain servers for compliance. 
  - Answer you get another collection policy
- I can’t make this work on server2134 
  - Answer call Support at MS, explain what event collection is, hopefully convince that person it is supported
- My sensitive “application/service log” doesn’t use the event log 
  - Answer logfile this is windows who would do that?

Lets compare to universal forwarders with Splunk

- What happens if my “indexer” is down 
  - Answer Client connect to another indexer, in a production system the indexer itself is replicated and you retain access to all data.
- What happens if my collector won’t get back up 
  - Answer. Data is replicated still available
- What happens to the format of the logs? 
  - Answer We capture the original text of all logs
- What about log rotation and archival 
  - Answer Built in
- My collector isn’t keeping up what do I do now? 
  - Answer Horizontal scaling Splunk will help you plan for this with experience and performance data from real world implementations
- Cross domain? 
  - Certainly, WAN no issue, Cloud not a problem. VPN sure why not
- Wait I only want events XX and ZZYY from certain servers for compliance. 
  - Deployment server will push a configuration based on the server names you select
- I can’t make this work on server2134 
  - Answer call Support (paid) at Splunk, we have real people with real knowledge and a great community who has probably solved that problem before.
- My sensitive system doesn’t use the event log file it 
  - Answer probably not a problem, files, database, network capture can be a data source we do this all the time.