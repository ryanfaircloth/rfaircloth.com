---
title: "Devices that think you know their name"
date: "2020-05-28T14:46:48-05:00"
status: publish
permalink: /2020/05/28/devices-that-think-you-know-their-name
author: ryan@dss-i.com
excerpt: ""
type: post
id: 792
category:
  - Uncategorized
tag: []
post_format: []
---

<figure class="wp-block-gallery columns-1 is-cropped">- <figure>![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2020/05/507.jpg?resize=621%2C691&ssl=1)</figure>

</figure>What exactly is that talkers name is one of the most frustrating problems in syslog eventing and the most frustrating in analytics. For far too long the choices have been to use the devices name OR use reverse DNS but never both. Today SC4S 1.20.0 solves this problem by doing what you would do!

1. If the device has a host name in the event use that
2. Else if our management/cmdb solution knows the right name use that instead
3. Else maybe someone updated DNS try that instead.

Simple logical easy to understand and available now in [Splunk Connect for Syslog.](https://splunk-connect-for-syslog.readthedocs.io/) No more of this

<figure class="wp-block-image size-large">![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2020/05/image.png?resize=654%2C51&ssl=1)<figcaption>Event with IP as a host </figcaption></figure>Plenty more like this

<figure class="wp-block-image size-large">![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2020/05/image-1.png?resize=662%2C54&ssl=1)<figcaption>IP translated to host using CMDB sourced lookup</figcaption></figure>
