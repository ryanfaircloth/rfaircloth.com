---
title: 'Another reason you want agents'
date: '2021-10-14T12:28:26-05:00'
status: publish
permalink: /2021/10/14/another-reason-you-want-agents
author: ryan@dss-i.com
excerpt: ''
type: post
id: 890
category:
    - Uncategorized
tag: []
post_format: []
---
Microsoft has released a cool new tool for Linux ported from Windows. I was asked today why I don’t think “syslog” is an acceptable way to bring large events into the SIEM (Splunk of course). It took about 60s to wrap up the conversation the original asker of the question was able to validate my concerns pretty quickly sadly many times expectations and requirements for open or no agents get set before the “problem we are trying to solve” or “use case is defined.

When I first said no the immediate response was “yes it works fine”. This is the “it works on my machine problem.

<figure class="wp-block-image size-large">[![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2021/10/image.png?resize=952%2C258&ssl=1)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2021/10/image.png?ssl=1)</figure>In the pcap above we see a full syslog event over the wire (tcp) and it looks a-ok but there is always more keep watching packets and you start to see data truncation.

<figure class="wp-block-image size-large">[![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2021/10/image-1.png?resize=938%2C337&ssl=1)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2021/10/image-1.png?ssl=1)</figure>Hey man bad XML what gives? The system loggers on RedHat and ubuntu are forked builds of their upstream syslog-ng and rsyslog source products. The vendors keep a close eye on the features and functions they need to write to /var/log/\* but don’t actually test or validate most other functionality if you look closely at the source well not even that close you will need a Franken build of patches from the upstream that isn’t the upstream. To ship large events from a Linux host over TCP you need the upstream proper builds for your OS which means changing out the package of a core feature of the OS ask yourself who is going to support that.

After you do this swap out (and figure out how to test validate and support) now you need to configure it. Using the 1980s bsd syslog is a bad look. Why? Well, there is an IETF standard (RFC5424) it addresses issues like breakage with \\n and other special chars BSD didn’t have to think about but it’s never the default for the same reasons IBM still sells mainframes the industry is scared to break existing implementations. If you want /need to avoid an agent now you have to not only load up third-party builds not supported by your OS vendor but also have to make diverging config changes and figure out how to support that. [Searching](https://duckduckgo.com/?q=rsyslog+send+IETF+framed+syslog&atb=v209-1&ia=web) for that with all the correct words will land you [here](https://www.rsyslog.com/sending-messages-to-a-remote-syslog-server/). So what to do? Using host agents is the best choice for Splunk that’s the Universal Forwarder if you really want to make this work you need to find the right combination of [settings](https://www.rsyslog.com/doc/v8-stable/configuration/modules/omfwd.html) and be prepared to be up all night when something goes wrong because no one else can find the docs on the internet.