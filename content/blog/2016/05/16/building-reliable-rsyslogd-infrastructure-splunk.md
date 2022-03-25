---
title: "Building reliable rsyslogd infrastructure for Splunk"
date: "2016-05-16T07:53:18-05:00"
status: publish
permalink: /2016/05/16/building-reliable-rsyslogd-infrastructure-splunk
author: ryan@dss-i.com
excerpt: ""
type: post
id: 367
category:
  - Uncategorized
tag: []
post_format: []
---

## Overview

Preparation of a base infrastructure for high availability ingestion of syslog data with a default virtual server and configuration for test data on boarding. Reference technology specific on boarding procedures.

## Requirement

Multiple critical log sources require a reliable syslog infrastructure. The following attributes must be present for the solution

- Enterprise supported linux such as RHEL, OR Centos, or recent Ubuntu LTS
- Syslog configuration which will not impact the logging of the host on which syslog is configured
- External Load Balancing utilizing DNAT lacking available enterprise shared services NLB devices KEMP offers a free to use version of their product up to 20 Mbs suitable for many cases

## Technical Environment

The following systems will be created utilizing physical or virtual systems. System specifications will vary due estimated load.

- servers in n+1 configuration
  - Minimum 2 GB memory
  - Minimum 2 x 2.3 GHZ core
  - Mounts configure per enterprise standard with the following additions
    - /opt/splunk 40 GB XFS
    - /var/splunk-syslog 40 GB XFS
- Dual interfaced load balancer configured for DNAT support.
- Subnet with at minimum the number of unique syslog sources (technologies) additional space for growth is strongly advised
- Subnet allocated for syslog servers

## Solution Prepare the rsyslogd servers

The following procedure will be utilized to prepare the rsyslogd servers

. Install the base operating system and harden according to enterprise standards 2. Provision and mount the application partitions /opt/splunk and /var/splunk-syslog according the estimates required for your environment.

1. Note 1 typical configuration utilize noatime on both mounts
2. Note 2 typical configuration utilizes no execute on the syslog mount
3. Create the following directories for modular configuration of rsyslogd

```
  mkdir -p /etc/rsyslog.d/conf.d/splunk-0-rules
  mkdir -p /etc/rsyslog.d/conf.d/splunk-1-inputs
```

4. Create the Splunk master syslog-configuration /etc/rsyslog.d/splunk.conf

```
  #
  # Include all config files for splunk /etc/rsyslog.d/
  #

  $IncludeConfig /etc/rsyslog.d/splunk-0-rules/*.conf
  $IncludeConfig /etc/rsyslog.d/splunk-1-inputs/*.conf

```

5. Create the catch all syslog collection source. /etc/rsyslog.d/splunk-1-inputs/default.conf

```text
  #define syslog source
  input(type="imptcp" port="8100" ruleset="default_file");
  input(type="impudp" port="8100" ruleset="default_file");
```

6. Define a rule for all incoming data on the default port /etc/rsyslog.d/splunk-0-rules/default.conf

```text
  ruleset(name="default_file"){
      $RulesetCreateMainQueue
      $template DynaFile,"/var/splunk-syslog/default/%HOSTNAME%.log"
      *.* -?DynaFile
      stop
  }
```

7. Ensure splunk can read from the syslog folders. The paths should exist at this point due to the dedicated mount

```
  chown -R splunk:splunk /var/splunk-syslog
  chmod -R 0755 /var/splunk-syslog
```

8. Reload rsyslogd

```
  systemctl reload rsyslog
```

9. Create log rotation configuration /etc/logrotate.d/splunk-syslog

```text
  /var/splunk-syslog/*/*.log
  {
      daily
      compress
      delaycompress
      rotate 4
      ifempty
      maxage 7
      nocreate
      missingok
      sharedscripts
      postrotate
      /bin/kill -HUP `cat /var/run/syslogd-ng.pid 2> /dev/null` 2> /dev/null || true
      endscript
  }
```

10. Allow firewall access to the new ports (RHEL based)

```
  firewall-cmd --permanent --zone=public --add-port=8100/tcp
  firewall-cmd --permanent --zone=public --add-port=8100/udp
  firewall-cmd --reload
```

## Solution Prepare KEMP Loadbalancer

- Deploy virtual load balancer to hypervisor with two virtual interfaces
  - \#1 Enterprise LAN
  - \#2 Private network for front end of syslog servers
- Login to the load balancer web UI
- Apply free or purchased license
- Navigate to network setup
  - Set eth0 external ip
  - Set eth1 internal ip
- Add the first virtual server (udp)
  - Navigate to Virtual Services –&gt; Add New
  - set the virtual address
  - set port 514
  - set port name syslog-default-8100-udp
  - set protocol udp
  - Click Add this virtual service
  - Adjust virtual service settings
    - Force Layer 7
    - Transparency
    - set persistence mode source ip
    - set persistence time 6 min
    - set scheduling method lest connected
    - Use Server Address for NAT
    - Click Add new real server - Enter IP of syslog server 1 - Enter port 8100
- Add the first virtual server (tcp)
  - Navigate to Virtual Services –&gt; Add New
  - set the virtual address
  - set port 514
  - set port name syslog-default-8100-tcp
  - set protocol tcp
  - Click Add this virtual service
  - Adjust virtual service settings
    - Service type Log Insight
    - Transparency
    - set scheduling method lest connected
    - TCP Connection only check port 8100
    - Click Add new real server - Enter IP of syslog server 1 - Enter port 8100
- Repeat the add virtual server process for additional resource servers

## Update syslog server routing configuration

```
Update the default gateway of the syslog servers to utilize the NLB internal interface
```

## Validation procedure

```
from a linux host utilize the following commands to validate the NLB and log servers are working together
logger -P 514 -T -n <vip_ip> "test TCP"
logger -P 514 -d -n <vip_ip> "test UDP"
verify the messages are logged in /var/splunk-syslog/default
```

## Prepare Splunk Infrastructure for syslog

- Follow procedure for deployment of the Universal Forwarder with deployment client ensure the client has has valid outputs and base configuration
- Create the indexes syslog and syslog_unclassified
- Deploy input configuration for the default input

```
[monitor:///var/splunk-syslog/default/*.log]
host_regex = .*\/(.*)\.log
sourcetype = syslog
source = syslog_enterprise_default
index = syslog_unclassified
disabled = enabled
```

- Validate the index contains data
