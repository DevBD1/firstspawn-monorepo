import { redirect } from "next/navigation";
import { resolveLocaleParam } from "@/lib/resolve-locale";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const query = await searchParams;
  const nextPath = typeof query.next === "string" ? query.next : undefined;
  const redirectPath = nextPath
    ? `/${lang}/signup?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/signup`;

  redirect(redirectPath);
}
