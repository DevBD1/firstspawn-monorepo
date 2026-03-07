-- PostgreSQL initialization script
-- Runs once on first container startup

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Create roles (for future separate schemas)
-- These are placeholders for when we migrate to domain-specific schemas
-- create role auth_role;
-- create role discovery_role;
-- create role plugin_role;
-- create role agent_role;

-- Note: Extensions are created in public schema by default
-- When we move to separate schemas, we'll need to either:
-- 1. Create extensions in public and grant usage
-- 2. Or create extensions in each schema separately

-- Grant usage on extensions to app user (will be handled by docker-compose)
-- grant usage on schema public to app;

comment on extension "uuid-ossp" is 'UUID generation functions';
comment on extension "citext" is 'Case-insensitive text type';
