# Local Docker Web Gateway

Date: 2026-05-20

## Goal

Make the local frontend Docker profile serve the real Next.js web app through
the public Nginx gateway while preserving production-style host aliases.

## Planned Scope

- Replace placeholder frontend web containers with the real `apps/web` runtime.
- Add local `.localhost` aliases for the public web gateway.
- Keep admin aliases reserved until an admin webapp service exists.
- Allow gateway host ports to be overridden for single-machine local runs.

## Completed Work

- Added an `apps/web` Dockerfile that starts `@firstspawn/web` with Next dev on
  `0.0.0.0:3000`.
- Updated `public-webapp` to build the Next app, expose port `3000`, mount
  web/UI source folders for local edits, and join both frontend and backend
  Docker networks.
- Updated `nginx-public` to route `web.localhost` and production-style public
  domains to `public-webapp:3000`.
- Changed `admin.localhost` and `admin.firstspawn.com` to return `503` instead
  of incorrectly proxying to the public app.
- Made public, private, and mail gateway host ports configurable through
  Compose environment variables.
- Documented the local all-profiles Docker command and local public gateway
  behavior in `README.md`.

## Validation

- `docker compose --profile frontend config --services` returned `dozzle`,
  `public-webapp`, and `nginx-public`.
- `docker compose exec nginx-public nginx -t` passed.
- `curl.exe -I http://web.localhost/en` returned `200 OK` from Next.js.
- `curl.exe -i http://admin.localhost/` returned the intended `503` placeholder.

## Notes

The old `admin-webapp` placeholder container may remain as an orphan until the
stack is recreated with `--remove-orphans`. It is not part of the current
Compose service model.
