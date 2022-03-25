---
title: "Lets Encrypt and get an A for A Great Splunk TLS config"
date: "2018-01-17T01:52:23-05:00"
status: publish
permalink: /2018/01/17/lets-encrypt-and-get-an-a-for-a-great-splunk-tls-config
author: ryan@dss-i.com
excerpt: ""
type: post
id: 496
category:
  - Uncategorized
tag: []
post_format: []
---

Setting up SSL/TLS on Splunk doesn’t have to be super hard or costly. While running Splunk in cloud providers has many benefits there are some hassles like provisioning certificates we can better manage using let’s encrypt. This method of installing browser trusted certificates can help to keep your administrative costs down in large Splunk deployments such as MssP services.

Expanding on prior work <https://www.splunk.com/blog/2016/08/12/secure-splunk-web-in-five-minutes-using-lets-encrypt.html>

## NGINX

First we are going to install NGINX we will use this as a front end reverse proxy. Why, we can renew our certs with minimal own time in the future, OCSP stapling (improved page load times) and other things (future posts)

> \#centos
>
> yum install nginx
>
> \#ubuntu
>
> apt-get install nginx

Second setup a new vhost for the splunk reverse proxy. Any request to http will be redirected to https except for requests related to certificate management.

> <span class="s1">map $uri $redirect_https {</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>/.well-known/<span class="Apple-converted-space"> </span>0;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>default<span class="Apple-converted-space"> </span>1;</span>
>
> <span class="s1">}</span>
>
> <span class="s1">server {</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>listen <span class="Apple-converted-space"> </span>80;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>server_name<span class="Apple-converted-space"> </span>hf-scan.splunk.example.com;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>root /usr/share/nginx/html;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>if ($redirect_https = 1) {</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>return 301 https://$server\_name$request_uri;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>}</span>
>
> <span class="s1">\#<span class="Apple-converted-space"> </span>return <span class="Apple-converted-space"> </span>301 $scheme://hf-scan.splunk.example.com$request_uri;</span>
>
> <span class="s1">}</span>
>
> <span class="s1">server {</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span></span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>listen 443 ssl http2;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>server_name hf-scan.splunk.example.com;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>root /usr/share/nginx/html;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>index index.html index.htm;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>location / {</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>proxy_pass_request_headers on;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>proxy_set_header x-real-IP $remote_addr;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>proxy_set_header x-forwarded-for $proxy_add_x_forwarded_for;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>proxy_set_header host $host;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>proxy_pass https://127.0.0.1:8000;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>add_header Strict-Transport-Security “max-age=31536000; includeSubDomains” always;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>}</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span></span>
>
> <span class="s1"><span class="Apple-converted-space"> </span></span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_certificate <span class="Apple-converted-space"> </span>/etc/letsencrypt/live/hf-scan.splunk.example.com/fullchain.pem;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_certificate_key /etc/letsencrypt/live/hf-scan.splunk.example.com/privkey.pem;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_protocols <span class="Apple-converted-space"> </span>TLSv1.2;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_ciphers <span class="Apple-converted-space"> </span>HIGH:!aNULL:!MD5;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_dhparam /etc/nginx/ssl/dhparam.pem;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_session_cache shared:SSL:50m;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_session_timeout 1d;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_session_tickets off;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_prefer_server_ciphers on;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_stapling on;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>ssl_stapling_verify on;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>resolver 8.8.8.8 8.8.4.4 valid=300s;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>resolver_timeout 5s;</span>
>
> <span class="s1"><span class="Apple-converted-space"> </span>add_header Strict-Transport-Security “max-age=31536000; includeSubDomains” always;</span>
>
> <span class="s1">}</span>

Setup a deploy hook script this will prepare the cert files as splunk needs them and will also be used on renewal. Save this script as <span class="s1">/etc/letsencrypt/renewal-hooks/deploy/splunk.sh</span>

> ```
> #!/bin/bash
> #deploy to /etc/letsencrypt/renewal-hooks/deploy/splunk.sh
> #when requesting a cert add "--deploy-hook /etc/letsencrypt/renewal-hooks/deploy/splunk.sh" to the command
> dir=/opt/splunk/etc/auth/ssl
> if [[ ! -e $dir ]]; then
>     mkdir -p $dir
> elif [[ ! -d $dir ]]; then
>     echo "$dir already exists but is not a directory" 1>&2
> fi
> openssl rsa -aes256 -in $RENEWED_LINEAGE/privkey.pem -out $dir/protected.pem -passout pass:password
> if [[ ! -f $dir/protected.pem ]]; then
>     exit 1
> fi
> cat $dir/protected.pem $RENEWED_LINEAGE/fullchain.pem > $dir/server.pem
> cp $RENEWED_LINEAGE/fullchain.pem $dir/
> cp $RENEWED_LINEAGE/privkey.pem $dir/
> chown splunk:splunk $dir/*
> systemctl restart splunk
> ```

Request the certificate note correct the webroot folder for your platform and the certificate with the fqdn of your server

> certbot <span class="s1">certonly –webroot -w /var/www/html –hsts -d hf-scan.splunk.example.com </span><span class="s1">–noninteractive –agree-tos –email your@example.com </span><span class="s1">–deploy-hook /etc/letsencrypt/renewal-hooks/deploy/splunk.sh</span>

## Setup Splunk

Update /opt/splunk/etc/system/local/web.conf

> <span class="s1">\[settings\]</span>
>
> <span class="s1">enableSplunkWebSSL = true</span>
>
> <span class="s1">\#sendStrictTransportSecurityHeader = true</span>
>
> <span class="s1">sslVersions = tls1.2</span>
>
> <span class="s1">cipherSuite = TLSv1.2:!NULL-SHA256:!AES128-SHA256:!ADH-AES128-SHA256:!ADH-AES256-SHA256:!ADH-AES128-GCM-SHA256:!ADH-AES256-GCM-SHA384</span>
>
> <span class="s1">privKeyPath =<span class="Apple-converted-space"> </span>/opt/splunk/etc/auth/ssl/privkey.pem</span>
>
> <span class="s1">caCertPath = /opt/splunk/etc/auth/ssl/fullchain.pem</span>

Update /opt/splunk/etc/system/local/server.conf

> <span class="s1">\[general\]</span>
>
> <span class="s1">serverName = hf-scan.splunk.example.com</span>
>
> <span class="s1">\[sslConfig\]</span>
>
> <span class="s1">sslVersions = tls1.2</span>
>
> <span class="s1">sslVersionsForClient = tls1.2</span>
>
> <span class="s1">serverCert = $SPLUNK_HOME/etc/auth/ssl/server.pem</span>
>
> <span class="s1">sslRootCAPath = $SPLUNK_HOME/etc/auth/ssl/fullchain.pem</span>
>
> <span class="s1">dhFile = /opt/splunk/etc/auth/ssl/dhparam.pem</span>
>
> <span class="s1">sendStrictTransportSecurityHeader = true</span>
>
> <span class="s1">allowSslCompression = false</span>
>
> <span class="s1">cipherSuite = TLSv1.2:!NULL-SHA256:!AES128-SHA256:!ADH-AES128-SHA256:!ADH-AES256-SHA256:!ADH-AES128-GCM-SHA256:!ADH-AES256-GCM-SHA384</span>
>
> <span class="s1">useClientSSLCompression = false</span>
>
> <span class="s1">useSplunkdClientSSLCompression = false</span>

## Test

- Option 1 SSL labs, limited to port 443 (don’t forget about 8089)
- Option 2 testssl.sh CLI based doesn’t share data no letter grade (management likes letters)
- Option 3 High Tech Bridge https://www.htbridge.com/ssl allows testing multiple ports similar coverage to ssllabs less well known

## Renew certs

Setup a cron job to run the following command at least once per week in your scheduled change window. If a certificate renewal is required splunk will be restarted

> <span class="s1">certbot renew –webroot -w /usr/share/nginx/html</span>
