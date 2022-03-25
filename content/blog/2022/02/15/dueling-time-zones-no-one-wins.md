---
title: "Dueling time zones no one wins"
date: "2022-02-15T09:03:20-05:00"
status: publish
permalink: /2022/02/15/dueling-time-zones-no-one-wins
author: ryan@dss-i.com
excerpt: ""
type: post
id: 921
category:
  - Uncategorized
tag: []
post_format: []
---

The problem with a pistol dual is often both parties lose. I often have time zone-centered conversations around logging that consume an extraordinary amount of the admin and end-users time trying to prove or disprove the correctness of an event timestamp. The problem we always have in this conversation is relative perspective. We could almost describe this as a three-body problem but it’s not quite that hard.

- The time the device thinks is correct unfortunatly for network gear this is often slightly wrong or very very wrong.
- The time the admin thinks the device should have (local time where device is)
- The time the admin is in when the admin is in another time zone.
- Day Light Saving…..
- Leap time
- Short time zones can mean more than one value CST (US and China both have one)

Save time and money by making the following choices

- All systems and devices that are not end-user compute (desktops laptops phones vdi) must use UTC as the system clock and the clock time for logging
- Users should set their display time zone in the Search app to their preference or local time zone
- If an exception justifies a exception to this policy other than infra admin preference the device must include the tz offset in logs using +/-HH:MM syntax
