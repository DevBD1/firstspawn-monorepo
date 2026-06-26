# Three-Gateway Docker Architecture Refactor

Date: 2026-05-19

## Goal

Refactor the Docker infrastructure to a secure, modular three-gateway architecture that isolates public web, private admin, and mail services.

## Planned Scope

- Isolate public-facing traffic from internal management tools.
- Create three isolated bridge networks: `frontend-net`, `backend-net`, and `mail-net`.
- Disable IPv6 across the internal stack to reduce attack surface.
- Setup three specialized Nginx containers (`public`, `private`, `mail`) on host ports 80, 8080, and 8081 respectively.
- Reorganize services into Docker Compose profiles (`backend`, `frontend`, `mail`, `workers`).

## Completed Work

- Replaced the single `firstspawn-network` with a multi-network topology (`frontend-net`, `backend-net`, `mail-net`).
- Implemented `nginx-public` (Port 80) serving `firstspawn.com` and `admin.firstspawn.com`.
- Implemented `nginx-private` (Port 8080) serving `api.localhost`, `db.localhost`, and `logs.localhost`.
- Implemented `nginx-mail` (Port 8081) serving `webmail.firstspawn.com`.
- Disabled IPv6 support across the entire Docker stack.
- Grouped services into logical profiles: `backend`, `frontend`, `mail`, and `workers`.
- Moved `dozzle` out of profiles to make it a default service.

## Validation

- Verified `backend` profile and private gateway access on port 8080.
- Verified `frontend` profile and public gateway access on port 80.
- Verified `mail` profile and webmail gateway access on port 8081.
- Validated network isolation: confirmed services on `backend-net` cannot be reached directly from `frontend-net`.

## Notes

- Next: Implement actual Next.js web applications in the `frontend` stack.
- Next: Configure production SSL certificates for the three gateways.
- Next: Update the CI/CD pipeline to handle profile-based deployments.
