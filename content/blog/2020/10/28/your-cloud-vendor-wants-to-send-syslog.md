---
title: 'Your cloud vendor wants to send syslog cloud to cloud'
date: '2020-10-28T16:06:32-05:00'
status: publish
permalink: /2020/10/28/your-cloud-vendor-wants-to-send-syslog
author: ryan@dss-i.com
excerpt: ''
type: post
id: 836
category:
    - Uncategorized
tag: []
post_format: []
---
<figure class="wp-block-gallery columns-1 is-cropped">- <figure>![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2020/10/Batman-shocked-face-meme.jpg?resize=400%2C428&ssl=1)</figure>

<figcaption class="blocks-gallery-caption">Shocked customer learning their “security” provider wants to send syslog over the internet</figcaption></figure>I get asked about this from time to time whats wrong with sending syslog over the internet its a standard right?

IETF Syslog meaning RFC5424 over TLS (RFC5425) seems like a good idea until you think of the consequences and just what those consequences might be?

How do you plan to authenticate that.

Certificates well maybe this opens your SIEM up to a nasty low cost denial of service problem. Client cert auth is trivial to use as DOS with any invalid cert and expensive validation options. If this was happening how would you know neither syslog nor rsyslog will log this in an obvious way.

Secret SDATA? now we allow any client to auth and send data we must accept and parse the data to find out if its allowed sure that can’t be abused

IP Restrictions I have some beach front property for you.

All of the above

How will you scale that? please see prior posts on load balancing syslog

Next time you hear the suggestion of RFC 5424 syslog just laugh at the joke and ask what options are really being proposed.