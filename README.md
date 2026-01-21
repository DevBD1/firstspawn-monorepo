# FirstSpawn

**The Ultimate Discovery Ecosystem for Minecraft and Hytale.**

## 🌍 Vision

FirstSpawn is more than just a server list; it is a comprehensive social network designed to connect players with active and upcoming voxel-based communities. We bridge the gap between discovery and engagement by allowing users to sync their cross-platform identities (Discord, Steam, Epic) and leave reviews backed by **verified playtime**.

Whether you are solving daily puzzles to win real in-game prizes, forming Guilds with friends, or earning reputation badges to boost your credibility, FirstSpawn turns the mundane task of server discovery into a genuine adventure.

## 🚀 Core Features

- **Verified Discovery:** Explore active and upcoming game servers with rich filtering options.
- **Social Trust:** Leave comments and reviews signed with verified playtime (via our custom mod integration).
- **Identity Sync:** Connect your digital ecosystem—Minecraft, Hytale, Discord, Steam, Epic Games, and more.
- **Play & Earn:** Participate in daily puzzles and minigames to win prizes directly on game servers.
- **Server Management:** Hosts can register servers, manage listings, and grind for server badges (including premium tiers).
- **Reputation System:** Users earn badges to establish credibility within the network.
- **Guilds:** Create or join Guilds (clans) to socialize and compete together.
- **Global Reach:** Fully localized interface supporting English, Turkish, German, Russian, Spanish, and French.

## 🛠️ Tech Stack

Built with cutting-edge web technologies for performance, scalability, and developer experience:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Framer Motion](https://www.framer.com/motion/) & [Lucide React](https://lucide.dev/)
- **Analytics:** [PostHog](https://posthog.com/)
- **Email:** [Resend](https://resend.com/) & [React Email](https://react.email/)
- **Internationalization:** Native Next.js i18n with `negotiator` and `@formatjs/intl-localematcher`.
- **Validation:** [Zod](https://zod.dev/)

## 📂 Project Structure

A quick look at the top-level directory structure:

```
firstspawn-web/
├── app/              # Next.js App Router pages and layouts
│   ├── [lang]/       # Localized routes
│   ├── actions/      # Server Actions
│   └── api/          # API Routes
├── assets/           # Static assets (fonts, images)
├── components/       # Reusable React components
├── lib/              # Utilities, dictionaries, and configurations
└── public/           # Public static files
```

## 🏁 Getting Started

To run the development server locally:

1.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗺️ Roadmap (v0.1-alpha)

- [ ] **SEO Optimization**: Implementation of `robots.ts` and `sitemap.ts`.
- [ ] **User Engagement**: Cookie consent and Newsletter subscription with confirmation.
- [ ] **Market Research**: "Killer, Achiever, Socializer, Explorer" questionnaire system.
- [ ] **Hytale Countdown**: Tracking the launch date (Jan 13, 2026).
- [ ] **UI Polish**: Finalizing Navbar and Footer designs.

---

*FirstSpawn - Turning Server Discovery into an Adventure.*