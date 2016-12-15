#!/bin/sh
sed -i 's/#DATAFOUNDRY_APISERVER_ADDR#/'$DATAFOUNDRY_APISERVER_ADDR'/g' /etc/nginx/nginx.conf
sed -i 's/#DATAFOUNDRY_APISERVER_AWS_ADDR#/'$DATAFOUNDRY_APISERVER_AWS_ADDR'/g' /etc/nginx/nginx.conf

chown -R nginx.nginx /var/lib/nginx

nginx -g "daemon off;"
