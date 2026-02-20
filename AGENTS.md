# FirstSpawn Agent Assignments & Tactical Breakdown

This document outlines the tactical breakdown of the FirstSpawn roadmap into technical assignments, allocated to the 6-agent AI squad.

## The Squad

1.  **The Architect (Backend/API)**: Identity sync (Discord/Steam), database schema, server uptime logic.
2.  **The Experience Crafter (UI/UX)**: Social feeds, dashboard design, frontend interactivity.
3.  **The Gamification Logic (Product)**: Badges, daily puzzles, XP calculation, guild hierarchy systems.
4.  **The Sentinel (Security)**: Anti-fraud for reviews, verifying playtime data, role permissions.
5.  **The Growth Hacker (Marketing)**: SEO optimization, automated server owner outreach, referral systems.
6.  **The Content Moderator (Ops)**: Automated comment filtering, dispute resolution logic.

---

## Phase 1: Minimum Viable Product (The Discovery Engine)
*Focus: Building the bedrock database, search infrastructure, and basic user entry points.*

| Feature | Sub-Task | Assigned Agent | Dependency |
| :--- | :--- | :--- | :--- |
| **Core Server Listing** | Design PostgreSQL schema for `Servers` (tags, versions, uptime history) & `Tags`. | **The Architect** | - |
| | Build robust REST/GraphQL API for searching, filtering, and pagination of servers. | **The Architect** | Waits for DB Schema |
| | Design and implement the "Server Grid" and "Server Detail" pages with responsive UI. | **The Experience Crafter** | Waits for API |
| | Implement `search_params` URL syncing for filters (preserves state on share). | **The Experience Crafter** | - |
| **Hytale Readiness** | Create `Hytale` specific metadata fields in DB (different from Minecraft). | **The Architect** | - |
| | Design "Hytale Watch" landing page with animated countdown timer and news aggregator. | **The Experience Crafter** | - |
| **SEO & Discoverability** | Implement Dynamic Sitemap generation (`next-sitemap`) for all server profile pages. | **The Growth Hacker** | Waits for Server Routes |
| | Define Schema.org `GameServer` structured data for rich snippets in Google. | **The Growth Hacker** | - |
| | Integrate OpenGraph dynamic image generation for Server Detail pages. | **The Experience Crafter** | - |
| **Basic User Accounts** | Implement Authentication (OAuth via Google/GitHub first) using Auth.js or Clerk. | **The Architect** | - |
| | Create `Users` and `Favorites` tables to link users to servers. | **The Architect** | Waits for Auth |
| | Design User Profile dropdown and "Saved Servers" dashboard view. | **The Experience Crafter** | Waits for Auth API |
| **Market Research** | Design logic for "Player Type" algorithm (Killer, Achiever, Socializer, Explorer). | **The Gamification Logic** | - |
| | Build interactive "Player Type Quiz" UI with visual feedback. | **The Experience Crafter** | Waits for Logic |

---

## Phase 2: Mass Adoption (The User Experience)
*Focus: empowering server owners and creating daily retention loops.*

| Feature | Sub-Task | Assigned Agent | Dependency |
| :--- | :--- | :--- | :--- |
| **Server Owner Dashboard** | Develop "Claim Server" verification logic (DNS TXT record or file upload verification). | **The Sentinel** | - |
| | Build "Owner Portal" UI for editing server details and viewing traffic stats. | **The Experience Crafter** | Waits for Claim Logic |
| | Create secure API endpoints for owners to update server metadata. | **The Architect** | Waits for Sentinel |
| **Verified Reviews** | Design DB schema for `Reviews` with relation to `User` and `Server`. | **The Architect** | - |
| | Implement "Review Bombing" detection (velocity checks, IP fingerprinting). | **The Sentinel** | Waits for Reviews API |
| | Build UI for "Write a Review" with star ratings and rich text. | **The Experience Crafter** | - |
| | **Content Filtering**: Auto-flag reviews with toxicity/slurs before publishing. | **The Content Moderator** | Waits for Reviews API |
| **Daily Engagement** | Design "Daily Login" streak system and XP calculation logic. | **The Gamification Logic** | - |
| | Create "Daily Puzzle" mini-game (e.g., Wordle for Minecraft blocks) as a retention hook. | **The Experience Crafter** | Waits for Logic |
| **Newsletter** | **(Optimization)**: Automate "Weekly Digest" emails featuring top servers based on user tags. | **The Growth Hacker** | - |
| **Localization** | **(Continuous)**: Monitor new UI strings and auto-generate translation PRs. | **The Content Moderator** | - |

---

## Phase 3: The Social Network (The Vision)
*Focus: Deep integrations, trust systems, and community hierarchy.*

| Feature | Sub-Task | Assigned Agent | Dependency |
| :--- | :--- | :--- | :--- |
| **Verified Playtime** | Research and implement Steam/Xbox API integration to fetch public playtime data. | **The Sentinel** | - |
| | Create "Verified Review" badge logic (only grants badge if playtime > 2h). | **The Gamification Logic** | Waits for Sentinel Data |
| **Identity Sync** | Add Discord & Steam OAuth providers and link to existing User accounts. | **The Architect** | - |
| | Map Discord Roles to FirstSpawn permissions (e.g., "Server Admin"). | **The Sentinel** | Waits for Identity Sync |
| **Guilds & Communities** | Design DB schema for `Guilds`, `Rosters`, and `GuildChat`. | **The Architect** | - |
| | Define Guild XP progression system (leveling up a guild via member activity). | **The Gamification Logic** | Waits for DB Schema |
| | Build "Guild Hall" UI dashboard. | **The Experience Crafter** | Waits for Logic & API |
| **Reputation System** | Design "Trust Score" algorithm (Weighted average of account age, verified playtime, helpful reviews). | **The Gamification Logic** | - |
| | Visual Badge System implementation (SVG assets for ranks). | **The Experience Crafter** | Waits for Logic |
| **Mobile App** | Scaffold `@firstspawn/mobile` (Expo/React Native) reusing shared logic. | **The Architect** | - |
| | Port "Daily Puzzle" and "Server List" UI to Native components. | **The Experience Crafter** | Waits for Scaffold |

---

## Summary of Agent Workloads

*   **The Architect**: Heavy load in Phase 1 (Core DB/API). Critical for setting the foundation.
*   **The Experience Crafter**: Consistent high load across all phases. Needs to work closely with Architect.
*   **The Gamification Logic**: Key player in Phase 3 (Social/Reputation) and Phase 1 (Quiz).
*   **The Sentinel**: Crucial in Phase 2 (Owner Verification) and Phase 3 (Playtime/Identity).
*   **The Growth Hacker**: Front-loaded in Phase 1 (SEO) and Phase 2 (Retention loops).
*   **The Content Moderator**: Support role, ensuring UGC (User Generated Content) safety in Phase 2 & 3.
