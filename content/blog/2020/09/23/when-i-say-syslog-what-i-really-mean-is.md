---
title: 'When I say syslog what I really mean is'
date: '2020-09-23T14:24:57-05:00'
status: publish
permalink: /2020/09/23/when-i-say-syslog-what-i-really-mean-is
author: ryan@dss-i.com
excerpt: ''
type: post
id: 826
category:
    - Uncategorized
tag: []
post_format: []
---
Syslog is a ambiguous term so I thought I would clarify what I am talking about

syslog is a daemon where Linux/UNIX sent logs back in the day. This in most cases results in an entry in a file in /var/log that may or may not have any particular structure this is normally not what I am talking about

Syslog was not a standard in the beginning. RFC 3164 is not a standards document its a memorialization of some common practices. Do you want a 1988 Honda Civic if you vendor’s Syslog looks like this you should look at it like a used car.

`<111> July 01 12:13:11 My old car's logs`

Syslog is not just text over tcp/udp. A syslog message must have the PRI such as &lt;111&gt; it must have a structure something like this:

`<34>1 2003-10-11T22:14:15.003Z mymachine myapplication 1234 ID47 [example@0 class="high"] BOMmyapplication is started`

Syslog is now a set of standards

- RFC 5424 is the transport neutral message format https://tools.ietf.org/html/rfc5424
- RFC 5425 describes how to use TLS as the transport (best practice) if network security matters worst practice when performance matters https://tools.ietf.org/html/rfc5425
- RFC 5426 describes how to use UDP as the transport best practice for performance https://tools.ietf.org/html/rfc5426
- RFC 6587 describes how to use TCP as the transport worst practice for performance best practice for large messages over unreliable networks https://tools.ietf.org/html/rfc5587

A message should not be considered “standard Syslog” if it is not in the RFC5424 protocol using RFC 5425 5426 or 6587 as the transport. Standards compliance matters lets start making vendors feel bad they have had 12 years to get it right.