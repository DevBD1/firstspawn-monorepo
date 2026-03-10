import Link from "next/link";

interface AuthShellProps {
  lang: string;
  title: string;
  subtitle: string;
  backLabel: string;
  children: React.ReactNode;
}

export default function AuthShell({
  lang,
  title,
  subtitle,
  backLabel,
  children,
}: AuthShellProps) {
  return (
    <section className="relative min-h-[calc(100vh-84px)] overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.2),transparent_45%),linear-gradient(180deg,#090a11_0%,#13172a_45%,#0b0d15_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(34,211,238,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="pixel-border-dark overflow-hidden bg-black/70">
          <div className="grid lg:grid-cols-2">
            <div className="border-b-4 border-black bg-black/60 p-6 md:p-8 lg:border-r-4 lg:border-b-0 lg:p-10">
              <p className="font-display text-[9px] uppercase tracking-[0.18em] text-fs-diamond">Account Access</p>
              <h1 className="mt-3 font-display text-xl uppercase leading-tight tracking-wide text-white sm:text-2xl md:text-3xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl font-ui text-base leading-relaxed text-zinc-300">{subtitle}</p>

              <Link
                href={`/${lang}`}
                className="mt-10 inline-block border-2 border-black bg-secondary px-4 py-3 font-display text-[10px] uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-secondary-hover active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
              >
                {backLabel}
              </Link>
            </div>

            <div className="bg-black/75 p-5 sm:p-6 md:p-8">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
