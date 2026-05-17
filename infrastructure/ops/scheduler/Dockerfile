FROM alpine:3.20

ARG SUPERCRONIC_VERSION=v0.2.31

COPY infrastructure/ops/scheduler/bin/supercronic /usr/local/bin/supercronic

RUN chmod +x /usr/local/bin/supercronic \
 && apk add --no-cache bash postgresql-client ca-certificates tzdata \
 && mkdir -p /work/infrastructure/ops/cron /work/infrastructure/ops/scheduler /work/packages/database/jobs

WORKDIR /work

COPY infrastructure/ops/cron/ /work/infrastructure/ops/cron/
COPY infrastructure/ops/scheduler/ /work/infrastructure/ops/scheduler/
COPY packages/database/jobs/ /work/packages/database/jobs/

RUN chmod +x /work/infrastructure/ops/cron/*.sh /work/infrastructure/ops/scheduler/*.sh

ENV TZ=UTC

ENTRYPOINT ["/work/infrastructure/ops/scheduler/entrypoint.sh"]
