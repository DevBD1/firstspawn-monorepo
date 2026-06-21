#!/usr/bin/env sh
set -eu

job_name="${1:?job name is required}"
script_path="${2:?script path is required}"

start="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "[${start}] job_start name=${job_name}"

if "${script_path}"; then
  finish="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "[${finish}] job_success name=${job_name}"
else
  code=$?
  finish="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "[${finish}] job_failure name=${job_name} exit_code=${code}" >&2
  exit "${code}"
fi
