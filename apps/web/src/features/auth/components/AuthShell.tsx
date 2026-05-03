import { Database, Gamepad2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import type { AuthShellCopy } from "@/lib/dictionaries/schema";
import { PageSurface, joinClasses } from "@/components/ui/PagePrimitives";

interface AuthShellProps {
  brand: string;
  lang: string;
  title: string;
  subtitle: string;
  backLabel: string;
  closeHref: string;
  copy: AuthShellCopy;
  children: React.ReactNode;
  /** The physical placement of the informational sidebar. Defaults to "sidebar-left". */
  layoutOrientation?: "sidebar-left" | "sidebar-right";
  /** The semantic color theme for highlights (logo, status text, icons). Defaults to "success". */
  themeColor?: "primary" | "success";
}

interface FeatureItemProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  themeColor: "primary" | "success";
}

function FeatureItem({ icon: Icon, title, description, themeColor }: FeatureItemProps) {
  const iconColorClass = themeColor === "primary" ? "text-primary" : "text-success";

  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 border-2 border-black bg-secondary p-2">
        <Icon className={joinClasses("h-5 w-5", iconColorClass)} />
      </div>
      <div>
        <h3 className="font-ui text-lg font-bold uppercase tracking-wide text-foreground">
          {title}
        </h3>
        <p className="font-body text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

/**
 * AuthShell - A mechanical layout wrapper for auth-related pages (login, signup).
 * Supports mirrored layouts and semantic color shifts to create visual rhythm.
 */
export default function AuthShell({
  brand,
  lang,
  title,
  subtitle,
  backLabel,
  closeHref,
  copy,
  children,
  layoutOrientation = "sidebar-left",
  themeColor = "success",
}: AuthShellProps) {
  const [primaryBenefit, secondaryBenefit, tertiaryBenefit] = copy.benefitItems;

  const bgHighlightClass = themeColor === "primary" ? "bg-primary" : "bg-success";
  const textHighlightClass = themeColor === "primary" ? "text-primary" : "text-success";
  const asideOrderClass =
    layoutOrientation === "sidebar-right" ? "lg:order-last border-l-4 border-r-0" : "border-r-4";

  return (
    <section className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside
          className={joinClasses(
            "relative hidden overflow-hidden border-black bg-bg-panel px-10 py-12 lg:flex lg:flex-col lg:justify-between",
            asideOrderClass
          )}
        >
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10">
            <Link
              href={`/${lang}`}
              className="mb-16 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div
                className={joinClasses(
                  "flex h-10 w-10 items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  bgHighlightClass
                )}
              >
                <div className="h-4 w-4 bg-background" />
              </div>
              <span className="font-display text-xl uppercase text-foreground">{brand}</span>
            </Link>

            <h2 className="mb-6 font-display text-2xl uppercase leading-tight text-foreground xl:text-3xl">
              {copy.brandStatement.title}
              <br />
              <span className={textHighlightClass}>{copy.brandStatement.highlight}</span>
            </h2>
            <p className="mb-12 max-w-md font-body text-base text-foreground/70">
              {copy.brandStatement.description}
            </p>

            <div className="space-y-6">
              <FeatureItem
                icon={ShieldCheck}
                title={primaryBenefit.title}
                description={primaryBenefit.description}
                themeColor={themeColor}
              />
              <FeatureItem
                icon={Database}
                title={secondaryBenefit.title}
                description={secondaryBenefit.description}
                themeColor={themeColor}
              />
              <FeatureItem
                icon={Gamepad2}
                title={tertiaryBenefit.title}
                description={tertiaryBenefit.description}
                themeColor={themeColor}
              />
            </div>
          </div>

          <p className="relative z-10 font-ui text-lg text-foreground/50">
            © {new Date().getFullYear()} {brand}. {copy.legalLine}
          </p>
        </aside>

        <main className="relative flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <Link
            href={closeHref}
            aria-label={backLabel}
            className="absolute right-6 top-6 border-2 border-black bg-bg-panel p-2 text-foreground/60 transition-colors hover:bg-background hover:text-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <X className="h-5 w-5" />
          </Link>

          <div className="w-full max-w-md">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div
                className={joinClasses(
                  "flex h-8 w-8 items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  bgHighlightClass
                )}
              >
                <div className="h-3 w-3 bg-background" />
              </div>
              <span className="font-display text-lg uppercase text-foreground">{brand}</span>
            </div>

            <PageSurface className={joinClasses("bg-bg-panel/92 p-6 md:p-8")}>
              <h1 className="mb-2 font-display text-xl uppercase leading-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              <p className="mb-8 font-body text-sm text-foreground/70 sm:text-base">{subtitle}</p>

              {children}
            </PageSurface>
          </div>
        </main>
      </div>
    </section>
  );
}
