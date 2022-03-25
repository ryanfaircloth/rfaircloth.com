---
title: '&#8220;Safely&#8221; Exposing Splunk S2S to the internet'
date: '2019-08-08T12:56:18-05:00'
status: publish
permalink: /2019/08/08/safely-exposing-splunk-s2s-to-the-internet
author: ryan@dss-i.com
excerpt: ''
type: post
id: 684
category:
    - Uncategorized
tag: []
post_format: []
---
Splunk has a great token based auth solution for its S2S protocol it was added several versions back. Inputs have both just worked and remained unchanged for so long many administrators have not noticed the feature. This allows you to safely expose indexers or heavy forwarders so that UFs on the internet can forward data back in without VPN. This is super critical for Splunk endpoints that don’t require a connection to the corporate network via VPN constantly

When a Splunk input is exposed to the internet there is a risk of resource exhaustion dos. A simple type of attack where junk data or “well formed but misleading” data is feed to Splunk until all CPU/memory/disk is consumed.

Once this feature is enabled all UF/HF clients must supply a token to be allowed to connect if your adding this feature to a running Splunk deployment be ready to push the outputs.conf update and inputs.conf updates in close succession to prevent a data flow break.

Update your inputs.conf as follows, note you can use multiple tokens just like HEC so you can mitigate the number of tokens that need to be replaced if a stolen token is used in a DOS attack

```
<pre class="mw-collapsed"># Access control settings.
[splunktcptoken://<token name>]
* Use this stanza to specify forwarders from which to accept data.
* You must configure a token on the receiver, then configure the same
  token on forwarders.
* The receiver discards data from forwarders that do not have the
  token configured.
* This setting is enabled for all receiving ports.
* This setting is optional.

token = <string>
* token should match regex [A-Za-Z0-9\-]+ and with a min length of 12
```

Update outputs.conf use the token value of choice from inputs.conf

```
<pre class="mw-collapsed">[tcpout:<target_group>]
token = <string>
* The access token for receiving data.
* If you configured an access token for receiving data from a forwarder,
  Splunk software populates that token here.
* If you configured a receiver with an access token and that token is not
  specified here, the receiver rejects all data sent to it.
* This setting is optional.
* No default.
```