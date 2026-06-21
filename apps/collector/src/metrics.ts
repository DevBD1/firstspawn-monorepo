const formatNumber = (value: number): string => (Number.isFinite(value) ? value.toString() : "0");

export class CollectorMetrics {
  private cyclesTotal = 0;
  private cycleInProgress = 0;
  private targetsProcessedTotal = 0;
  private probeSuccessTotal = 0;
  private probeFailureTotal = 0;
  private ingestSuccessTotal = 0;
  private ingestFailureTotal = 0;
  private ingestDuplicateTotal = 0;
  private lastCycleDurationSeconds = 0;
  private lastCycleFinishedAtUnix = 0;

  public startCycle(): void {
    this.cyclesTotal += 1;
    this.cycleInProgress = 1;
  }

  public finishCycle(durationSeconds: number, finishedAtUnix: number): void {
    this.cycleInProgress = 0;
    this.lastCycleDurationSeconds = durationSeconds;
    this.lastCycleFinishedAtUnix = finishedAtUnix;
  }

  public observeTargetProcessed(): void {
    this.targetsProcessedTotal += 1;
  }

  public observeProbeSuccess(): void {
    this.probeSuccessTotal += 1;
  }

  public observeProbeFailure(): void {
    this.probeFailureTotal += 1;
  }

  public observeIngestSuccess(duplicate: boolean): void {
    this.ingestSuccessTotal += 1;
    if (duplicate) {
      this.ingestDuplicateTotal += 1;
    }
  }

  public observeIngestFailure(): void {
    this.ingestFailureTotal += 1;
  }

  public renderPrometheus(): string {
    return [
      "# HELP collector_cycles_total Total collection cycles started.",
      "# TYPE collector_cycles_total counter",
      `collector_cycles_total ${formatNumber(this.cyclesTotal)}`,
      "# HELP collector_cycle_in_progress Whether a cycle is currently running.",
      "# TYPE collector_cycle_in_progress gauge",
      `collector_cycle_in_progress ${formatNumber(this.cycleInProgress)}`,
      "# HELP collector_targets_processed_total Total targets processed.",
      "# TYPE collector_targets_processed_total counter",
      `collector_targets_processed_total ${formatNumber(this.targetsProcessedTotal)}`,
      "# HELP collector_probe_success_total Total successful probes.",
      "# TYPE collector_probe_success_total counter",
      `collector_probe_success_total ${formatNumber(this.probeSuccessTotal)}`,
      "# HELP collector_probe_failure_total Total failed probes.",
      "# TYPE collector_probe_failure_total counter",
      `collector_probe_failure_total ${formatNumber(this.probeFailureTotal)}`,
      "# HELP collector_ingest_success_total Total successful ingest requests.",
      "# TYPE collector_ingest_success_total counter",
      `collector_ingest_success_total ${formatNumber(this.ingestSuccessTotal)}`,
      "# HELP collector_ingest_failure_total Total failed ingest requests.",
      "# TYPE collector_ingest_failure_total counter",
      `collector_ingest_failure_total ${formatNumber(this.ingestFailureTotal)}`,
      "# HELP collector_ingest_duplicate_total Total duplicate ingest accepts.",
      "# TYPE collector_ingest_duplicate_total counter",
      `collector_ingest_duplicate_total ${formatNumber(this.ingestDuplicateTotal)}`,
      "# HELP collector_last_cycle_duration_seconds Duration of last completed cycle.",
      "# TYPE collector_last_cycle_duration_seconds gauge",
      `collector_last_cycle_duration_seconds ${formatNumber(this.lastCycleDurationSeconds)}`,
      "# HELP collector_last_cycle_finished_at_unix Unix time when last cycle finished.",
      "# TYPE collector_last_cycle_finished_at_unix gauge",
      `collector_last_cycle_finished_at_unix ${formatNumber(this.lastCycleFinishedAtUnix)}`,
      "",
    ].join("\n");
  }
}
