---
title: "Protecting ATMs from the two arm bandits"
date: "2018-08-14T08:13:46-05:00"
status: publish
permalink: /2018/08/14/protecting-atms-from-the-two-arm-bandits
author: ryan@dss-i.com
excerpt: ""
type: post
id: 552
category:
  - Uncategorized
tag: []
post_format: []
---

<figure class="wp-block-image alignleft">![Jackpot ATM style](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2018/08/images.jpeg?resize=259%2C194)</figure>According to [Krebs](https://krebsonsecurity.com/2018/08/fbi-warns-of-unlimited-atm-cashout-blitz/) two arm bandits are about to hit the jack pot on American ATMS, also known as ABM machines out side of the US. Like most security issues its an arms race, did you know ATM machines have holes in the bottom so crooks can’t fill them with water and blow up the door without damaging the cash? Well they started out solid someone noticed that flaw and exploited it we learned and got better.

Just before Y2K and in the years after banking systems moved from proprietary operating systems and applications, custom interfaces and hardware to Windows based “open” systems with vendor agnostic drivers and tools allowing for innovation and cost reduction. This change swapped out custom controller cards for “USB” devices, Bisync serial for TCP over ethernet, wifi, 4G, PPP. The builders of these new networks didn’t have much experience in network security and left open many many doors. The physical design protects you card number and pin but left the cash open. To keep service costs low the PC components are in a section of the machine called the “hood” and can be serviced without opening the safe and exposing the cash. This is a great design from the perspective of PC service. It also ensure the safety of the repair tech as they can not access the bulk cash there is no reason to rob them at gun point. Great but we still have a problem. The USB and network interfaced are now protected by a 4-6 pin basic lock, all the keys in a region are the same because keeping track of keys are hard. Protecting from a breach from a physical attacker is something the design precludes so we could die on this hill but we can’t take it, what can we do?

You have Splunk! you also have a remote CCTV system (nvr) or physical alarm what if we pull this data together build a threat model and respond faster.

- Monitor “motion” events from the NVR system
  - Identify cameras indicating motion front and back of the ATM
    - ATM ID
    - Front/Back
    - Duration of Motion
  - Motion in back of more than n seconds and motion in front of more than x seconds without y duration alert
- Monitor the network switch/wifi
  - map switch/ap events where the port/connection disconnects to the ATM ID
- Monitor the \_internal source from the installed UF silence of more than n seconds
- Use the UF to monitor for XFS events via ETW or windows events
  - Hood open
  - Dispenser disconnect
  - New Device
- Install Splunk Stream to monitor TLS/HTTPS aggregate by certificate ID every 5 min. Map src to atm ID alert if the presented cert changes for the Authorization Server
- Using XYGate monitor your Switch (base24/efunds) or SyncSort (Z/OS based custom) monitor for dispenser totals mismatch for the ATM ID

Summarize each of the alerts above using | collect normalizing based on ATM ID. Use Splunk built in alert function to notify ATM OPS and physical security on any occurrence of 3 or more in 15 min, tune for false positives.
