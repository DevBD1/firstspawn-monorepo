CREATE INDEX IF NOT EXISTS "idx_server_heartbeats_server_latest" ON "server_heartbeats" USING btree ("server_id","occurred_at" DESC,"created_at" DESC,"id" DESC);--> statement-breakpoint
