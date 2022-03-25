---
title: 'Building a Splunk CIM compatible source addon'
date: '2019-01-08T13:03:20-05:00'
status: publish
permalink: /2019/01/08/building-a-splunk-cim-compatible-source-addon
author: ryan@dss-i.com
excerpt: ''
type: post
id: 591
category:
    - Uncategorized
tag: []
post_format: []
---
This walk through will build a Splunk CIM compatible source addon extending the CEF source type from my CEF framework TA. This is part three in a three part Series

Before you start, I will have to gloss over many topics you should have:

- Read the prior two articles in this series.
- You should also be comfortable with the ways Splunk can be used to parse and enrich data notable, TRANSFORMS, REPORT, EXTRACT, EVAL, and LOOKUP. A great cheat sheet is available from [Alpura](https://www.aplura.com/wp-content/uploads/2016/09/data_onboarding_cheat_sheet_v2.pdf)
- Be familiar with the[ web data model](https://docs.splunk.com/Documentation/CIM/4.12.0/User/Web).
- Be familiar with the [data dictionary](https://docs.incapsula.com/Content/read-more/log-file-structure.htm#Logfields) for our sample data

In the prior two articles we create a project style development environment for our add-on and a minimally viable set of field parse but have not yet considered any specific model. Reviewing our samples and vendor documentation we learn the data is most similar to a web access log which is known as the “web” model in the Splunk Common information model. In our case we have only two events available and vendor documentation that describes the events. When replicating this process in a new data source all unique events should be considered.

- All events are a web access event
- A subset of these events are “attack” events which do not have a web model to compare to.

Considering this we will use the “web” model as our basis and add a number of connivence elements for our users. The following table illustrates how we will map our data.

The implementation of the mapping is explained in the following table our implementation of the mapping can be viewed in [bitbucket](https://bitbucket.org/SPLServices/ta-cef-imperva-incapsula/src/master/src/TA-cef-imperva-incapsula-for-splunk/). Review default/props.conf default/transforms.conf and the lookups present in lookups/
| CEF Field                | Splunk Field                        | Notes                                                                                                                                     |
|--------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| sip                      | dest\_ip                            | Not a CIM field in the web model used by convention.  
Not present in sample not validated                                                |
| spt                      | dest\_port                          | Not a CIM field in the web model used by convention.  
Not present in sample not validated                                                |
| qstr                     | uri\_query                          | The formatting of this field contains escaped equal (=) signs and is omitting the leading question mark (?) used a complex eval to adjust |
| cs9                      | Rule\_Name AND signature            | Not a CIM field however Rule\_Name is similar to an attack signature. Use an eval to split by comma and remove empties                    |
| Attack Severity          | CEF\_severity  
severity            | This field requires a lookup to set severity as one of low,medium,high,critical created “imperva\_incapsula\_severity.csv                 |
| requestmethod            | http\_method                        |
| ref                      | http\_referrer                      |
| requestClientApplication | http\_user\_agent                   |
| dest                     | site                                |
| src\_user\_id            | user                                |
| action                   | act                                 | This field requires a lookup to translate act to action which can be allowed or blocked                                                   |
| vendor\_product          | Constant string “Imperva Incapsula” |
| app                      | vendor\_app                         | saved for user search not used in the CIM model                                                                                           |
| app                      | Constant String “incapsula”         |
| act                      | cached                              | Some values of act can indicate cached which is set to true using the actions lookup above                                                |


Creating Eventtypes
-------------------

Fields alone are not enough to include an event in a datamodel. In-fact incorrect configuration of eventtypes and tags and include data which is invalid for a model compromising the usefulness of a model.

We will create two eventtypes for this data, our implementation can be viewed in eventype.conf using the bitbucket link above:

| eventtype                       | description                                                    |
|---------------------------------|----------------------------------------------------------------|
| imperva\_incapsula\_web         | All events matching our source and sourcetype                  |
| imperva\_incapsula\_web\_attack | All eventtypes imperva\_incapsula\_web with a signature field. |


Creating Tags
-------------

The final step to include events in a data model is to tag the events. Additional tags can be created in this case “attack” make sense for the subset of events that indicate a detection by the Incapsula WAF service. Tags which are not used by the data model are not included by default and are only available to the users in search activities.

| tag    | description                               |
|--------|-------------------------------------------|
| web    | eventtype=imperva\_incapsula\_web         |
| attack | eventtype=imperva\_incapsula\_web\_attack |

Testing our work
----------------

Using “make package\_test” ensure no unexpected errors or warnings are produced.

Using our development environment and EventGen via “make docker\_dev” we can interactively validate our mapping is CIM compliant.