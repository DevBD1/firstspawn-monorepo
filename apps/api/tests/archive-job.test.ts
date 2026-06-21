import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const archiveJobPath = path.resolve(
  currentDir,
  "../../../packages/database/jobs/archive_inactive_servers.sql"
);

describe("archive inactive server job", () => {
  it("cannot archive active rows because monitoring is stale", async () => {
    const sql = await readFile(archiveJobPath, "utf8");

    expect(sql).not.toMatch(/\bupdate\s+servers\b/i);
    expect(sql).not.toContain("coalesce(s.last_probe_attempt_at, s.created_at)");
    expect(sql).toContain("where false");
  });
});
