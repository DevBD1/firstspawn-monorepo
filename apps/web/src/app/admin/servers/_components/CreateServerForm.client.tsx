"use client";

import { useState, useTransition } from "react";
import {
  adminCreateServerAction,
  type AdminAuthMode,
  type AdminCatalogStatus,
  type AdminReachScope,
  type AdminServerDetail,
  type CreateServerInput,
} from "@/app/actions/admin";
import { AdminIcon } from "../../_components/icons";
import { SectionLabel } from "../../_components/ui";

interface CountryOption {
  code: string;
  name: string;
}

const inputClass =
  "w-full rounded-[var(--radius-control)] border border-border bg-input-bg px-3 py-2 font-ui text-[13px] text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted";
const labelClass = "mb-1.5 block font-ui text-[12px] font-semibold text-foreground";
const hintClass = "mt-1 font-mono text-[10.5px] text-muted";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 font-mono text-[11px] text-danger">{message}</p>;
}

export default function CreateServerForm({
  countryOptions,
  onCreated,
  onCancel,
}: {
  countryOptions: CountryOption[];
  onCreated: (server: AdminServerDetail) => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("25565");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [reachScope, setReachScope] = useState<AdminReachScope | "">("");
  const [authMode, setAuthMode] = useState<AdminAuthMode>("official");
  const [status, setStatus] = useState<AdminCatalogStatus>("active");
  const [version, setVersion] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldError(undefined);

    const portNum = Number.parseInt(port, 10);
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      setFieldError("port");
      setFormError("Port must be a number between 1 and 65535.");
      return;
    }

    const input: CreateServerInput = {
      name: name.trim(),
      host: host.trim(),
      port: portNum,
      description: description.trim(),
      status,
      auth_mode: authMode,
    };
    if (slug.trim()) input.slug = slug.trim();
    if (countryCode) input.country_code = countryCode;
    if (reachScope) input.reach_scope = reachScope;
    if (logoUrl.trim()) input.logo_url = logoUrl.trim();
    if (bannerUrl.trim()) input.banner_url = bannerUrl.trim();
    if (version.trim()) {
      input.supported_clients = [{ client_name: "mc_java", client_version: version.trim() }];
    }

    startTransition(async () => {
      const result = await adminCreateServerAction(input);
      if (result.ok) {
        onCreated(result.data);
      } else {
        setFieldError(result.field);
        setFormError(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-panel)] border border-border bg-bg-panel p-5 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <SectionLabel>New editorial server</SectionLabel>
          <span className="font-mono text-[11px] text-muted">
            owner is null until a claim is approved
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-border text-muted transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <AdminIcon name="x" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="srv-name">
            Server name *
          </label>
          <input
            id="srv-name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aether Realms"
            maxLength={64}
            required
          />
          <FieldError message={fieldError === "name" ? (formError ?? undefined) : undefined} />
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-host">
            Host / address *
          </label>
          <input
            id="srv-host"
            className={inputClass}
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="play.aether.gg"
            maxLength={255}
            required
          />
          <FieldError message={fieldError === "host" ? (formError ?? undefined) : undefined} />
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-port">
            Port *
          </label>
          <input
            id="srv-port"
            className={inputClass}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            inputMode="numeric"
            placeholder="25565"
            required
          />
          <FieldError message={fieldError === "port" ? (formError ?? undefined) : undefined} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="srv-desc">
            Description *
          </label>
          <textarea
            id="srv-desc"
            className={`${inputClass} min-h-[80px] resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short, honest summary of the server."
            maxLength={4000}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-country">
            Origin country
          </label>
          <select
            id="srv-country"
            className={inputClass}
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="">Unspecified (global reach)</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className={hintClass}>Empty → default origin with global reach.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-reach">
            Reach
          </label>
          <select
            id="srv-reach"
            className={inputClass}
            value={reachScope}
            onChange={(e) => setReachScope(e.target.value as AdminReachScope | "")}
          >
            <option value="">Auto</option>
            <option value="local">Local</option>
            <option value="regional">Regional</option>
            <option value="global">Global</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-auth">
            Auth mode
          </label>
          <select
            id="srv-auth"
            className={inputClass}
            value={authMode}
            onChange={(e) => setAuthMode(e.target.value as AdminAuthMode)}
          >
            <option value="official">Official (premium)</option>
            <option value="offline_allowed">Offline allowed (cracked)</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-status">
            Initial status
          </label>
          <select
            id="srv-status"
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as AdminCatalogStatus)}
          >
            <option value="active">Active (public)</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-version">
            Supported version
          </label>
          <input
            id="srv-version"
            className={inputClass}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.21.x"
            maxLength={50}
          />
          <p className={hintClass}>Optional · Java client</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-slug">
            Slug
          </label>
          <input
            id="srv-slug"
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from name"
            maxLength={120}
          />
          <FieldError message={fieldError === "slug" ? (formError ?? undefined) : undefined} />
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-logo">
            Logo URL
          </label>
          <input
            id="srv-logo"
            className={inputClass}
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…"
            maxLength={2048}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="srv-banner">
            Banner URL
          </label>
          <input
            id="srv-banner"
            className={inputClass}
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://…"
            maxLength={2048}
          />
        </div>
      </div>

      {formError && !fieldError && (
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-danger/40 bg-danger/10 px-3 py-2 font-ui text-[12.5px] text-danger">
          <AdminIcon name="alert" size={15} />
          {formError}
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-[38px] items-center rounded-[var(--radius-control)] border border-border bg-transparent px-4 font-ui text-[13px] font-semibold text-foreground transition-[filter] hover:brightness-110"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[38px] items-center gap-2 rounded-[var(--radius-control)] border border-primary-hover bg-primary px-4 font-ui text-[13px] font-bold text-on-primary transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          <AdminIcon name={pending ? "refresh" : "plus"} size={15} />
          {pending ? "Creating…" : "Create server"}
        </button>
      </div>
    </form>
  );
}
