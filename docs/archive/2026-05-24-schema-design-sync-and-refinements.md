# Schema Design Sync and Refinements
Date: 2026-05-24

## Goal
To synchronize the `schema-design.md` documentation with the physical Drizzle schema (`schema.ts`) and refine several column constraints and best practices for the MVP launch.

## Planned Scope
- Audit `schema-design.md` against `schema.ts`.
- Fix naming inconsistencies for timestamp fields.
- Clean up unnecessary indexes.
- Architect media storage (logos and banners).
- Determine slug vs. name unique constraints for servers.

## Completed Work
- **Documentation Sync:** Updated all `varchar` lengths, nullability rules, foreign key cascade policies, and `uuidv4` vs `uuidv7` notes in `schema-design.md` to precisely match Drizzle.
- **Timestamp Standardization:** Renamed consent fields in the `users` table to `marketing_consent_at`, `privacy_policy_accepted_at`, and `tos_accepted_at` in both design and code.
- **Index Cleanup:** Dropped `idx_users_country_code` from the `users` table as `countryCode` is not frequently queried for primary application logic (unlike back-office analytics).
- **Object Storage Preparedness:** Added `logo_url` and `banner_url` (`varchar(2048)`) to the `servers` table. Images will be stored in an S3/R2 bucket with Cloudflare CDN, avoiding raw binary storage in Postgres.
- **Server Discovery Identifiers:** Maintained both `servers.name` (for UI presentation) and `servers.slug` (for URL routing). Added a unique index (`servers_name_unique`) to `schema.ts` to complement the existing slug index.

## Validation
- Verified schema alignments visually.
- Validated `servers` table now correctly defines UKs on both `slug` and `name`.

## Notes
### Server Slug Generation Pattern
To automatically derive URL-friendly slugs from `servers.name` during server creation while avoiding unique constraint collisions, the API will use the `slugify` package with a collision-handling loop:

```typescript
import slugify from 'slugify';
import { db } from '../db';
import { servers } from '../db/schema';
import { eq } from 'drizzle-orm';

async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let currentSlug = baseSlug;
  let counter = 1;

  while (true) {
    // Check if a server with this slug already exists
    const existing = await db.query.servers.findFirst({
      where: eq(servers.slug, currentSlug),
    });

    if (!existing) {
      return currentSlug; // It's unique!
    }

    // Collision! Append a number and try again
    currentSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
```

### Server Host Validation
When processing server creation or updates in the API, the application logic MUST strictly validate that `servers.host` is either:
1. A valid **IPv4 address** (e.g., `192.168.1.1`)
2. A valid **FQDN (Domain Name)** (e.g., `mc.hypixel.net`)

This ensures no malformed payloads, injection attempts, or internal network addresses are accidentally probed by the collector.

### User Account Deletion (Anonymized Soft Delete)
To comply with App Store policy (users must be able to delete all personal data) while preserving platform security (moderation logs must not be wiped), user deletion MUST use an anonymized soft delete. 

When a user requests account deletion, the API must execute logic similar to this:

```typescript
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

async function processUserDeletion(userId: string) {
  // 1. Hash the email to prevent ban evasion via re-registration
  const rawEmail = await getEmailForUser(userId); 
  const hashedEmail = crypto.createHash('sha256').update(rawEmail).digest('hex') + "@deleted.firstspawn.gg";

  // 2. Prevent unique constraint collisions on username
  const scrubbedUsername = `deleted_user_${userId.substring(0, 8)}`;

  // 3. Perform the anonymizing soft-delete
  await db.update(users)
    .set({
      status: "deleted",
      email: hashedEmail,
      username: scrubbedUsername,
      avatarUrl: null,
      passwordHash: null,
    })
    .where(eq(users.id, userId));
    
  // 4. (Required) Purge their active sessions and tokens
}
```

This safely removes all PII while keeping the user row intact so `user_moderation_logs` are perfectly preserved without tripping the `onDelete: "set null"` safety net!
