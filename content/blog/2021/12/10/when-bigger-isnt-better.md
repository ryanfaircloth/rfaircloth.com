---
title: "When bigger isn't better"
date: "2021-12-10T08:49:34-05:00"
status: publish
permalink: /2021/12/10/when-bigger-isnt-better
author: ryan@dss-i.com
excerpt: ""
type: post
id: 906
category:
  - Uncategorized
tag: []
post_format: []
---

This won’t take long, I still read slashdot there you have my confession. This article discusses the “[fallout](https://tech.slashdot.org/story/21/12/09/2214255/revisiting-the-tsar-bomba-nuclear-test)” politically from the Tsar Bomba tests and I found very interesting a single comment (I’ve read most of it before.

> _“There is always this temptation for big bombs. I found a memo by somebody at Sandia, talking about meeting with the military. He said that the military didn’t really know what they wanted these big bombs for, but they figured that if the Soviets thought they were a good idea, then the US should have one, too”_

Why did this interest me? I notice the desire for “bigger” isn’t just an issue for bombs but often an issue for systems design. the Tsar Bomb was certainly the biggest, it certainly “worked” but could it ever be used? What we know about the bomb indicates it was so big it couldn’t fit in the plane they strapped it to the bottom and hoped not to crash on take off. The aerodynamic of the plane changed so much it would be defenseless in actual combat. It’s just too big to be used.

How does this relate to system design, when we design a system so large we can just make one, we can’t replicate it, we can’t test it we find we have a system so large it “can work” but just “can’t work”.

This doesn’t mean all definitions of “big” are poor choices but it’s a consideration something to be mindful of.

- Is my system so big it can’t fit in the network I have (plane)?
- Is the system so big its blast radius can take out my entire company/department if it fails?
- Is the system so big I can’t test it because I can only make one?
- Is the system so big I can’t test it outside of production because I can’t recreate the remainder of the environment?

What can I do about a system too big?

- Can I distribute across zones or instances?
- Can I delegate functionality to external systems?
- Can I make the environment larger to avoid “big fish in little pond” and “noisy neighbor” concerns?
