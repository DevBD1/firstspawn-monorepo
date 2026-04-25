# docker-data template

This directory documents the local `docker-data/` files used by the mail
service. Copy these examples into `docker-data/` on the server and replace the
placeholder values with generated local values.

Do not commit the live `docker-data/` directory. It contains account password
hashes and DKIM private keys.

Expected live layout:

```text
docker-data/dms/config/dovecot-quotas.cf
docker-data/dms/config/postfix-accounts.cf
docker-data/dms/config/opendkim/TrustedHosts
docker-data/dms/config/opendkim/KeyTable
docker-data/dms/config/opendkim/SigningTable
docker-data/dms/config/opendkim/keys/<domain>/mail.txt
docker-data/dms/config/opendkim/keys/<domain>/mail.private
```

Generate mail accounts and DKIM keys with the mail container tooling, then keep
the generated files only on the deployment host or in a secrets manager.
