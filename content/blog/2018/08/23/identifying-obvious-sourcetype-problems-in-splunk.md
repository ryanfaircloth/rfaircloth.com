---
title: "Identifying obvious sourcetype problems in Splunk"
date: "2018-08-23T09:39:39-05:00"
status: publish
permalink: /2018/08/23/identifying-obvious-sourcetype-problems-in-splunk
author: ryan@dss-i.com
excerpt: ""
type: post
id: 561
category:
  - Uncategorized
tag: []
post_format: []
---

This is a short one, on boarding data into any system is great making it identifiable and usable by the end users thats even more important. In Splunk source, sourcetype, and index are the most basic bits of metadata available to users and often they work with only these three because its just so easy. When our upstream sources don’t set these values correctly it can stress the environment because we are doing unnecessary work like “line merging” and our users can’d find data. Using Splunk logs we can see where this may be happening and start to fix it. This search will identify suspect sourcetypes. Review the onboarding of each identified to make it better.

````
<pre class="wp-block-code">```
index=_internal source="*metrics.log" sourcetype=splunkd group=per_sourcetype_thruput
| eval sourcetype_error=if(match(series,"^[\$\%\#]"),"__Invalid_char",sourcetype_error)
| eval sourcetype_error=if(isnull(series) OR st="" ,"__Invalid_null",sourcetype_error)
| eval sourcetype_error=if(match(series,"^\/"),"__Invalid_usedpath",sourcetype_error)
| eval sourcetype_error=if(match(series,"^\d+\.\d+\.\d+\.\d+"),"__Invalid_used_IP",sourcetype_error)
| eval sourcetype_error=if(match(series,"\s"),"__Invalid_space",sourcetype_error)
| eval sourcetype_error=if(like(series,"%small"),"__Invalid_too_small",sourcetype_error)
| eval sourcetype_error=if(match(series,"\d+"),"__Invalid_numeric",sourcetype_error)
| eval sourcetype_error=if(match(series,"\-\d"),"__Invalid_learnednum",sourcetype_error)
| eval sourcetype_error=if(match(series,"\-error"),"__Invalid_learnederror",sourcetype_error)
| eval sourcetype_error=if(match(series,"\*"),"__Invalid_asterisk",sourcetype_error)
| eval sourcetype_error=if(match(series,"\.\w{1,4}$"),"__Invalid_filename",sourcetype_error)
| eval sourcetype_error=if(match(series,"[\.\-]log$"),"__Invalid_autousinglogfilename",sourcetype_error)
| eval sourcetype_error=if(match(series,"^![\w\_\-\:]+$"),"__Invalid_nonsourcetype_errorndardform",sourcetype_error)
| search sourcetype_error=*
| stats sum(kb) as kb avg(kbps) as kbps_avg avg(eps) as eps_avg sum(ev) as ev values(sourcetype_error) by series
| eval mb=round(kb/1024,2)
| fields - kb
| sort limit=0 -mb
````

```

Code as snippet <https://bitbucket.org/snippets/rfaircloth-splunk/Benb45>
```
