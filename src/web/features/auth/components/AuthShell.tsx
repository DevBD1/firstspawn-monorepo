import { Database, Gamepad2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

interface AuthShellProps {
  lang: string;
  title: string;
  subtitle: string;
  backLabel: string;
  closeHref: string;
  children: React.ReactNode;
}

interface FeatureItemProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 border-2 border-zinc-700 bg-zinc-800 p-2">
        <Icon className="h-5 w-5 text-emerald-500" />
      </div>
      <div>
        <h3 className="font-ui text-lg font-bold uppercase tracking-wide text-zinc-200">{title}</h3>
        <p className="font-body text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

export default function AuthShell({
  lang,
  title,
  subtitle,
  backLabel,
  closeHref,
  children,
}: AuthShellProps) {
  return (
    <section className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden border-r-2 border-zinc-800 bg-zinc-900 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10">
            <Link
              href={`/${lang}`}
              className="mb-16 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center border-2 border-emerald-700 bg-emerald-500 shadow-[4px_4px_0px_0px_#047857]">
                <div className="h-4 w-4 bg-zinc-950" />
              </div>
              <span className="font-display text-xl uppercase text-zinc-100">FirstSpawn</span>
            </Link>

            <h2 className="mb-6 font-display text-2xl uppercase leading-tight text-zinc-100 xl:text-3xl">
              A Fairer Game
              <br />
              <span className="text-emerald-500">Is Possible.</span>
            </h2>
            <p className="mb-12 max-w-md font-body text-base text-zinc-400">
              The discovery ecosystem for Minecraft and Hytale servers. Built for real players, real
              trust, and the community.
            </p>

            <div className="space-y-6">
              <FeatureItem
                icon={ShieldCheck}
                title="Verified Reviews"
                description="Playtime-gated reviews make reputation signals more reliable."
              />
              <FeatureItem
                icon={Database}
                title="Data-Driven Discovery"
                description="Find servers by meaningful signals instead of paid placement."
              />
              <FeatureItem
                icon={Gamepad2}
                title="Cross-Game Potential"
                description="Designed for Minecraft, Hytale, and future worlds."
              />
            </div>
          </div>

          <p className="relative z-10 font-ui text-lg text-zinc-500">
            © {new Date().getFullYear()} FirstSpawn. Built for the community.
          </p>
        </aside>

        <main className="relative flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <Link
            href={closeHref}
            aria-label={backLabel}
            className="absolute right-6 top-6 border-2 border-zinc-800 bg-zinc-900 p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </Link>

          <div className="w-full max-w-md">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-emerald-700 bg-emerald-500 shadow-[2px_2px_0px_0px_#047857]">
                <div className="h-3 w-3 bg-zinc-950" />
              </div>
              <span className="font-display text-lg uppercase text-zinc-100">FirstSpawn</span>
            </div>

            <h1 className="mb-2 font-display text-xl uppercase leading-tight text-zinc-100 sm:text-2xl">
              {title}
            </h1>
            <p className="mb-8 font-body text-sm text-zinc-400 sm:text-base">{subtitle}</p>

            {children}
          </div>
        </main>
      </div>
    </section>
  );
}
