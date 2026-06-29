import { adminListServersAction } from "@/app/actions/admin";
import { getCountryOptions } from "@/lib/countries";
import { PageTitle, Panel } from "../_components/ui";
import { AdminIcon } from "../_components/icons";
import ServersManager from "./_components/ServersManager.client";

export const dynamic = "force-dynamic";

export default async function AdminServersPage() {
  const result = await adminListServersAction({ limit: 100 });
  // Real origin countries only — "WW" is a reach, not an origin (the API maps an
  // empty/global selection to a default origin with global reach).
  const countryOptions = getCountryOptions("en", undefined, { includeWorldwide: false });

  return (
    <div>
      <PageTitle
        title="Servers"
        blurb="Editorial catalog listings — created here carry no owner until a claim is approved."
      />

      {!result.ok ? (
        <Panel title="Catalog unavailable">
          <div className="flex items-start gap-3 font-body text-[13px] text-muted">
            <AdminIcon name="alert" size={16} className="mt-0.5 text-danger" />
            <div>
              <p className="m-0 text-foreground">Couldn&apos;t load servers from the API.</p>
              <p className="mt-1 font-mono text-[11px]">
                {result.code} — {result.message}
              </p>
            </div>
          </div>
        </Panel>
      ) : (
        <ServersManager initialServers={result.data.servers} countryOptions={countryOptions} />
      )}
    </div>
  );
}
