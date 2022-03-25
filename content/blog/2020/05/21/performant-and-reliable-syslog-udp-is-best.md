---
title: 'Performant AND Reliable Syslog UDP is best'
date: '2020-05-21T15:51:21-05:00'
status: publish
permalink: /2020/05/21/performant-and-reliable-syslog-udp-is-best
author: ryan@dss-i.com
excerpt: ''
type: post
id: 782
category:
    - Uncategorized
tag: []
post_format: []
---
The faces I’ve seen made to this statement say a lot. I hope you read past the statement for my reasons and when other requirements may prompt another choice.

<div class="wp-container-623bb344cf022 wp-block-group"><div class="wp-block-group__inner-container"><figure class="wp-block-image size-large">![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2020/05/42cx56.jpg?resize=577%2C432&ssl=1)</figure></div></div>Wait you say TCP uses ACKS so data won’t be lost, yes that’s true but there are buts

- But when the TCP session is closed events published while the system is creating a new session will be lost. (Closed Window Case)
- But when the remote side is busy and can not ack fast enough events are lost due to local buffer full
- But when a single ack is lost by the network and the client closes the connection. (local and remote buffer lost)
- But when the remote server restarts for any reason (local buffer lost)
- But when the remote server restarts without closing the connection (local buffer plus timeout time lost)
- But when the client side restarts without closing the connection

That’s a lot of buts and its why TCP is not my first choice when my requirement is for mostly available syslog (no such thing as HA) with minimized data loss.

Wait you say when should I use TCP syslog. To be honest there is only one case. When the syslog event is larger than the maximum size of the UDP packet on your network typically limited to Web Proxy, DLP and IDs type sources. That is messages that are very large but not very fast compared to firewalls for example. So we jump to TCP when the network can’t handle the length of our events

There is a third option TLS a subset of devices can forward logs using TLS over TCP this provides some advantages with proper implementation.

- TLS can continue a session over a broken TCP reducing buffer loss conditions
- TLS will fill packets for more efficient use of wire
- TLS will compress in most cases

While I am here I want to say a word about Load Balancers as a means of high availability. This is snake oil.

- TCP over an NLB double the opportunity for network error to cause data loss and almost always increases the size of the buffer lost I have seen over 25% loss on multiple occasions
- TCP over NLB can lead to imbalanced resource use due to long-lived sessions. The NLB is not designed to balance for connection KbS its design to balance connections in TCP all connections are not equal leading to out of disk space conditions
- UDP can not be probed UDP over NLB can lead to sending logs to long-dead servers.
- Load Balancers break message reassembly common examples of 1 of 3 type messages like Cisco ACS, Cisco ISE, Symantec Mail Gateway can not be properly processed when sprayed across multiple servers.

Wait you ask how do I mitigate down time for Syslog?

- Use VM Ware or hyper-v with a cluster of hosts which will reduce your outage to only host reboots which in this day and time is rare
- Use a Clustered IP solution (i.e. Keepalived) so you can drain the server to a partner before restart.

A few other idea’s you may have to bring “HA” to syslog that will be counter productive

- DNS – 
  - Most known Syslog sources will only use 1 typically the first or one random IP from a list of A records for a very long period of time ignoring the TTL. Using DNS to change the target is likely to not work in a short enough period of time in some cases hours
  - DNS Global Load Balancer similar to the above clients often holds cached results for far longer than TTL. In addition, the actual device configuration does not use the correct DNS servers for GLB to properly detect distance and will route incorrectly
- AnyCast
  - UDP anycast can work in exceptional condition the scale of a single clustered pair of Syslog servers can not provide capacity. (Greater than 10 TB per day) However, because of the polling issues described with NLBs above my experience with AnyCast has been high data loss and project failure. Over a dozen projects with well-known logos over the last 10 years names you would know. While Anycast can simplify administration it does not mitigate loss and if the routers in use are not up to the task can increase loss. Most anycast use cases have some method of recovery such as DNS. syslog does not. While AnyCast on paper seems to be an easy answer the engineering required to succed is not trival ask youself is it worth it, and can we monitor it effectivly.
- Sending the message multiple times to multiple servers to so it can be “de-duplicated” by “someone’s software” Deduplication requires global unique keys this doesn’t exist so this isn’t possible. More than once is worse than sometimes never because if we are counting errors or attacks we see more than is real resulting in false positives and causing lack of operational trust in the data making your project effectively useless. A missed event will more likely than not occur again and be captured in short order.