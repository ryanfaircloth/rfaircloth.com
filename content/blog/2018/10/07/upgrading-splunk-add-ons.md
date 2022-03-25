---
title: "Upgrading  Splunk Add Ons"
date: "2018-10-07T03:48:31-05:00"
status: publish
permalink: /2018/10/07/upgrading-splunk-add-ons
author: ryan@dss-i.com
excerpt: ""
type: post
id: 566
category:
  - Uncategorized
tag: []
post_format: []
---

This topic comes up every now and then working with customers and partners deploying and upgrading add ons for Splunk does not have to be hard there are a few rules to live by. I’m going to use Splunk_TA_Windows 5.0.1 in this walk through. This upgrade has some [specific guidance](http://docs.splunk.com/Documentation/WindowsAddOn/5.0.1/User/Upgrade) in addition to the usual steps. As can often be the case with software correcting issues can require additional work for compatibility.

# Upgrading things to do first

## Be proactive read the docs

In the release notes Splunk advises that sourcetypes will change. Two new source types “EventLog” and “XMLEventLog” will replace all previous event log specific source types. The source will indicate the specific log used which is consistent with most other source/sourcetypes use in Splunk. Sourcetype is a structure and source is an instance of the structure for a specific host. As instructed review custom searches and eventypes and update to utilize source rather than sourcetype.

Review the additional changes in the docs determine if any apply to your environment.

## Review local changes

Identify any search time local changes made to the sourcetypes managed by the add-on in question. In most cases these will located in the $SPLUNK_HOME/etc/apps/Splunk_TA_windows/local folder however in some cases you may find them in $SPLUNK_HOME/etc/apps/Splunk_TA_windows/search. Review and compare to the latest version of the add on, confirm they can or should remain at upgrade time.

Identify any index time local changes made to the sourcetypes managed by the add on in most cases these can be found in the cluster master $SPLUNK_HOME/etc/master-apps/Splunk_TA_windows/local however in some organizations customizations are made in another custom app. If you have inherited this environment be sure to consider how others may have made customizations before you.

While this post is specific to Splunk_TA_windows most steps do apply to any add-on deployment.

# Installing the upgrade

The first step when possible is to test in a non production environment, in many cases the only complete environment is Production care should be taken and changes should be made in off hours.

## Search Heads (non clustered)

Repeat on each search head

1. Backup the current app from by copying Splunk_TA_windows to a safe location
2. Install the app using the CLI or app browser “install from file”
3. Restart the search head
4. Verify any custom dashboards or alert searches continue as expected

## Search Heads (clustered)

Repeat on each search head cluster

1. Backup the current app from by copying Splunk_TA_windows to a safe location on a search head cluster member
2. (ES Only) For a ES Search head cluster only remove the Splunk_TA_Windows from shcluster/apps on the deployer and apply the new bundle to the cluster using the preserve-lookups option as documented in the Enterprise Security documentation
3. Verify Splunk_TA_Windows is removed from the peers
4. Expand Splunk_TA_Windows into shcluster/apps
5. Apply the new bundle using preserve-lookups if ES

## Indexers

1. Expand Splunk_TA_Windows in a temporary location, remove the following files
1. &lt;app&gt;/bin
1. &lt;app&gt;/default/eventgen.conf
1. &lt;app&gt;/default/inputs.conf
1. &lt;app&gt;/default/wmi.conf
1. &lt;app&gt;/default/indexes.conf
1. Splunk has removed all index definitions from this add-on in accordance with best practices and app verification requirements. Review the indexes in use and ensure the indexes have been re-defined according to your environments requirements.
1. Verify the organizations indexes.conf contains all required indexes
1. Deploy the updated add-on via master-apps for clustered indexers (automatic rolling restart) or to apps on all non clustered indexers and restart.

## Intermediate Heavy Forwarders

1. Expand Splunk_TA_Windows in a temporary location, remove the following files
1. &lt;app&gt;/bin
1. &lt;app&gt;/default/eventgen.conf
1. &lt;app&gt;/default/inputs.conf
1. &lt;app&gt;/default/wmi.conf
1. &lt;app&gt;/default/indexes.conf
1. Deploy to apps on all instances and restart

## Collecting Forwarders using the deployment server

1. Review all deployment-apps/\*/local/inputs.conf applied to windows systems as follows.
1. Ensure index is specified on each utilized input
1. Ensure disabled=false is specified on each utilized input
1. If no inputs.conf is found “demo defaults” has been utilized up to this point. Copy Splunk_TA_windows/default/inputs to Splunk_TA_windows/local and review stanzas to determine which should remain enabled
1. Backup deployment-apps/Splunk_TA_windows to a safe location and remove
1. Expand Splunk_TA_windows to deployment-apps.
1. Reload the deployment server
1. Verify no “missing index” messages appear in the cluster if so identify the incorrectly configured input and redeploy
1. Verify no new use of last change or main index if so identify the incorrectly configured input and redeploy.
1. Repeat verification of searches and alerts as above.
