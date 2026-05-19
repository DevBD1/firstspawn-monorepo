# docker-data.example

This directory is a publish-safe template for the untracked local
`docker-data/` directory. Use it when provisioning host-local mail data that must
not be committed.

Do not commit the live `docker-data/` directory. It contains account password
hashes and DKIM private keys.

`docker-compose.yml` mounts `docker-data/dms/...` into the optional
`mailserver` service. That service is behind the Compose `mail` profile, so
plain `docker compose up` does not start it.

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

Host setup rule:

1. Copy only the needed `.example` files into `docker-data/`.
2. Remove the `.example` suffix in the live directory.
3. Replace placeholder domains and values with generated local values.
4. Start the mail profile: `docker compose --profile mail up -d mailserver`.
5. Create the first mailbox:
   `docker compose exec mailserver setup email add admin@example.com`.
6. Generate DKIM for the live domain:
   `docker compose exec mailserver setup config dkim domain example.com`.
7. Publish DNS records: `A/AAAA`, `MX`, `SPF`, `DKIM`, `DMARC`, and reverse
   DNS/PTR.
8. Keep generated files only on the deployment host or in a secrets manager.

Do not copy real account hashes or DKIM private keys back into this template.

The API server should use the mail server over SMTP submission:

```bash
MAIL_SERVER=mail.example.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
MAIL_USERNAME=admin@example.com
MAIL_PASSWORD=<mailbox-password>
MAIL_FROM=admin@example.com
```
