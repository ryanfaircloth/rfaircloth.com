---
title: 'Making Asset data useful with Splunk Enterprise Security CSC 1 Part 1'
date: '2016-01-07T22:31:55-05:00'
status: publish
permalink: /2016/01/07/making-asset-data-useful-with-splunk-enterprise-security
author: ryan@dss-i.com
excerpt: ''
type: post
id: 163
category:
    - 'SANS Critical Control'
    - Security
    - Splunk
tag: []
post_format: []
---
[![54080041](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2016/01/54080041.jpg?resize=500%2C378)](https://i0.wp.com/www.rfaircloth.com/wp-content/uploads/2016/01/54080041.jpg)

Update broken link 2017-10-04

Friend we need to talk, there is something important that you have been overlooking for a long time. Two years ago when you implemented your first SIEM you gave your consultant an excel file listing all of your servers on the corporate network. You promised you would spend time on it after the consultant left but, then you got the new FireEye. You didn’t forget but then the you got a new Next Gen firewall and after there was the new red team initiative.

It is time make a difference in the security posture of your organization. It is time to take a bite out of CSC #1a that’s not a typo we need to work on #1a, #2 can wait. so can #1b .It is time to work SANs critical control #1. I know the CMDB is out of date and doesn’t reflect today’s architecture. We can do a lot with a small amount of work, today I will share how to lay a foundation to address <span class="label">CSC 1: Inventory of Authorized (a) and Unauthorized Devices (b).</span>

Objective
---------

###### Objective 1: **Identify the location of each asset using latitude, longitute, city state and zip** 

###### Objective 2: **Identify the compliance zone for each network segment**

###### Objective 3: **Identify categories that can assist the analyst in review of events related to the network containing the source or destination**

###### Objective 4: **Identify the minimum priority of devices in a given network segment.**

Code is provided via [Security Kit](https://splunkbase.splunk.com/app/3055/) Install the app “SecKit\_SA\_idm\_common” on your ES Search head.

> ##### Don’t forget to update the app imports to include “SecKit\_SA\_.\*”

Walkthrough
-----------

1. Update seckit\_idm\_pre\_cidr\_location.csv so that for each subnet in cidr notation define the location. On a very large campus it may be desirable to present a point on a specific building however in most cases it will be adequate to have a single lat/long pair for all subnets on a campus. Include all private and public spaces owned or managed by your organization do not include any public space not external spaces such as hosting providers and cloud services.
2. Update seckit\_idm\_pre\_cidr\_category.csv note subnet in this case may be larger or smaller than used in locations. The most precise definition will be utilized by Splunk Identity Management within Enterprise Security. This may contain cloud address space if the ip space is not continually re-purposed 
  1. Populate pci\_cidr\_domain we will overload this field for non PCI environments. 
      1. PCI usage “wireless ORtrust|cardholder OR trust|dmz OR empty (empty or default represents untrust
      2. Non PCI usage substitute other compliance in place of cardholder such as pii, sox, hippa, cip
  2. Populate cidr\_priority 
      1. low the most often used value should represent the majority of your devices
      2. medium common servers
      3. high devices of significant importance
      4. critical devices requiring immediate response such as 
            1. A server whose demise would cause you to work on Christmas
            2. A server whose demise could cause the closure of the company even if you work on Christmas
  3. Populate cidr\_category values provided here would apply to all devices in this network. I will list some very common categories I apply note each category needs to be pipe “|” separated and may not contain a space 
      1. net\_internal – internal IP space
      2. net\_external – external IP space
      3. netid\_ddd\_ddd\_ddd\_ddd\_bits – applied to each allocated subnet (smallest assigned unit.
      4. zone\_string – where string is one of dmz, server, endpoint, storage management, wan, vip, nat
      5. facility\_string – where string is the internal facility identification code
      6. facility\_type\_string – where string is a common identifier such as datacenter, store, office, warehouse, port, mine, airport, moonbase, cloud, dr, ship
      7. net\_assignment\_string – where string is static dyndhcp, dynvirt
  4. Run the saved search “seckit\_idm\_common\_assets\_networks\_lookup\_gen” and review the results in seckit\_idm\_common\_assets\_networks.csv you may run this report on demand as the lookup files above are changed or on a schedule of your choice.
  5. Enable the asset file in enterprise security by navigating to Configuration –&gt; Enrichment –&gt; Assets and Identities then clicking enable on “seckit\_idm\_common\_assets\_networks”

Bonus Objective
---------------

Enhance your existing server and network device assets list by integrating the following lookups and merging the OUTPUT fields with the device specific asset data.

1. ```
  | lookup seckit_idm_pre_cidr_category_by_cidr_lookup cidr as lip OUTPUT cidr_pci_domain as pci_domain cidr_category as category
  ```
2. ```
  | lookup idm_shared_cidr_location_lookup cidr as ip OUTPUT lat long city country
  ```