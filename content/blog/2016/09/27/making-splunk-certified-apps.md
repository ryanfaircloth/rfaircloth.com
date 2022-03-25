---
title: "Making Splunk Certified Apps"
date: "2016-09-27T10:37:31-05:00"
status: publish
permalink: /2016/09/27/making-splunk-certified-apps
author: ryan@dss-i.com
excerpt: ""
type: post
id: 385
category:
  - Splunk
tag:
  - appinspect
  - bitbucket
  - conf2016
  - development
  - git
  - pipelines
  - Splunk
post_format: []
---

As a developer of “Apps” for the Splunk platform; I have been very eager to automate more tedious tasks including build and static code analysis. Today our very awesome development community has access to a new tool [App Inspect](http://dev.splunk.com/goto/appinspectdocs). The new python based extensible framework will allow your automated build process to validate key issues and prepare for formal certification for Public apps on Splunk Base, or assure quality for internally developed apps. The process example can easily be ported to the tool section of your choice allowing for effective version control and testing of applications built on the Splunk platform.

To help you get started I’ve developed an example using our partner’s tools at Atlassian.

- Bitbucket repository containing the source
- CMAKE build script for packaging and versioning
- Bitbucket pipelines integration using docker to ensure a clean package and execute validation
- Publish to AWS S3 as a package repository before manual publishing to Splunk Base

Getting started review https://bitbucket.org/Splunk-SecPS/seckit\_sa\_geolocation this is my first and most complete example.

- CMakeLists.txt controls the build process
- src/ contains the applications source
- src/default/app.conf.in is the template for app.conf our build will update this file with the correct version tag supplied by git
- bitbucket-pipelines.yml controls the pipelines automated integration process
  - Retrieve and deploy the latest docker image with build tools and app inspect
  - Package the app
  - Push to S3

Try it yourself!
