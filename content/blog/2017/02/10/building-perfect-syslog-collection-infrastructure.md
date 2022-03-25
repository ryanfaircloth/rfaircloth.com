---
title: "Building a more perfect Syslog Collection Infrastructure"
date: "2017-02-10T10:48:20-05:00"
status: publish
permalink: /2017/02/10/building-perfect-syslog-collection-infrastructure
author: ryan@dss-i.com
excerpt: ""
type: post
id: 389
thumbnail: ../../../../uploads/2017/02/syslog.png
category:
  - Splunk
  - Uncategorized
tag:
  - EventOPS
  - HEC
  - RSYSLOG
  - Splunk
post_format: []
---

A little while back I created a bit of [code](http://www.rfaircloth.com/2016/05/16/building-high-performance-low-latency-rsyslog-splunk/) to help get data from linux systems in real time where the Splunk Universal Forwarder could not be installed. At the time we had a few limitations the biggest problem being time stamps were never parsed only “current” time on the indexer could be used. Want to try out version 2 lets get started! First let me explain what we are doing

If you manage a Splunk environment with high rate sources such as a Palo Alto firewall or Web Proxy you will notice that events are not evenly distributed over the indexers because the the data is not evenly balanced across your aggregation tier. The reasons for this are boiled down to “time based load balancing” in Larger environments the universal forwarder may not be able to split by time to distribute a high load. So what is an admin to do? Lets look for a connection load balancing solution. We need to find a way to switch from “SYSLOG” to HTTP(s) so we can utilize a proper load balancer. How will we do this?

1. Using containers we will dedicate one or more instance of RSYSLOG for each “type” of data,
2. Use a custom plugin to package and forward batches of events over http(s)
3. Use a load balancer configured for least connected round robin to balance the batches of events

[![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2017/02/syslog.png?resize=677%2C456)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2017/02/syslog.png)

What you need

- At least two indexers with http event collector, more = better. The “benefits” of this solution require collection on the indexer dedicated collectors will not be a adequate substitute
- One load balancer, I use HA Proxy
- One syslog collection server with rsyslog 8.24+ host I use LXC instances hosted on proxmox. Optimal deployment will utilize 1 collector per source technology. For example 1 instance collecting for Cisco IOS and another for Palo Alto Firewalls. Using advanced configuration and filters you can combine several low volume source.
- A GUID if you need one generated there are many ways this one is quick and easy <https://www.guidgenerator.com/online-guid-generator.aspx>

Basic Setup

1. Follow docs, to setup HTTP event collector on your indexers, note if your indexers are clustered docs does not cover this, you must create the configuration manually be sure to generate a unique GUID manually. Clusters environments can use the sample configuration below:
2. Follow documentation for your load balancer of choice to create a http VIP with https back end servers. HEC listens on 8088 by default
3. Grab the code and configuration examples from [bitbucket](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src)
4. Deploy the script [omsplunkhec.py](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src/445676ad128d8ca5de3b573c55450ecc13b3dd88/omsplunkhec.py?at=master "omsplunkhec.py") to /opt/rsyslog/ ensure the script is executable
5. Review [rsyslogd.d.conf.example](https://bitbucket.org/rfaircloth-splunk/rsyslog-omsplunk/src/445676ad128d8ca5de3b573c55450ecc13b3dd88/rsyslogd.d.conf.example?at=master "rsyslogd.d.conf.example") and your configuration in /etc/rsyslog.d/00-splunkhec.conf replace the GUID and IP with your correct values
6. Restart rsyslog

What to expect, My hope data balance Zen.

[![](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2017/02/chart.png?resize=1100%2C243)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2017/02/chart.png)

## HTTP Event Collector inputs.conf example deployed via master-apps

> ```
> <pre class="p1"><span class="s1">[http] </span>
> <span class="s1">disabled=0</span>
> <span class="s1">port=8088</span>
> <span class="s1">#</span>
> <span class="s1">[http://SM_rsyslog_routerboard]</span>
> <span class="s1">disabled=0</span>
> <span class="s1">index=main</span>
> <span class="s1">token=DAA61EE1-F8B2-4DB1-9159-6D7AA5220B21</span>
> <span class="s1">indexes=main,summary</span>
> ```

## Example /etc/rsyslog.d/00-splunk.conf

This example will listen on 514 TCP and UDP sending events via http, be sure to replace the GUID and ip address

```
module(load="imudp")
input(type="imudp" port="514" ruleset="default_file")
module(load="imptcp")
input(type="imptcp" port="514" ruleset="default_file")
module(load="omprog")

ruleset(name="default_file"){
    $RulesetCreateMainQueue
    action(type="omprog"
       binary="/opt/rsyslog/omsplunkhec.py DAA61EE1-F8B2-4DB1-9159-6D7AA5220B21 192.168.100.70 --sourcetype=syslog --index=main"
       template="RSYSLOG_TraditionalFileFormat")
    stop
}
```

## Example HAProxy Configuration 1.7 /etc/haproxy/haproxy.cfg

> ```
> <pre class="p1"><span class="s1">global</span>
> <span class="s1"><span class="Apple-converted-space">        </span>log /dev/log<span class="Apple-converted-space">    </span>local0</span>
> <span class="s1"><span class="Apple-converted-space">        </span>log /dev/log<span class="Apple-converted-space">    </span>local1 notice</span>
> <span class="s1"><span class="Apple-converted-space">        </span>chroot /var/lib/haproxy</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats socket /run/haproxy/admin.sock mode 660 level admin</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats timeout 30s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>user haproxy</span>
> <span class="s1"><span class="Apple-converted-space">        </span>group haproxy</span>
> <span class="s1"><span class="Apple-converted-space">        </span>daemon</span>
> <span class="s1"><span class="Apple-converted-space">        </span># Default SSL material locations</span>
> <span class="s1"><span class="Apple-converted-space">        </span>ca-base /etc/ssl/certs</span>
> <span class="s1"><span class="Apple-converted-space">        </span>crt-base /etc/ssl/private</span>
> <span class="s1"><span class="Apple-converted-space">        </span># Default ciphers to use on SSL-enabled listening sockets.</span>
> <span class="s1"><span class="Apple-converted-space">        </span># For more information, see ciphers(1SSL).</span>
> <span class="s1"><span class="Apple-converted-space">        </span>ssl-default-bind-ciphers kEECDH+aRSA+AES:kRSA+AES:+AES256:RC4-SHA:!kEDH:!LOW:!EXP:!MD5:!aNULL:!eNULL</span>
> <span class="s1">defaults</span>
> <span class="s1"><span class="Apple-converted-space">        </span>log <span class="Apple-converted-space">    </span>global</span>
> <span class="s1"><span class="Apple-converted-space">        </span>mode<span class="Apple-converted-space">    </span>http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>option<span class="Apple-converted-space">  </span>httplog</span>
> <span class="s1"><span class="Apple-converted-space">        </span>option<span class="Apple-converted-space">  </span>dontlognull</span>
> <span class="s1"><span class="Apple-converted-space">        </span>timeout connect 5000</span>
> <span class="s1"><span class="Apple-converted-space">        </span>timeout client<span class="Apple-converted-space">  </span>50000</span>
> <span class="s1"><span class="Apple-converted-space">        </span>timeout server<span class="Apple-converted-space">  </span>50000</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 400 /etc/haproxy/errors/400.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 403 /etc/haproxy/errors/403.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 408 /etc/haproxy/errors/408.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 500 /etc/haproxy/errors/500.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 502 /etc/haproxy/errors/502.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 503 /etc/haproxy/errors/503.http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>errorfile 504 /etc/haproxy/errors/504.http</span>
> <span class="s1">listen<span class="Apple-converted-space">  </span>stats<span class="Apple-converted-space">   </span></span>
> <span class="s1"><span class="Apple-converted-space">        </span>bind<span class="Apple-converted-space">            </span>*:1936</span>
> <span class="s1"><span class="Apple-converted-space">        </span>mode<span class="Apple-converted-space">            </span>http</span>
> <span class="s1"><span class="Apple-converted-space">        </span>log <span class="Apple-converted-space">            </span>global</span>
> <span class="s1"><span class="Apple-converted-space">        </span>maxconn 10</span>
> <span class="s1"><span class="Apple-converted-space">        </span>clitimeout<span class="Apple-converted-space">      </span>100s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>srvtimeout<span class="Apple-converted-space">      </span>100s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>contimeout<span class="Apple-converted-space">      </span>100s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>timeout queue <span class="Apple-converted-space">  </span>100s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats enable</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats hide-version</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats refresh 30s</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats show-node</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats auth admin:password</span>
> <span class="s1"><span class="Apple-converted-space">        </span>stats uri<span class="Apple-converted-space">  </span>/haproxy?stats</span>
> <span class="s1">frontend localnodes</span>
> <span class="s1"><span class="Apple-converted-space">    </span>bind *:8088</span>
> <span class="s1"><span class="Apple-converted-space">    </span>mode http</span>
> <span class="s1"><span class="Apple-converted-space">    </span>default_backend nodes</span>
> <span class="s1">backend nodes</span>
> <span class="s1"><span class="Apple-converted-space">    </span>mode http</span>
> <span class="s1"><span class="Apple-converted-space">    </span>balance leastconn</span>
> <span class="s1"><span class="Apple-converted-space">    </span>option forwardfor</span>
> <span class="s1"><span class="Apple-converted-space">    </span>http-request set-header X-Forwarded-Port %[dst_port]</span>
> <span class="s1"><span class="Apple-converted-space">    </span>http-request add-header X-Forwarded-Proto https if { ssl_fc }</span>
> <span class="s1"><span class="Apple-converted-space">    </span>option httpchk</span>
> <span class="s1"><span class="Apple-converted-space">    </span>server idx2 192.168.100.52:8088 ssl verify none check </span>
> <span class="s1"><span class="Apple-converted-space">    </span>server idx1 192.168.100.51:8088 ssl verify none check </span>
> ```
