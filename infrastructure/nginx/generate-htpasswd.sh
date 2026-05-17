#!/bin/sh
set -eu

user="${NGINX_AUTH_USER:-admin}"
pass="${NGINX_AUTH_PASS:-admin}"

printf '%s:%s\n' "$user" "$(openssl passwd -apr1 "$pass")" > /etc/nginx/.htpasswd
