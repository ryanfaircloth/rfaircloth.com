---
title: "Using systemd to squash THP and start splunk enterprise"
date: "2017-04-28T16:00:41-05:00"
status: publish
permalink: /2017/04/28/using-systemd-squash-thp-start-splunk-enterprise
author: ryan@dss-i.com
excerpt: ""
type: post
id: 441
category:
  - Splunk
  - Uncategorized
tag:
  - linux
  - Splunk
  - systemd
  - THP
  - ulimits
post_format: []
---

Updated Jan, 16, 2018 user security issue

Updated Jan 19,2018 using forking type for splunk

Updated Oct 2019 for format issues after wordpress upgrade

## Fixing INIT Scripts

If you are currently or prefer using init script startup to remain as close to “out of box” configuration as possible be aware of a serious security risk present in the traditional startup method. REF: [https://www.splunk.com/view/SP-CAAAP3M ](https://www.splunk.com/view/SP-CAAAP3M)To mitigate the issue and address THP/Ulimits consider moving to a field modified version of the script. <https://bitbucket.org/snippets/rfaircloth-splunk/Gek8My>

### Going forward using SYSTEMD

The concept presented in this post, as well as the original inspiration, have some risks. Using alternatives to the vendor provided init scripts have support risks including loss of the configuration by future upgrades. Each operating system vendor has their own specific guidance on how to do this, each automation vendor has example automation scripts as well. Picking an approach that is appropriate for your environment is up to you.

THP the bain of performance for so many things in big data is often left on by default and is slightly difficult to disable. As a popular Splunk answers post and Splunk consultants include Marquis have found the best way to ensure ulimit and THP settings are properly configured is to modify the init scripts. This is a really crafty and reliable way to ensure THP is disabled for Splunk, it works on all Linux operating systems regardless of how services are started.

I’m doing some work with newer operating systems and wanted to explore how systemd really works and changes what is possible in managing a server. Lets face it systemd has not gotten the best of receptions in the community, after all it moved our cheese, toys and the ball all at once. It seems to be here to stay what if we could use its powers for good in relation to Splunk. Let’s put an end to THP and start Splunk the systemd native way.

Note: the following config file is present for readability and google. Downloadable text file is available <https://bitbucket.org/snippets/rfaircloth-splunk/ze7rqL>

Create the file `/etc/systemd/system/disable-transparent-huge-pages.service`  
``

`<br></br>[Unit]<br></br>Description=Disable Transparent Huge Pages`

\[Service\]  
Type=oneshot  
ExecStart=/bin/sh -c “echo never &gt;/sys/kernel/mm/transparent_hugepage/enabled”  
ExecStart=/bin/sh -c “echo never &gt;/sys/kernel/mm/transparent_hugepage/defrag”  
RemainAfterExit=true  
\[Install\]  
WantedBy=multi-user.target

Verify THP and defrag is presently enabled to avoid a false sense of success

`# cat /sys/kernel/mm/transparent_hugepage/enabled`

\[always\] madvise never

`# cat /sys/kernel/mm/transparent_hugepage/defrag`

> \[always\] madvise never

Enable and start the unit to disable THP

`# systemctl enable disable-transparent-huge-pages.service`

`# systemctl start disable-transparent-huge-pages.service`

`# cat /sys/kernel/mm/transparent_hugepage/enabled`

> always madvise \[never\]

`# cat /sys/kernel/mm/transparent_hugepage/defrag`

> always madvise \[never\]

Reboot and repeat the verification to ensure the process is enforced

Note: the following config file is present for readability and google. Downloadable text file is available <https://bitbucket.org/snippets/rfaircloth-splunk/xe7rqj>

create the unit file `/etc/systemd/system/splunk.service`

```

```

```
#2018-01-19 Switched to forking indexers with no web port exit differentl than search heads
[Unit]
After=network.target
Wants=network.target
Description=Splunk Enterprise


[Service]
Type=forking
RemainAfterExit=False
User=splunk
Group=splunk

ExecStart=/opt/splunk/bin/splunk start --answer-yes --no-prompt --accept-license
ExecStop=/opt/splunk/bin/splunk stop
PIDFile=/opt/splunk/var/run/splunk/splunkd.pid

Restart=on-failure
TimeoutSec=300

#ulimit -Sn 65535
#ulimit -Hn 65535
LimitNOFILE=65535
#ulimit -Su 20480
#ulimit -Hu 20480
LimitNPROC=20480
#ulimit -Hf unlimited
#ulimit -Sf unlimited
LimitFSIZE=infinity
LimitCORE=infinity
[Install]
WantedBy=multi-user.target
```

```

```

`# systemctl enable splunk.service`

`# systemctl start splunk.service`

Verify the ulimits have been applied via splunk logs

`#cat /opt/splunk/var/log/splunk/splunkd.log | grep ulimit`

Reboot and repeate all verifications

Bonus material, kill Splunk (lab env only) and watch systemd bring it back

`# killall splunk`

`# ps aux | grep splunk`

You just noticed splunkd was brought back to up when it died without using systemctl stop. This means using splunk start|stop is not valid when systemd started Splunk.
