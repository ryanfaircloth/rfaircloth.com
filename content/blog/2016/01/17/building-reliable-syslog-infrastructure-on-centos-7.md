---
title: "Building Reliable Syslog infrastructure on Centos 7 for Splunk"
date: "2016-01-17T19:47:49-05:00"
status: publish
permalink: /2016/01/17/building-reliable-syslog-infrastructure-on-centos-7
author: ryan@dss-i.com
excerpt: ""
type: post
id: 346
category:
  - Security
  - Splunk
tag:
  - kemp
  - "load balancer"
  - nlb
  - Splunk
  - syslog
  - syslog-ng
post_format: []
---

## Overview

Preparation of a base infrastructure for high availability ingestion of syslog data with a default virtual server and configuration for test data on boarding. Reference technology specific on boarding procedures.

## Requirement

Multiple critical log sources require a reliable syslog infrastructure. The following attributes must be present for the solution

- Enterprise supported linux such as RHEL, OR Centos
- Syslog configuration which will not impact the logging of the host on which syslog is configured
- External Load Balancing utilizing DNAT lacking available enterprise shared services NLB devices KEMP offers a free to use version of their product up to 20 Mbs suitable for many cases

## Technical Environment

The following systems will be created utilizing physical or virtual systems. System specifications will vary due estimated load.

- Centos 7.x (current) servers in n+1 configuration
  - Minimum 2 GB memory
  - Minimum 2 x 2.3 GHZ core
  - Mounts configure per enterprise standard with the following additions
    - /opt/splunk 40 GB XFS
    - /var/splunk-syslog 40 GB XFS
- Dual interfaced load balancer configured for DNAT support.
- Subnet with at minimum the number of unique syslog sources (technologies) additional space for growth is strongly advised
- Subnet allocated for syslog servers

## Solution Prepare the syslog-ng servers

The following procedure will be utilized to prepare the syslog-ng servers

1. Install the base operating system and harden according to enterprise standards
2. Provision and mount the application partitions /opt/splunk and /var/splunk-syslog according the estimates required for your environment.
3. Note 1 typical configuration utilize noatime on both mounts
4. Note 2 typical configuration utilizes no execute on the syslog moun
5. Enable the EPEL repository for RHEL/CENTOS as the source for syslog-ng installation

```bash
  yum -y install epel-release
  yum -y repolist
  yum -y update
  reboot
```

4. Install the syslog-ng software

```bash
  yum y install syslog-ng
```

5. Replace /etc/syslog-ng/syslog-ng.conf

```text
  @version:3.5
  @include "scl.conf"

# syslog-ng configuration file

#

# SecKit template

# We utilize syslog-ng on Centos to allow syslog ingestion without

# interaction with the OS

# Note: it also sources additional configuration files (*.conf)

# located in /etc/syslog-ng/conf.d/

  options {
      flush_lines (0);
      time_reopen (10);
      log_fifo_size (1000);
      chain_hostnames (off);
      use_dns (no);
      use_fqdn (no);
      create_dirs (no);
      keep_hostname (yes);
  };

# Source additional configuration files (.conf extension only)

  @include "/etc/syslog-ng/conf.d/*.conf"

```

6. Create the following directories for modular configuration of syslog-ng

```bash
  mkdir -p /etc/syslog-ng/conf.d/splunk-0-source
  mkdir -p /etc/syslog-ng/conf.d/splunk-1-dest
  mkdir -p /etc/syslog-ng/conf.d/splunk-2-filter
  mkdir -p /etc/syslog-ng/conf.d/splunk-3-log
  mkdir -p /etc/syslog-ng/conf.d/splunk-4-simple
```

7. Create the Splunk master syslog-configuration /etc/syslog-ng/conf.d/splunk.conf

```bash
  ################################################################################
  # SecKit syslog template based on the work of Vladimir
  # Template from https://github.com/hire-vladimir/SA-syslog_collection/
  ################################################################################

  ################################################################################
  #### Global config ####
  options {
    create-dirs(yes);

    # Specific file/directory permissions can be set
    # this is particularly needed, if Splunk UF is running as non-root
    owner("splunk");
    group("splunk");
    dir-owner("splunk");
    dir-group("splunk");
    dir-perm(0755);
    perm(0755);

    time-reopen(10);
    keep-hostname(yes);
    log-msg-size(65536);
  };

  @include "/etc/syslog-ng/conf.d/splunk-0-source/*.conf"
  @include "/etc/syslog-ng/conf.d/splunk-1-dest/*.conf"
  @include "/etc/syslog-ng/conf.d/splunk-2-filter/*.conf"
  @include "/etc/syslog-ng/conf.d/splunk-3-log/*.conf"
  @include "/etc/syslog-ng/conf.d/splunk-4-simple/*.conf"
```

8. Create the catch all syslog collection source. /etc/syslog-ng/conf.d/splunk-4-simple/8100-default.conf

```text
  ################################################################################
  #### Enable listeners ####
  source remote8100_default
  {
      udp(port(8100));
      tcp(port(8100));
  };

#### Log remote sources classification ####

  destination d_default_syslog {
          file("/var/splunk-syslog/default/$HOST.log");
  };

# catch all, all data that did not meet above criteria will end up here

  log {
          source(remote8100_default);
          destination(d_default_syslog);
          flags(fallback);
  };

```

9. Ensure splunk can read from the syslog folders. The paths should exist at this point due to the dedicated mount

```bash
  chown -R splunk:splunk /var/splunk-syslog
  chmod -R 0755 /var/splunk-syslog
```

10. Verify syslog-ng configuration no errors should be reported (no output)

```bash
  syslog-ng -s
```

11. Update the systemd servics configuration to correctly support both rsyslog and syslog-ng edit /lib/systemd/system/syslog-ng.service

```bash
  find:
  ExecStart=/usr/sbin/syslog-ng -F -p /var/run/syslogd.pid
  replace:
  ExecStart=/usr/sbin/syslog-ng -F -p /var/run/syslogd-ng.pid
```

12. Create log rotation configuration /etc/logrotate.d/splunk-syslog

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

13. Resolve SELinux blocked actions

```bash
  semanage port -a -t syslogd_port_t -p tcp 8100
  semanage port -a -t syslogd_port_t -p udp 8100
  semanage fcontext -a -t var_log_t /var/splunk-syslog
  restorecon -v '/var/splunk-syslog'
  logger -d -P 8100 -n 127.0.0.1 -p 1 "test2"
  cd /root
  mkdir selinux
  cd selinux
  audit2allow -M syslog-ng-modified -l -i /var/log/audit/audit.log
  #verify the file does not contain anything no related to syslog
  vim syslog-ng-modified.te
  semodule -i syslog-ng-modified.pp
```

14. Allow firewall access to the new ports

```bash
  firewall-cmd --permanent --zone=public --add-port=8100/tcp
  firewall-cmd --permanent --zone=public --add-port=8100/udp
  firewall-cmd --reload
```

15. Enable and start syslog-ng

```bash
  systemctl enable syslog-ng
  systemctl start syslog-ng
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

Update the default gateway of the syslog servers to utilize the NLB internal interface

## Validation procedure

```
#from a linux host utilize the following commands to validate the NLB and log servers are working together
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
