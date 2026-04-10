FROM alpine:3.20

ARG SUPERCRONIC_VERSION=v0.2.31

RUN apk add --no-cache bash postgresql-client ca-certificates tzdata wget \
  && wget -q -O /usr/local/bin/supercronic "https://github.com/aptible/supercronic/releases/download/${SUPERCRONIC_VERSION}/supercronic-linux-amd64" \
  && chmod +x /usr/local/bin/supercronic \
  && mkdir -p /work/.infras/ops/cron /work/.infras/ops/scheduler /work/packages/database/jobs

WORKDIR /work

COPY .infras/ops/cron/ /work/.infras/ops/cron/
COPY .infras/ops/scheduler/ /work/.infras/ops/scheduler/
COPY packages/database/jobs/ /work/packages/database/jobs/

RUN chmod +x /work/.infras/ops/cron/*.sh /work/.infras/ops/scheduler/*.sh

ENV TZ=UTC

ENTRYPOINT ["/work/.infras/ops/scheduler/entrypoint.sh"]
