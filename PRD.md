# FIRSTSPAWN

## “The Data-Driven Server Discovery Platform”

# `Project Vision & Core Identity`

`FirstSpawn is the central hub, and a trusted point of origin where (Minecraft, Hytale) players can confidently start their journey.` 

`Our mission is to establish the definitive discovery ecosystem for Minecraft and Hytale, bridging the gap between players and emerging communities. Transcending the limitations of a conventional server list, the platform functions as a comprehensive social architecture.`

## `The Problem and The Vision (The Origin of The Idea)`

`Minecraft and Hytale transcend simple gaming; their communities thrive in external hubs like forums, Discord, and marketplaces. Conventional server lists often act as mere directories, relying on Votifier-based reward systems to drive traffic. Our vision is to evolve this concept by bridging the gap between players and servers through a streamlined, forum-like experience.`

## `Target Users & Key Stakeholders`

`FirstSpawn empowers players by making their contributions to a server's rank tangible. This system fosters a sense of value through reputation growth, while also providing a clear path to discovering "hidden gem" communities. For server owners, the platform serves as a vital tool for reaching the ideal audience, supported by an intelligence dashboard that extracts actionable insights from player data. Furthermore, this data-rich environment allows hosting providers and infrastructure firms to identify and connect with their target clientele effectively.`

## `Scope, Requirements & MVP Definition`

### `What is In-Scope`

**`Fundamental server listing and browsing:`** `An optimized directory structure that allows players to find Minecraft and Hytale servers by categories and tags.`  
**`Voting:`** `Ensuring server owners can easily establish communication between their game server and FirstSpawn using traditional Votifier plugins, and our platform fulfills the voting function which is the core functionality of competitors. Our FSVotifier plugin being a drop-in-replacement for traditional Votifier plugins and allowing game servers to provide more data to their server profiles on FirstSpawn.`  
**`Player Identity and Reputation System:`** `Implementation of a core mechanism that makes player contributions to server rankings tangible, allowing for a sense of value and reputation growth. The number of servers a player votes for and the number of votes they cast for each server should be listed separately and earn points. Since FSVotifier allows us to get stats like PlayTime on servers that use it, this will be what adds the real value to player profiles, but servers using traditional Votifier will not be neglected.`  
**`Simple Data Dashboard for Server Owners:`** `The first version of the dashboard providing actionable insights (e.g., traffic and reputation changes) from basic player data belonging to their servers.`  
**`Core Interaction Architecture:`** `A communication infrastructure that fills the gap in traditional server lists by offering a fluid, forum-like experience between servers and players, exclusive for servers using FSVotifier.`

### `What is Out-of-Scope?`

**`Comprehensive Social Network Features:`** `Social media-focused functions such as follower/following, private messaging, public profiles, and in-community notifications will not be included in the MVP, as the priority is the "discovery ecosystem."`  
**`Advanced Analytics/AI Features:`** `Complex predictive analytics and deep learning-based predictions to be included in the server owner dashboard.`  
**`Intelligence Dashboard:`** `A comprehensive intelligence dashboard engineered for server owners and hosting providers. This ecosystem delivers tangible value to expanding game communities while enabling infrastructure firms to identify and connect with their target clientele effectively through actionable data insights.`

## `Metrics and KPIs`

* **`Daily Active Users (DAU):`** `The number of unique players engaging with the platform daily.`  
* **`Daily Vote Count:`** `The core transaction volume, indicating player adoption and platform usage.`  
* **`User Retention Rate:`** `The rate of continuous or consecutive voting behavior, measuring long-term player engagement.`  
* **`Error Rates:`** `Overall system reliability, including voting failure and critical system errors.`  
* **`Page Load Time (Latency):`** `Ensuring an optimized server discovery experience.`

## `Roadmap and Phases`

### `Design Phase Milestones`

* `Finalize Project Vision & Core Identity`  
* `Finalize Branding Guide and Brand Signature (Colors etc.)`  
* `Finalize Data Model & Schema (PostgreSQL, Redis structure)`  
* `Complete UX/UI Wireframes for Core MVP Features`  
* `Define API Contract for Backend/Frontend Communication`

### `Development Phase Milestones`

* `Backend Core Setup (Fastify Skeleton, Docker Compose, ORM/Migration Setup)`  
* `Implement Core Voting Logic and FSVotifier Integration`  
* `Complete Player Identity and Reputation System Logic`  
* `Develop Server Listing/Filtering Endpoints`  
* `Initial Frontend MVP Render (Next.js)`

### `Testing Phase Milestones`

* `Complete Unit & Integration Tests`  
* `Internal Alpha Testing for Core Server/Player flow`  
* `Security Audit`  
* `Prepare UAT build`

### `Deployment Phase Milestones`

* `Establish Dev/Stage/Prod CI/CD Pipelines and Environment Configs`  
* `Final Production Readiness Checklist (Monitoring, Logging, Backup Strategy)`  
* `MVP Go-Live (Soft Launch)`  
* `Post-Deployment Monitoring and Hotfix Period`

