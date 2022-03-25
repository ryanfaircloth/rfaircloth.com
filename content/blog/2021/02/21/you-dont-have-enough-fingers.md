---
title: "You don't have enough fingers"
date: "2021-02-21T09:39:36-05:00"
status: publish
permalink: /2021/02/21/you-dont-have-enough-fingers
author: ryan@dss-i.com
excerpt: ""
type: post
id: 855
category:
  - Uncategorized
tag:
  - compliance
  - logs
  - security
  - "sensitive data"
post_format: []
spay_email:
  - ""
---

<figure class="wp-block-gallery columns-1 is-cropped">- <figure>![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2021/02/2fnkx4.jpg?resize=666%2C500&ssl=1)</figure>

</figure>As you may have guessed I have been spending a substantial amount of time working with infrastructure log sources. I’ve recently had time to start addressing practice and theory of application level log sources and the substantial risks developers are taking without the awareness of their organization into those risks. The conversation starts like this.

> I have sensitive data in my logs and I need to filter that out
>
> <cite>Security teams world wide</cite>

Filtering out sensitive data sounds like a good idea right. No its not right, its wrong and this is why.

- Application developers are maintaining unnecessary sensitive data in high risk in memory code. Why is this high risk? logging APIs are highly configurable while you may know the “WARN” level of logging doesn’t contain sensitive data the “TRACE” level may, the logging component could be configured easily in production to send sensitive data to another malicious target
- Application data written to the front end application tier is more easily exfiltrated
- Application data written to disk is NOT encrypted any user or tool i.e. Ansible could be used to access this data.
- This is a well known vulnerability that must be addressed.

> But defense in depth I want to filter out just in case
>
> <cite>Security teams world wide</cite>

This just in case approach is the deployment of untested code to production which is both an operational and security risk. Why is it untested glad you ask, because you don’t know your input you can’t test the behavior and unintended consequences to performance and integrity are possible.

- It is ineffective (think DLP) this approach is simply guessing
- It is expensive, string parsing on a CPU is SLOW, moving strings between processes is even slower.
- It introduces new risks: Man in the middle interception and manipulation of audit data in the stream.

What can we do instead?

Glad you asked, logging, tracing, metrics are requirements issued to the developers as part of the software development life cycle. Requirements must be tested (automated and manual) as part of the delivery to production. Yes, that is hard everything we do is hard.

Joe Crobak writes [Seven Best Practices for Keeping Sensitive Data Out of Logs](https://medium.com/@joecrobak/seven-best-practices-for-keeping-sensitive-data-out-of-logs-3d7bbd12904)

I want to focus on #6 automated QA. Joe mentioned the concept but didn’t elaborate on what that may mean. I will provide an example, using [BDD](https://pypi.org/project/pytest-bdd/) testing as an example.

````
<pre class="wp-block-code">```
    Scenario Outline: <action> fruits
        Given there are <start> <fruits>
        When <user> eat <action> <fruits>
        Then <user> should have <left> <fruits>
        Then <user> and <action> or <fruits> combination should not be logged
````

```

An individuals fruit preference can the action of the individual can be presumed to be private matters that should not be available in logs.

When developing our test parser we will provide an additional test

```

<pre class="wp-block-code">```
@then("<user> and <action> or <fruits> combination should not be logged")
def should_have_left_cucumbers(user, eat, fruits):
# The user itself should be logged
    assert splunk.search(f"| search index="something" term(\"{user}\") > 0
# the users action and preference should not be
    assert splunk.search(f"| search index="something" term(\"{user}\") AND term(\"{action}\") == 0
assert splunk.search(f"| search index="something" term(\"{user}\") AND term(\"{fruits}\") == 0
```
```

While a simplified example as you can see using BDD we can link the logging behavior to business requirements for logging and audit making clear to the developers what they can and can not log.

<amp-fit-text height="80" layout="fixed-height" max-font-size="72" min-font-size="6">Do your business analyst capture requirements for logging and audit in clear testable ways, if not ask why.

</amp-fit-text>
