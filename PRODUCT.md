# FirstSpawn Product

FirstSpawn is a discovery and trust platform for game servers, starting with
Hytale and Minecraft.

The product goal is to help players find communities worth joining and help
server owners earn attention through real activity, trust, and relevance instead
of paid placement.

## Problem

Game-server discovery is fragmented across server lists, forums, Discord
servers, marketplaces, and social channels. Players often see rankings driven by
vote rewards, paid boosts, or stale listings rather than server quality,
activity, and fit.

Server owners need a fair way to reach the right players. Smaller or newer
communities need a path to be discovered without buying visibility or relying
only on external social channels.

## Users

- Players looking for active, trustworthy, relevant game servers.
- Server owners who need discovery, reputation, and growth signals.
- Server staff who need to understand player interest and server health.
- Hosting providers and infrastructure partners who may later use ecosystem
  signals to understand community needs.

## Use Cases

- A player searches or filters for servers that match their interests, platform,
  activity level, and trust expectations.
- A player evaluates a server using activity, freshness, reputation, tags, and
  community signals before joining.
- A player contributes to a server reputation loop through voting, verified
  participation, or other trusted activity.
- A server owner lists a server, keeps its profile accurate, and earns discovery
  through real relevance signals.
- A server owner connects FirstSpawn to server-side tooling, including
  Votifier-compatible flows and future FirstSpawn-native plugin telemetry.
- A server owner reviews growth, traffic, reputation, and engagement signals in
  a dashboard.
- A hosting or infrastructure partner later uses aggregated ecosystem signals to
  understand where server communities need support.

## Requirements

- Discovery must be relevance-driven, not pay-to-win.
- Server listings must support browsing, searching, filtering, tags, categories,
  and game/platform distinctions.
- Discovery may later use geo-aware boosting if it proves useful for player fit,
  but it must not override relevance and trust.
- AI-assisted discovery can show example conversations or guided search states
  when it helps players understand how to find servers.
- Trust must be based on earned signals such as verified activity, freshness,
  reputation, uptime, and player contribution history.
- Review, report, and moderation workflows should strengthen trust without
  becoming the primary discovery mechanic.
- Voting must support familiar server-list behavior while leaving room for
  richer FirstSpawn-specific activity signals.
- FirstSpawn-native server tooling should provide better data than traditional
  Votifier-only integrations without making older server setups useless.
- FSVotifier is the future owner-authoritative integration boundary. External
  probes remain limited to liveness and unverified public-query player counts;
  plugin ingestion is not part of the current collector implementation.
- Plugin verification and telemetry should improve server profile trust and
  analytics when server owners opt in.
- Player identity and reputation should make player contributions visible and
  meaningful across the discovery ecosystem.
- Guild or social retention loops may support repeat discovery later, but only
  if they reinforce server discovery and trust.
- Server-owner dashboards should turn player and server activity into practical
  insight, not vanity metrics.
- Server analytics should keep product charts separate from backend operations:
  PostgreSQL rollups for public and owner-facing product charts, and Prometheus
  plus Grafana for backend and collector operations.
- Server analytics may later include owner-facing summary, player, ping,
  activity, and availability charts based on hourly and daily heartbeat rollups.
- Community interaction should help close the gap between server discovery and
  server participation without turning FirstSpawn into a generic social network.
- Ranking, recommendation, and trust systems should be explainable enough for
  players and server owners to understand why a server is visible.
- Product surfaces must clearly separate current capabilities from coming-soon
  capabilities.
- Agent control-plane concepts are future exploration only and should not drive
  the core product until discovery, trust, and moderation loops are clear.

## Non-Goals

- FirstSpawn is not a paid-ranking directory where visibility is primarily
  purchased.
- FirstSpawn is not a full social network with follower graphs, private
  messaging, and broad social feeds as the core product.
- FirstSpawn is not a replacement for Discord, forums, or in-game communities.
- FirstSpawn is not an analytics warehouse for every possible server metric.
- FirstSpawn should not replace backend observability tools with product
  analytics charts.
- FirstSpawn is not trying to support every game platform before the first
  server-discovery and trust loop is reliable.

## Success Criteria

- Players can find relevant servers faster than they can on conventional server
  lists.
- Smaller high-quality servers can earn visibility through activity and trust
  instead of paid boosts alone.
- Server owners can understand which discovery and reputation signals affect
  their growth.
- Server freshness, activity, and trust signals stay reliable enough for players
  to make joining decisions.
- Voting and plugin integrations increase useful server profile data without
  breaking familiar owner workflows.
- Retention improves because players return to FirstSpawn for repeat discovery,
  server comparison, and trust checks.
- System quality is measurable through activity, vote volume, retention,
  reliability, and page-performance metrics.
