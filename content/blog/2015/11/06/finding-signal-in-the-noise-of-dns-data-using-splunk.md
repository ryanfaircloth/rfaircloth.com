---
title: "Finding signal in the noise of DNS data using Splunk"
date: "2015-11-06T09:35:44-05:00"
status: publish
permalink: /2015/11/06/finding-signal-in-the-noise-of-dns-data-using-splunk
author: ryan@dss-i.com
excerpt: ""
type: post
id: 143
category:
  - Uncategorized
tag: []
post_format: []
---

DNS is a fundamental component of our computing infrastructure before we identify bad actions easily we should remove what we can easily identify to be good. For all of our queries we will rely on common information model fields and extractions. For most customers I will assist them in deploying the Splunk App for Stream to collect query information from their DNS servers in a reliable way regardless of the logging capabilities of their chosen server product.

Note: Be sure to install Cedric’s [URLToolbox](https://splunkbase.splunk.com/app/2734/) Add on we will make use of its power here.

Lets start by looking at the data everyone is spending the most time talking about queries for A (ipv4) and AAA (ipv6). Lets search for no more than the last 60 min while we are working to be kind to our indexers. For real analysis you will use bigger windows.

> tag=dns tag=resolution tag=dns index=\* NOT source=”stream:Splunk\_\*” (query_type=A OR query_type=AAAA)

My sample environment is small very small 5 users, 10 windows servers. In the last 24 hours this query gave me 24,000+ results way more than I can examine lets start to cut that down. We also need to remember what we will probably be learning from our data that is which domains require investigation for suspicion of involvement in malicious activity.

Reduction #1 Lets remove all domains owned by our organization for email or web hosting.

> - Update the following files to include the domains used for email or web hosting.
>   1. Splunk_SA_CIM/lookups/cim_corporate_email_domains.csv
>   2. Splunk_SA_CIM/lookups/cim_corporate_web_domains.csv
> - Update our search to extract the domain and tld for latter use. this is more complicated than it looks so we will make up a uri and let UTToolbox do the work for us
> - The new base search will look like this  
>   tag=dns tag=resolution tag=dns NOT source=”stream:Splunk\_\*” index=\* (query_type=A OR query_type=AAAA)  
>   | eval uri=”dnsquery://”+query  
>   | `ut\_parse(uri)` | fields – ut_fragment ut_netloc ut_params ut_path ut_port ut_query ut_scheme
> - Now we can use our email and web domain lookups to reduce the data set we are working with. This took about about 13% of my results. Notice I use fields – to get rid of stuff I don’t need moved from my indexer back to my search heads.
> - tag=dns tag=resolution tag=dns NOT source=”stream:Splunk\_\*” index=\* (query_type=A OR query_type=AAAA)  
>   | eval uri=”dnsquery://”+query  
>   | `ut\_parse(uri)`  
>   | fields – ut_fragment ut_netloc ut_params ut_path ut_port ut_query ut_scheme  
>   | lookup cim_corporate_email_domain_lookup domain as ut_domain OUTPUT domain as cim_email_domain  
>   | lookup cim_corporate_web_domain_lookup domain as ut_domain OUTPUT domain as cim_web_domain  
>   | where isnull(cim_email_domain) AND isnull(cim_web_domain)  
>   | fields -cim_email_domain cim_web_domain)
> - The next easy win is to remove all queries for one of our assets we do that by kicking out all queries for one of our assets by dns name or where the resulting IP is one of our assets
> - tag=dns tag=resolution tag=dns NOT source=”stream:Splunk\_\*” index=\* (query_type=A OR query_type=AAAA)  
>   | eval uri=”dnsquery://”+query  
>   | `ut\_parse(uri)`  
>   | fields – ut_fragment ut_netloc ut_params ut_path ut_port ut_query ut_scheme  
>   | lookup cim_corporate_email_domain_lookup domain as ut_domain OUTPUT domain as cim_email_domain  
>   | lookup cim_corporate_web_domain_lookup domain as ut_domain OUTPUT domain as cim_web_domain  
>   | where isnull(cim_email_domain) AND isnull(cim_web_domain)  
>   | fields – cim_email_domain cim_web_domain  
>   | lookup asset_lookup_by_str dns as query OUTPUTNEW asset_id as query_asset_id  
>   | lookup asset_lookup_by_cidr ip as host_addr OUTPUTNEW asset_id as host_addr_asset_id  
>   | where isnull(query_asset_id) AND isnull(host_addr_asset_id)  
>   | fields – query_asset_id host_addr_asset_id
> - Next up is to remove all queries for Alexa Top 1 M domains why? well in the Top 1M we will probably not find any new domains, or any domains being used for C2 using a DNS channel. Thats not to say XML file on drop box or feedburner can’t be used but we won’t find that threat here. This further reduced by data set by 92%
> - tag=dns tag=resolution tag=dns NOT source=”stream:Splunk\_\*” index=\* (query_type=A OR query_type=AAAA)  
>   | eval uri=”dnsquery://”+query  
>   | `ut\_parse(uri)`  
>   | fields – ut_fragment ut_netloc ut_params ut_path ut_port ut_query ut_scheme  
>   | lookup cim_corporate_email_domain_lookup domain as ut_domain OUTPUT domain as cim_email_domain  
>   | lookup cim_corporate_web_domain_lookup domain as ut_domain OUTPUT domain as cim_web_domain  
>   | where isnull(cim_email_domain) AND isnull(cim_web_domain)  
>   | fields – cim_email_domain cim_web_domain  
>   | lookup asset_lookup_by_str dns as query OUTPUTNEW asset_id as query_asset_id  
>   | lookup asset_lookup_by_cidr ip as host_addr OUTPUTNEW asset_id as host_addr_asset_id  
>   | where isnull(query_asset_id) AND isnull(host_addr_asset_id)  
>   | fields – query_asset_id host_addr_asset_id  
>   | lookup alexa_lookup_by_str domain as ut_domain OUTPUTNEW rank as alexa_rank  
>   | where isnull(alexa_rank)
> - Down from 24K to under 1700 but that’s still alot, at this point I noticed a couple of things. I have queries for .local domains I can’t explain but I know are not malicious, bare host names (no period) and I have a couple of devices servicing DNS from guest wifi identify those points and update the search to remove them. This leaves me with 216 domains to investigate. But we can tune this even further lets keep going.
> - CDN networks can host malicious content however dns analysis is again not the way to find such threats. This takes me down to 173 domains
>   - Create a new lookup Splunk_SA_cim/lookups/custom_cim_cdn_domains.csv you may find new domains and need to update this list over time
>   - Upload this file [custom_cim_cdn_domains](http://www.rfaircloth.com/wp-content/uploads/2015/11/custom_cim_cdn_domains.csv)
>   - add a new lookup via Splunk_SA_cim/local/transforms.conf \[custom_cim_cdn_domain_lookup\]  
>      filename = custom_cim_cdn_domains.csv  
>      match_type = WILDCARD(domain)  
>      max_matches = 1
>   - Update with a new search to exclude known CDN domains
>   - tag=dns tag=resolution tag=dns NOT source=”stream:Splunk\_\*” index=\* (query_type=A OR query_type=AAAA)  
>      query=”\*.\*” NOT query=”\*.local”  
>      | eval uri=”dnsquery://”+query  
>      | `ut\_parse(uri)`  
>      | fields – ut_fragment ut_netloc ut_params ut_path ut_port ut_query ut_scheme  
>      | lookup cim_corporate_email_domain_lookup domain as ut_domain OUTPUT domain as cim_email_domain  
>      | lookup cim_corporate_web_domain_lookup domain as ut_domain OUTPUT domain as cim_web_domain  
>      | where isnull(cim_email_domain) AND isnull(cim_web_domain)  
>      | fields – cim_email_domain cim_web_domain  
>      | lookup asset_lookup_by_str dns as query OUTPUTNEW asset_id as query_asset_id  
>      | lookup asset_lookup_by_cidr ip as host_addr OUTPUTNEW asset_id as host_addr_asset_id  
>      | where isnull(query_asset_id) AND isnull(host_addr_asset_id)  
>      | fields – query_asset_id host_addr_asset_id  
>      | lookup alexa_lookup_by_str domain as ut_domain OUTPUTNEW rank as alexa_rank  
>      | where isnull(alexa_rank)  
>      | lookup custom_cim_cdn_domain_lookup domain as query OUTPUTNEW is_cdn |  
>      where isnull(is_cdn)

- Optional Step if you have domain tools integration enabled (whois) the following lines added to your search will show when the domain was first seen by you and when it was registered.
- > | rename ut_domain as domain  
  > | `get\_whois`  
  > | eval “Age (days)”=ceil((now()-newly_seen)/86400)
- Many people of written on what to do with this data now, go hunting!
