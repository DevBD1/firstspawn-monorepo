"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sigil } from "@firstspawn/ui";
import { useTheme } from "@/components/providers/ThemeProvider.client";
import { AdminIcon, type AdminIconName } from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: AdminIconName;
  exact?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    group: "Catalog",
    items: [
      { href: "/admin", label: "Overview", icon: "dashboard", exact: true },
      { href: "/admin/servers", label: "Servers", icon: "server" },
    ],
  },
  {
    group: "Moderate",
    items: [
      { href: "/admin/moderation", label: "Moderation", icon: "shield" },
      { href: "/admin/support", label: "Support", icon: "inbox" },
    ],
  },
];

const initials = (name: string): string =>
  name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

export default function AdminShell({
  username,
  email,
  children,
}: {
  username: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const { theme, toggleTheme } = useTheme();

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[240px] flex-shrink-0 flex-col border-r border-border bg-bg-panel md:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-4">
          <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-border bg-background">
            <Sigil size={20} color="var(--primary)" />
          </span>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-display text-[13px] font-semibold uppercase tracking-wide text-foreground">
              FIRST<span className="text-primary">SPAWN</span>
            </span>
            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              Admin console
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          {NAV.map((g) => (
            <div key={g.group} className="flex flex-col gap-0.5">
              <div className="px-2 pb-1.5 font-ui text-[11px] font-bold uppercase tracking-[0.13em] text-muted">
                {g.group}
              </div>
              {g.items.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex min-h-[38px] items-center gap-2.5 rounded-[10px] border px-2.5 py-2 font-ui text-[13.5px] transition-colors ${
                      active
                        ? "border-border bg-secondary font-semibold text-foreground"
                        : "border-transparent font-medium text-muted hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <span className="absolute -left-3 top-[9px] bottom-[9px] w-[3px] rounded-full bg-primary" />
                    )}
                    <AdminIcon
                      name={item.icon}
                      size={17}
                      className={active ? "text-primary" : ""}
                    />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 border-t border-border p-3">
          <Link
            href="/en"
            className="flex items-center gap-2 px-1 font-mono text-[11px] text-muted transition-colors hover:text-foreground"
          >
            <AdminIcon name="external" size={13} /> Back to site
          </Link>
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border bg-background p-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-secondary font-ui text-[11px] font-bold text-foreground">
              {initials(username)}
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-ui text-[12.5px] font-semibold text-foreground">
                {username}
              </span>
              <span className="truncate font-ui text-[11px] text-muted">{email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          {/* Mobile brand (sidebar hidden) */}
          <Link href="/admin" className="flex items-center gap-2 md:hidden">
            <Sigil size={18} color="var(--primary)" />
            <span className="font-display text-[13px] font-semibold uppercase tracking-wide">
              Admin
            </span>
          </Link>
          <div className="hidden items-center gap-2 font-mono text-[11px] text-muted md:flex">
            <span>console</span>
            <AdminIcon name="chevron-right" size={13} />
            <span className="text-foreground">FirstSpawn admin</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile nav links */}
            <nav className="flex items-center gap-1 md:hidden">
              {NAV.flatMap((g) => g.items).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border ${
                    isActive(item)
                      ? "border-border bg-secondary text-primary"
                      : "border-border text-muted"
                  }`}
                  aria-label={item.label}
                >
                  <AdminIcon name={item.icon} size={17} />
                </Link>
              ))}
            </nav>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-transparent px-3.5 font-ui text-[12.5px] font-semibold text-muted transition-colors hover:text-foreground"
              suppressHydrationWarning
            >
              {theme === "dusk" ? "☾ Dusk" : "☀ Day"}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-7">{children}</main>
      </div>
    </div>
  );
}
