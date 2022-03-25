---
title: "Phishing from someone else's container ship."
date: "2019-08-11T18:14:48-05:00"
status: publish
permalink: /2019/08/11/phishing-from-someone-elses-container-ship
author: ryan@dss-i.com
excerpt: ""
type: post
id: 688
category:
  - Uncategorized
tag: []
post_format: []
---

This is a theoretical attack abusing a compromised kubectl certificate pair and exposed K8s api to deploy a phishing site transparently on your targets infrastructure. This is a difficult attack to pull off and required existing compromised administrative access to the k8s cluster. A privileged insider, or compromised cert based authentication credential can be used.

- Target www.spl.guru which is one of my test domains.
- Desired outcome detect an attempt to intercept admin login for a wordpress site we will utilize a fake email alert informing the administrator a critical update must be applied.
- We will deploy the site hidden behind the targets existing ingress controller, this allows us utilize the customers own domain and certificates eliminating detection by domain name (typo squatting etc) and certificate transparency reporting monitoring.

## Phase one: Recon

Using kubectl identify name spaces and find the ingress controller used for the site you intended to compromise. For the purposes of my poc my target used a very obvious “wordpress” namespace.

> <span class="s1"> kubectl -n wordpress get ing</span>
>
> <span class="s1">NAME HOSTS ADDRESS PORTS AGE</span>
>
> <span class="s1">site www.spl.guru 133a0685-wordpress-site-62d9-1332557661.us-east-1.elb.amazonaws.com 8020h</span>

## Phase two: deploy [gophish](https://getgophish.com)

I’m not going to go into details on deploying gophish and setting up or sending the phishing emails. Thats beyond the scope of the blog post, I’m here to help the blue team so lets get on to detection.

The following manifest hides the gophish instance on a path under the main site url. Of note in this case /wplogin.cgi” is the real site while /wplogin is where we are credential harvesting.

> apiVersion: extensions/v1beta1  
> kind: Ingress  
> metadata:  
> name: “site”  
> namespace: wordpress  
> annotations:  
> kubernetes.io/ingress.class: alb  
> alb.ingress.kubernetes.io/scheme: internet-facing  
> alb.ingress.kubernetes.io/tags: Environment=dev,Team=test  
> alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-1:174701313045:certificate/15d484c8-ca0c-4194-a4ef-f38a43b7b977  
> alb.ingress.kubernetes.io/listen-ports: ‘\[{“HTTP”: 80}, {“HTTPS”:443}\]’  
> alb.ingress.kubernetes.io/actions.ssl-redirect: ‘{“Type”: “redirect”, “RedirectConfig”: { “Protocol”: “HTTPS”, “Port”: “443”, “StatusCode”: “HTTP_301”}}’  
> \# external-dns.alpha.kubernetes.io/hostname: search.gdi.spl.guru.,master.gdi.spl.guru.  
> spec:  
> rules:  
> – host: www.spl.guru  
> http:  
> paths:  
> – path: /wplogin  
> backend:  
> serviceName: gophish  
> servicePort: 80  
> – path: /  
> backend:  
> serviceName: wordpress  
> servicePort: 80

## Phase three: Detecting what we did

Using the K8S events and meta data onboard using Splunk Connect for K8S we have some solid places we can monitor for abuse. Side note don’t get hung up on “gophish” this is a hammer type tool your opponent may be much more subtle

- Modification to an ingress in my case AWS ALB, ingress records for most will not change often when they are changed an associated approved deployment should also exist.

> “kubernetes.io/ingress-name:” sourcetype=”kube:container:alb-ingress-controller” modifying

- New Image, New Image Repository, New Registry, maintain a list of approved images and registries alert when an image is used not on the pre-defined list, this . may be noisy in dev clusters for no prod clusters reporting may be better than alerting.

> index=em_meta “spec.containers{}.image”=”\*”
